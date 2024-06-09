import {
  Controller,
  Delete,
  // Get,
  Param,
  Post,
  Put,
  UploadedFile,
  UploadedFiles,
  UseGuards,
  UseInterceptors
} from '@nestjs/common'
import { FileInterceptor, FilesInterceptor } from '@nestjs/platform-express'
import { AttachmentService } from './attachment.service'
import { JwtAuthGuard } from 'src/auth/jwt-guard'
import { ApiTags } from '@nestjs/swagger'
import { ROUTES } from 'src/common/constants'
import { MAX_COUNT_FILE, allFileUploadOptions, imageUploadOptions } from 'src/config/file-upload.config'

@Controller(ROUTES.ATTACHMENT.BASE)
@ApiTags('Attachment API')
export class AttachmentController {
  constructor(private readonly attachmentService: AttachmentService) {}

  @Post(ROUTES.ATTACHMENT.UPLOAD_IMAGE)
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(FileInterceptor('file', imageUploadOptions))
  async uploadImage(@UploadedFile() file: Express.Multer.File) {
    const key = await this.attachmentService.uploadFile(file.originalname, file.buffer)
    const url = await this.attachmentService.getSignedUrl(key)
    return { key, url }
  }

  @Post(ROUTES.ATTACHMENT.UPLOAD)
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(FileInterceptor('file', allFileUploadOptions))
  async uploadFile(@UploadedFile() file: Express.Multer.File) {
    const key = await this.attachmentService.uploadFile(file.originalname, file.buffer)
    const url = await this.attachmentService.getSignedUrl(key)
    return { key, url }
  }

  @Post(ROUTES.ATTACHMENT.UPLOADS)
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(FilesInterceptor('files', MAX_COUNT_FILE, allFileUploadOptions))
  async uploadMultipleFiles(@UploadedFiles() files: Express.Multer.File[]) {
    const uploadPromises = files.map((file) => this.attachmentService.uploadFile(file.originalname, file.buffer))
    const keys = await Promise.all(uploadPromises)
    const urls = await Promise.all(keys.map((key) => this.attachmentService.getSignedUrl(key)))
    return keys.map((key, index) => ({ key, url: urls[index] }))
  }

  @Delete(ROUTES.ATTACHMENT.DELETE)
  @UseGuards(JwtAuthGuard)
  async deleteFile(@Param('folder') folder: string, @Param('key') key: string) {
    await this.attachmentService.deleteFile(folder, key)
    return { message: 'File deleted successfully' }
  }

  @Put(ROUTES.ATTACHMENT.UPDATE)
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(FileInterceptor('file', allFileUploadOptions))
  async updateFile(
    @Param('folder') folder: string,
    @Param('key') key: string,
    @UploadedFile() file: Express.Multer.File
  ) {
    await this.attachmentService.deleteFile(folder, key)
    const newKey = await this.attachmentService.uploadFile(file.originalname, file.buffer)
    const url = await this.attachmentService.getSignedUrl(newKey)
    return { key: newKey, url }
  }

  // @Get('download/:key')
  // async downloadFile(@Param('key') key: string) {
  //   const url = await this.attachmentService.getSignedUrl(key)
  //   url
  // }
}
