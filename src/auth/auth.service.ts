import { Injectable, UnauthorizedException } from '@nestjs/common'
import { User } from 'src/entities/user.entity'
import { UpdateResult } from 'typeorm'
import * as speakeasy from 'speakeasy'
import { JwtService } from '@nestjs/jwt'
import { UserService } from 'src/user/user.service'
import { ConfigService } from '@nestjs/config'
import { LoginDTO } from './dto/login.dto'
import * as bcrypt from 'bcryptjs'
import { Enable2FAType, JwtPayload } from './types'
import { RefreshTokenDTO } from './dto/refresh-token.dto'

type LoginResponse =
  | {
      accessToken: string
      refreshToken: string
    }
  | { validate2FA: string; message: string }

@Injectable()
export class AuthService {
  constructor(
    private userService: UserService,
    private jwtService: JwtService,
    private configService: ConfigService
  ) {}

  async login(loginDTO: LoginDTO): Promise<LoginResponse> {
    const user = await this.userService.findOne(loginDTO) // 1.
    const passwordMatched = await bcrypt.compare(loginDTO.password, user.password)

    if (passwordMatched) {
      delete user.password
      const payload: JwtPayload = { email: user.email, userId: user.id, roles: user.roles.map((role) => role.roleName) }
      const accessToken = this.jwtService.sign(payload, {
        secret: this.configService.get<string>('jwtSecret'),
        expiresIn: this.configService.get<string>('jwtAccessExpiresIn')
      })

      const refreshToken = this.jwtService.sign(payload, {
        secret: this.configService.get<string>('jwtRefreshSecret'),
        expiresIn: this.configService.get<string>('jwtRefreshExpiresIn')
      })

      return {
        accessToken,
        refreshToken
      }
    } else {
      throw new UnauthorizedException('Password does not match') // 5.
    }
  }

  async refreshToken(refreshTokenDTO: RefreshTokenDTO): Promise<{ accessToken: string }> {
    const { refreshToken } = refreshTokenDTO

    try {
      const payload = this.jwtService.verify(refreshToken, {
        secret: this.configService.get<string>('jwtRefreshSecret')
      })

      const newPayload = { email: payload.email, userId: payload.userId, role: payload.roles }

      const newAccessToken = this.jwtService.sign(newPayload, {
        secret: this.configService.get<string>('jwtSecret'),
        expiresIn: this.configService.get<string>('jwtAccessExpiresIn')
      })

      return {
        accessToken: newAccessToken
      }
    } catch (e) {
      throw new UnauthorizedException('Invalid refresh token')
    }
  }

  async enable2FA(userId: string): Promise<Enable2FAType> {
    const user = await this.userService.findById(userId) //1
    if (user.enable2FA) {
      //2
      return { secret: user.twoFASecret }
    }
    const secret = speakeasy.generateSecret() //3
    console.log(secret)
    user.twoFASecret = secret.base32 //4
    await this.userService.updateSecretKey(user.id, user.twoFASecret) //5
    return { secret: user.twoFASecret } //6
  }
  async validate2FAToken(userId: string, token: string): Promise<{ verified: boolean }> {
    try {
      // find the user on the based on id
      const user = await this.userService.findById(userId)

      // extract his 2FA secret

      // verify the secret with token by calling the speakeasy verify method
      const verified = speakeasy.totp.verify({
        secret: user.twoFASecret,
        token: token,
        encoding: 'base32'
      })

      // if validated then sends the json web token in the response
      if (verified) {
        return { verified: true }
      } else {
        return { verified: false }
      }
    } catch (err) {
      throw new UnauthorizedException('Error verifying token')
    }
  }
  async disable2FA(userId: string): Promise<UpdateResult> {
    return this.userService.disable2FA(userId)
  }
  async validateUserByApiKey(apiKey: string): Promise<User> {
    return this.userService.findByApiKey(apiKey)
  }
  getEnvVariable() {
    return this.configService.get<number>('port')
  }
}
