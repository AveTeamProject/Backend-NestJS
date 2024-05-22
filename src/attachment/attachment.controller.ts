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
import { ROUTES } from 'src/common/constants'
import { ApiTags } from '@nestjs/swagger'

@Controller(ROUTES.ATTACHMENT.BASE)
@ApiTags('Attachment API')
export class AttachmentController {
  constructor(private readonly attachmentService: AttachmentService) {}

  @Post(ROUTES.ATTACHMENT.UPLOAD)
  @UseGuards(JwtAuthGuard)
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
    console.log(file)
    const uploadedAttachment = await this.attachmentService.upload(request, file.originalname, file.buffer)
    return { data: uploadedAttachment }
  }

  @Delete(ROUTES.ATTACHMENT.DELETE)
  @UseGuards(JwtAuthGuard)
  async delete(
    @Query('fileName') fileName: string,
    @Req()
    request
  ) {
    await this.attachmentService.delete(request, fileName)
    return { message: 'File deleted successfully' }
  }
}
