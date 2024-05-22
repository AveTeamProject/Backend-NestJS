import { Injectable, NotFoundException } from '@nestjs/common'
import { PutObjectCommand, S3Client, GetObjectCommand, DeleteObjectCommand } from '@aws-sdk/client-s3'
import { ConfigService } from '@nestjs/config'
import { getSignedUrl } from '@aws-sdk/s3-request-presigner'
import { v4 as uuid4 } from 'uuid'
import { InjectRepository } from '@nestjs/typeorm'
import { Attachment } from './attachment.entity'
import { Repository } from 'typeorm'
import { User } from 'src/user/user.entity'

@Injectable()
export class AttachmentService {
  private readonly s3Client = new S3Client({ region: this.configService.getOrThrow('AWS_REGION') })
  constructor(
    private readonly configService: ConfigService,
    @InjectRepository(Attachment)
    private readonly attachmentRepository: Repository<Attachment>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>
  ) {}

  async upload(request: any, fileName: string, file: Buffer): Promise<Attachment> {
    const uniqueId = uuid4()

    const uniqueFileName = `${uniqueId}-${fileName}`
    await this.s3Client.send(
      new PutObjectCommand({
        Bucket: process.env.AWS_BUCKET_NAME,
        Key: uniqueFileName,
        Body: file
      })
    )

    // create public url
    const command = new GetObjectCommand({
      Bucket: process.env.AWS_BUCKET_NAME,
      Key: uniqueFileName
    })

    const signedUrl = await getSignedUrl(this.s3Client, command, { expiresIn: 36000 }) // expired time is in 10 hours

    const currentUser = await this.userRepository.findOneBy({ id: request.user.userId })

    const attachmentObj = new Attachment()
    attachmentObj.id = uniqueId
    attachmentObj.fileName = fileName
    attachmentObj.owner = currentUser
    attachmentObj.publicUrl = signedUrl
    attachmentObj.updatedAt = new Date()

    this.attachmentRepository.save(attachmentObj)
    return attachmentObj
  }

  async delete(request: any, fileName: string): Promise<void> {
    const ownerId = request.user.userId

    const existAttachment = await this.attachmentRepository.findOneBy({ owner: ownerId, isDeleted: false })

    if (existAttachment === null) {
      throw new NotFoundException('File Not Found')
    }

    if (existAttachment) {
      await this.s3Client.send(
        new DeleteObjectCommand({
          Bucket: process.env.AWS_BUCKET_NAME,
          Key: `${ownerId}-${fileName}`
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
