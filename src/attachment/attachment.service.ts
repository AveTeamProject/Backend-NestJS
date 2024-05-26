import { Injectable, NotFoundException } from '@nestjs/common'
import { S3Client, GetObjectCommand, DeleteObjectCommand } from '@aws-sdk/client-s3'
import { Upload } from '@aws-sdk/lib-storage'
import { ConfigService } from '@nestjs/config'
import { getSignedUrl } from '@aws-sdk/s3-request-presigner'
import { v4 as uuid4 } from 'uuid'
import { InjectRepository } from '@nestjs/typeorm'
import { Attachment } from '../entities/attachment.entity'
import { Repository } from 'typeorm'
import { User } from 'src/entities/user.entity'
import { AttachmentResponseDTO } from './dto/attachment-response.dto'
import { CommonService } from 'src/common/common.service'
import { UserResponseDTO } from 'src/user/dto/user-response-dto'
import { Readable } from 'stream'

@Injectable()
export class AttachmentService {
  private readonly s3Client = new S3Client({ region: this.configService.getOrThrow<string>('awsRegion') })
  constructor(
    private readonly configService: ConfigService,

    @InjectRepository(Attachment)
    private readonly attachmentRepository: Repository<Attachment>,

    @InjectRepository(User)
    private readonly userRepository: Repository<User>,

    private readonly commonService: CommonService
  ) {}

  async upload(request: any, fileName: string, file: Buffer): Promise<AttachmentResponseDTO> {
    const uniqueId = uuid4()
    const key = uniqueId + '/' + fileName

    // Transfer Buffer to Stream
    const fileStream = new Readable()
    fileStream.push(file)
    fileStream.push(null)

    // Create an instance for Upload
    const upload = new Upload({
      client: this.s3Client,
      params: {
        Bucket: this.configService.getOrThrow<string>('awsBucketName'),
        Key: key,
        Body: fileStream
      }
    })

    await upload.done()

    // Create public url
    const command = new GetObjectCommand({
      Bucket: this.configService.getOrThrow<string>('awsBucketName'),
      Key: key
    })

    const signedUrl = await getSignedUrl(this.s3Client, command, { expiresIn: 36000 }) // expired time is in 10 hours

    const currentUser = await this.userRepository.findOneBy({ id: request.user.userId })
    const attachmentObj = new Attachment()
    attachmentObj.id = uniqueId
    attachmentObj.fileName = fileName
    attachmentObj.owner = currentUser
    attachmentObj.publicUrl = signedUrl
    attachmentObj.updatedAt = new Date()

    const savedAttachment = await this.attachmentRepository.save(attachmentObj)
    const attachmentResponse = this.commonService.mapper(
      savedAttachment,
      AttachmentResponseDTO
    ) as AttachmentResponseDTO
    attachmentResponse.owner = this.commonService.mapper(attachmentResponse.owner, UserResponseDTO) as UserResponseDTO

    return attachmentResponse
  }

  async delete(request: any, fileId: string): Promise<void> {
    const ownerId = request.user.userId

    const existAttachment = await this.attachmentRepository.findOneBy({ id: fileId, isDeleted: false })

    if (existAttachment === null) {
      throw new NotFoundException('File Not Found')
    }

    if (existAttachment) {
      await this.s3Client.send(
        new DeleteObjectCommand({
          Bucket: this.configService.getOrThrow<string>('awsBucketName'),
          Key: `${ownerId}-${existAttachment.fileName}`
        })
      )
    }

    this.attachmentRepository.update(
      { id: existAttachment.id },
      {
        updatedAt: new Date(),
        isDeleted: true
      }
    )
  }
}
