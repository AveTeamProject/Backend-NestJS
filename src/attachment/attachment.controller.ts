import {
  Controller,
  Delete,
  Logger,
  MaxFileSizeValidator,
  ParseFilePipe,
  Post,
  Query,
  Req,
  UploadedFile,
  UploadedFiles,
  UseGuards,
  UseInterceptors
} from '@nestjs/common'
import { FileInterceptor, FilesInterceptor } from '@nestjs/platform-express'
import { AttachmentService } from './attachment.service'
import { JwtAuthGuard } from 'src/auth/jwt-guard'
import { ApiTags } from '@nestjs/swagger'
import { ROLES } from 'src/enums'
import { Roles } from 'src/decorators/roles.decorator'
import { ROUTES } from 'src/common/constants'
import { RolesGuard } from 'src/auth/roles.guard'
import * as multer from 'multer'

@Controller(ROUTES.ATTACHMENT.BASE)
@ApiTags('Attachment API')
export class AttachmentController {
  private readonly logger = new Logger(AttachmentController.name);
  constructor(private readonly attachmentService: AttachmentService) {}

  @Post(ROUTES.ATTACHMENT.UPLOAD)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(ROLES.ADMIN)
  @UseInterceptors(
    FileInterceptor('file', {
      storage: multer.diskStorage({
        destination: './uploads',
        filename: (req, file, cb) => {
          cb(null, `${Date.now()}-${file.originalname}`)
        }
      })
    })
  )
  async uploadFile(
    @UploadedFile(
      new ParseFilePipe({
        validators: [new MaxFileSizeValidator({ maxSize: 1024 * 1024 })] // maximum size is 1MB
      })
    )
    file: Express.Multer.File,
    @Req()
    request
  ) {
    try {
      const uploadedAttachment = await this.attachmentService.upload(request, file.originalname, file.buffer)
      return { data: uploadedAttachment }
    } catch (error) {
      this.logger.error(error)
    }
  }

  // upload multi file
  @Post(ROUTES.ATTACHMENT.UPLOADS)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(ROLES.ADMIN)
  @UseInterceptors(
    FilesInterceptor('files', 10, {
      storage: multer.diskStorage({
        destination: './uploads',
        filename: (req, file, cb) => {
          cb(null, `${Date.now()}-${file.originalname}`)
        }
      }),
      limits: { fileSize: 1024 * 1024 } // limit 1MB per file
    })
  )
  async uploads(
    @UploadedFiles() files: Express.Multer.File[],
    @Req()
    request
  ) {
    try {
      const medias = []
      for (const file of files) {
        medias.push(await this.attachmentService.upload(request, file.originalname, file.buffer))
      }
      return medias
    } catch (error) {
      this.logger.error(error)
    }
  }

  @Delete(ROUTES.ATTACHMENT.DELETE)
  @UseGuards(JwtAuthGuard)
  async delete(
    @Query('id') fileId: string,
    @Req()
    request
  ) {
    try {
      await this.attachmentService.delete(request, fileId)
      return { message: 'File deleted successfully' }
    } catch (error) {
      this.logger.error(error)
    }
  }
}
