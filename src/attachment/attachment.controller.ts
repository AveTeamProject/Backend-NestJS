import {
  Controller,
  Delete,
  ParseFilePipe,
  Post,
  Query,
  Req,
  UploadedFile,
  UseGuards,
  UseInterceptors
} from '@nestjs/common'
import { FileInterceptor } from '@nestjs/platform-express'
import { AttachmentService } from './attachment.service'
import { JwtAuthGuard } from 'src/auth/jwt-guard'
import { ApiTags } from '@nestjs/swagger'
import { ROLES } from 'src/enums'
import { Roles } from 'src/decorators/roles.decorator'
import { ROUTES } from 'src/common/constants'
import { RolesGuard } from 'src/auth/roles.guard'

@Controller(ROUTES.ATTACHMENT.BASE)
@ApiTags('Attachment API')
export class AttachmentController {
  constructor(private readonly attachmentService: AttachmentService) {}

  @Post(ROUTES.ATTACHMENT.UPLOAD)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(ROLES.ADMIN)
  @UseInterceptors(FileInterceptor('file'))
  async uploadFile(
    @UploadedFile(
      new ParseFilePipe({
        // validators: [new MaxFileSizeValidator({ maxSize: 1000 }), new FileTypeValidator({ fileType: 'image/jpeg' })]
      })
    )
    file: Express.Multer.File,
    @Req()
    request
  ) {
    const uploadedAttachment = await this.attachmentService.upload(request, file.originalname, file.buffer)
    return { data: uploadedAttachment }
  }

  @Delete(ROUTES.ATTACHMENT.DELETE)
  @UseGuards(JwtAuthGuard)
  async delete(
    @Query('id') fileId: string,
    @Req()
    request
  ) {
    await this.attachmentService.delete(request, fileId)
    return { message: 'File deleted successfully' }
  }
}
