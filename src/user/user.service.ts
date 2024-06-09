import { Injectable, UnauthorizedException } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { User } from '../entities/user.entity'
import { MoreThan, Repository, UpdateResult } from 'typeorm'
import { LoginDTO } from 'src/auth/dto/login.dto'
import { CreateUserDTO } from './dto/create-user.dto'
import * as bcrypt from 'bcryptjs'
import { v4 as uuid4 } from 'uuid'
import { UserResponseDTO } from './dto/user-response-dto'
import { Role } from 'src/entities/role.entity'
import { CommonService } from 'src/common/common.service'
import { ROLES } from 'src/enums'
import { MailerService } from '@nestjs-modules/mailer'

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,

    @InjectRepository(Role)
    private readonly roleRepository: Repository<Role>,

    private readonly commonService: CommonService,
    private readonly mailerService: MailerService
  ) {}
  async create(userDTO: CreateUserDTO): Promise<UserResponseDTO> {
    const user = new User()
    user.firstName = userDTO.firstName
    user.lastName = userDTO.lastName
    user.email = userDTO.email
    user.apiKey = uuid4()

    const defaultRole = await this.roleRepository.findOneBy({ roleName: ROLES.MEMBER })
    user.roles = [defaultRole]

    const salt = await bcrypt.genSalt()
    // user.password = await bcrypt.hash(userDTO.password, salt)

    const savedUser = await this.userRepository.save(user)

    if (savedUser) {
      this.mailerService.sendMail({
        to: savedUser.email,
        subject: 'Testing Nest MailerModule ✔',
        template: 'welcome',
        context: {
          name: savedUser.firstName
        }
      })
    }

    const userResponse = this.commonService.mapper(savedUser, UserResponseDTO) as UserResponseDTO
    return userResponse
  }
  async findOne(data: LoginDTO): Promise<User> {
    const user = await this.userRepository.findOne({ where: { email: data.email }, relations: ['roles'] })
    if (!user) {
      throw new UnauthorizedException('Could not find user')
    }
    return user
  }

  async findById(id: string): Promise<User> {
    return this.userRepository.findOneBy({ id })
  }

  async findByEmail(email: string): Promise<User> {
    return this.userRepository.findOneBy({ email })
  }

  async findByVerificationCode(verificationCode: string): Promise<User> {
    return this.userRepository.findOneBy({ verificationCode, verificationCodeExpiredTime: MoreThan(new Date()) })
  }

  async saveCodeAndSendMail(
    user: User,
    verificationCode: string,
    verificationCodeExpiredTime: Date
  ): Promise<UpdateResult> {
    this.mailerService.sendMail({
      to: user.email,
      subject: 'Reset password',
      template: 'forgot-password',
      context: {
        name: user.firstName + user.lastName,
        code: verificationCode
      }
    })
    return this.userRepository.update({ id: user.id }, { verificationCode, verificationCodeExpiredTime })
  }

  async updatePassword(user: User, newPassword: string): Promise<UpdateResult> {
    const salt = await bcrypt.genSalt()
    const hashedPassword = await bcrypt.hash(newPassword, salt)
    return this.userRepository.update(
      { id: user.id },
      { password: hashedPassword, verificationCode: null, verificationCodeExpiredTime: null }
    )
  }

  async updateSecretKey(userId, secret: string): Promise<UpdateResult> {
    return this.userRepository.update(
      { id: userId },
      {
        twoFASecret: secret,
        enable2FA: true
      }
    )
  }

  async disable2FA(userId: string): Promise<UpdateResult> {
    return this.userRepository.update(
      { id: userId },
      {
        enable2FA: false,
        twoFASecret: null
      }
    )
  }

  async findByApiKey(apiKey: string): Promise<User> {
    return this.userRepository.findOneBy({ apiKey })
  }
}
