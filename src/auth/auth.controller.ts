import { Body, Post, Controller, Get, Request, UseGuards, Req } from '@nestjs/common'
import { UserService } from 'src/user/user.service'
import { AuthService } from './auth.service'
import { CreateUserDTO } from 'src/user/dto/create-user.dto'
import { User } from 'src/user/user.entity'
import { AuthGuard } from '@nestjs/passport'
import { UpdateResult } from 'typeorm'
import { JwtAuthGuard } from './jwt-guard'
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { ValidateTokenDTO } from './dto/validate-token.dto'
import { Enable2FAType } from './types'
import { LoginDTO } from './dto/login.dto'
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger'

@Controller('auth')
@ApiTags('Auth API')
export class AuthController {
  constructor(
    private userService: UserService,
    private authService: AuthService
  ) {}

  @Post('signup')
  @ApiOperation({ summary: 'Register new user' })
  @ApiResponse({
    status: 200,
    description: 'It will return the user in the response'
  })
  signup(
    @Body()
    userDTO: CreateUserDTO
  ): Promise<User> {
    return this.userService.create(userDTO)
  }
  @Post('login')
  login(
    @Body()
    loginDTO: LoginDTO
  ) {
    return this.authService.login(loginDTO)
  }

  @Get('enable-2fa')
  @UseGuards(JwtAuthGuard)
  enable2FA(
    @Request()
    req
  ): Promise<Enable2FAType> {
    return this.authService.enable2FA(req.user.userId)
  }

  @Post('validate-2fa')
  @UseGuards(JwtAuthGuard)
  validate2FA(
    @Request()
    req,
    @Body()
    ValidateTokenDTO: ValidateTokenDTO
  ): Promise<{ verified: boolean }> {
    return this.authService.validate2FAToken(req.user.userId, ValidateTokenDTO.token)
  }
  @Get('disable-2fa')
  @UseGuards(JwtAuthGuard)
  disable2FA(
    @Request()
    req
  ): Promise<UpdateResult> {
    return this.authService.disable2FA(req.user.userId)
  }

  @Get('profile')
  @ApiBearerAuth('JWT-auth')
  @UseGuards(JwtAuthGuard)
  getProfile(
    @Req()
    request
  ) {
    return request.user
  }

  @Get('profile-via-api-key')
  @UseGuards(AuthGuard('bearer'))
  getProfileViaApiKey(
    @Request()
    req
  ) {
    delete req.user.password
    return {
      msg: 'authenticated with api key',
      user: req.user
    }
  }

  @Get('test')
  testEnvVariable() {
    return this.authService.getEnvVariable()
  }
}
