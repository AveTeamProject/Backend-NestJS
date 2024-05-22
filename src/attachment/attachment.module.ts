import { Module } from '@nestjs/common'
import { AttachmentService } from './attachment.service'
import { AttachmentController } from './attachment.controller'
import { TypeOrmModule } from '@nestjs/typeorm'
import { Attachment } from './attachment.entity'
import { User } from 'src/user/user.entity'

@Module({
  imports: [TypeOrmModule.forFeature([Attachment, User])],
  providers: [AttachmentService],
  controllers: [AttachmentController]
})
export class AttachmentModule {}
