import {
  Controller,
  Delete,
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
import { ApiTags, ApiOperation, ApiResponse, ApiConsumes, ApiBody, ApiParam } from '@nestjs/swagger'
import { ROUTES } from 'src/common/constants'
import { MAX_COUNT_FILE, allFileUploadOptions, imageUploadOptions } from 'src/config/file-upload.config'

@Controller(ROUTES.ATTACHMENT.BASE)
@ApiTags('Attachment API')
export class AttachmentController {
  constructor(private readonly attachmentService: AttachmentService) {}

  @Post(ROUTES.ATTACHMENT.UPLOAD_IMAGE)
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(FileInterceptor('file', imageUploadOptions))
  @ApiOperation({ summary: 'Upload an image' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: {
          type: 'string',
          format: 'binary'
        }
      }
    }
  })
  @ApiResponse({ status: 201, description: 'Image uploaded successfully' })
  async uploadImage(@UploadedFile() file: Express.Multer.File) {
    const key = await this.attachmentService.uploadFile(file.originalname, file.buffer)
    const url = await this.attachmentService.getSignedUrl(key)
    return { key, url }
  }

  @Post(ROUTES.ATTACHMENT.UPLOAD)
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(FileInterceptor('file', allFileUploadOptions))
  @ApiOperation({ summary: 'Upload a file' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: {
          type: 'string',
          format: 'binary'
        }
      }
    }
  })
  @ApiResponse({ status: 201, description: 'File uploaded successfully' })
  async uploadFile(@UploadedFile() file: Express.Multer.File) {
    const key = await this.attachmentService.uploadFile(file.originalname, file.buffer)
    const url = await this.attachmentService.getSignedUrl(key)
    return { key, url }
  }

  @Post(ROUTES.ATTACHMENT.UPLOADS)
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(FilesInterceptor('files', MAX_COUNT_FILE, allFileUploadOptions))
  @ApiOperation({ summary: 'Upload multiple files' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        files: {
          type: 'array',
          items: {
            type: 'string',
            format: 'binary'
          }
        }
      }
    }
  })
  @ApiResponse({ status: 201, description: 'Files uploaded successfully' })
  async uploadMultipleFiles(@UploadedFiles() files: Express.Multer.File[]) {
    const uploadPromises = files.map((file) => this.attachmentService.uploadFile(file.originalname, file.buffer))
    const keys = await Promise.all(uploadPromises)
    const urls = await Promise.all(keys.map((key) => this.attachmentService.getSignedUrl(key)))
    return keys.map((key, index) => ({ key, url: urls[index] }))
  }

  @Delete(ROUTES.ATTACHMENT.DELETE)
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Delete a file' })
  @ApiParam({ name: 'folder', required: true, description: 'The folder of the file to delete' })
  @ApiParam({ name: 'key', required: true, description: 'The key of the file to delete' })
  @ApiResponse({ status: 200, description: 'File deleted successfully' })
  async deleteFile(@Param('folder') folder: string, @Param('key') key: string) {
    await this.attachmentService.deleteFile(folder, key)
    return { message: 'File deleted successfully' }
  }

  @Put(ROUTES.ATTACHMENT.UPDATE)
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(FileInterceptor('file', allFileUploadOptions))
  @ApiOperation({ summary: 'Update a file' })
  @ApiParam({ name: 'folder', required: true, description: 'The folder of the file to update' })
  @ApiParam({ name: 'key', required: true, description: 'The key of the file to update' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: {
          type: 'string',
          format: 'binary'
        }
      }
    }
  })
  @ApiResponse({ status: 200, description: 'File updated successfully' })
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
}
