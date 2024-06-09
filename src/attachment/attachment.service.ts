import { Injectable, InternalServerErrorException } from '@nestjs/common'
import { S3Client, GetObjectCommand, DeleteObjectCommand } from '@aws-sdk/client-s3'
import { Upload } from '@aws-sdk/lib-storage'
import { ConfigService } from '@nestjs/config'
import { getSignedUrl } from '@aws-sdk/s3-request-presigner'
import { InjectRepository } from '@nestjs/typeorm'
import { Attachment } from '../entities/attachment.entity'
import { Repository } from 'typeorm'
import { Readable } from 'stream'
import { v4 as uuidv4 } from 'uuid'
@Injectable()
export class AttachmentService {
  private readonly s3Client = new S3Client({ region: this.configService.getOrThrow<string>('awsRegion') })
  constructor(
    private readonly configService: ConfigService,

    @InjectRepository(Attachment)
    private readonly attachmentRepository: Repository<Attachment>
  ) {}

  async uploadFile(fileName: string, file: Buffer): Promise<string> {
    const uniqueId = uuidv4()
    const key = `${uniqueId}/${fileName}`

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

    return key
  }

  async uploadMultipleFiles(files: Array<{ fileName: string; file: Buffer }>): Promise<string[]> {
    const uploadPromises = files.map((file) => this.uploadFile(file.fileName, file.file))
    return Promise.all(uploadPromises)
  }

  async getSignedUrl(key: string): Promise<string> {
    const command = new GetObjectCommand({
      Bucket: this.configService.getOrThrow<string>('awsBucketName'),
      Key: key
    })

    return getSignedUrl(this.s3Client, command, { expiresIn: 36000 })
  }

  async deleteFile(folder: string, key: string): Promise<void> {
    const command = new DeleteObjectCommand({
      Bucket: this.configService.getOrThrow<string>('awsBucketName'),
      Key: folder + '/' + key
    })

    try {
      await this.s3Client.send(command)
    } catch (err) {
      throw new InternalServerErrorException('Failed to delete file from S3')
    }
  }
}
