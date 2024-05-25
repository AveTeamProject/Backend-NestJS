import { Module } from '@nestjs/common'
import { AttachmentService } from './attachment.service'
import { AttachmentController } from './attachment.controller'
import { TypeOrmModule } from '@nestjs/typeorm'
import { Attachment } from '../entities/attachment.entity'
import { User } from 'src/entities/user.entity'
import { CommonModule } from 'src/common/common.module'

@Module({
  imports: [TypeOrmModule.forFeature([Attachment, User]), CommonModule],
  providers: [AttachmentService],
  controllers: [AttachmentController]
})
export class AttachmentModule {}
