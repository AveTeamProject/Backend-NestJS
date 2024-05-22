import { Body, Post, Controller, Get, UseGuards, Req } from '@nestjs/common'
import { UserService } from 'src/user/user.service'
import { AuthService } from './auth.service'
import { CreateUserDTO } from 'src/user/dto/create-user.dto'
import { User } from 'src/user/user.entity'
// import { AuthGuard } from '@nestjs/passport'
// import { UpdateResult } from 'typeorm'
import { JwtAuthGuard } from './jwt-guard'
// eslint-disable-next-line @typescript-eslint/no-unused-vars
// import { ValidateTokenDTO } from './dto/validate-token.dto'
// import { Enable2FAType } from './types'
import { LoginDTO } from './dto/login.dto'
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger'
import { RefreshTokenDTO } from './dto/refrestToken.dto'
import { ROUTES } from 'src/common/constants'

@Controller(ROUTES.AUTH.BASE)
@ApiTags('Auth API')
export class AuthController {
  constructor(
    private userService: UserService,
    private authService: AuthService
  ) {}

  @Post(ROUTES.AUTH.SIGNUP)
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

  @Post(ROUTES.AUTH.LOGIN)
  login(
    @Body()
    loginDTO: LoginDTO
  ) {
    return this.authService.login(loginDTO)
  }

  @Post(ROUTES.AUTH.REFRESH_TOKEN)
  refreshToken(
    @Body()
    refreshTokenDTO: RefreshTokenDTO
  ) {
    return this.authService.refreshToken(refreshTokenDTO)
  }

  @Get(ROUTES.AUTH.PROFILE)
  @ApiBearerAuth('JWT-auth')
  @UseGuards(JwtAuthGuard)
  getProfile(
    @Req()
    request
  ) {
    return request.user
  }

  @Get('test')
  testEnvVariable() {
    return this.authService.getEnvVariable()
  }
}
