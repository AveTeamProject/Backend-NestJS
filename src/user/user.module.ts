import { Module } from '@nestjs/common'
import { UserService } from './user.service'
import { TypeOrmModule } from '@nestjs/typeorm'
import { User } from '../entities/user.entity'
import { Role } from 'src/entities/role.entity'
import { CommonModule } from 'src/common/common.module'

@Module({
  imports: [TypeOrmModule.forFeature([User, Role]), CommonModule],
  providers: [UserService],
  exports: [UserService]
})
export class UserModule {}
