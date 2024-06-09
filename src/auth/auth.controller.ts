import { Body, Post, Controller, Get, UseGuards, Req, HttpStatus, Request, Response, UseInterceptors, Logger } from '@nestjs/common'
import { UserService } from 'src/user/user.service'
import { AuthService } from './auth.service'
import { CreateUserDTO } from 'src/user/dto/create-user.dto'
// import { AuthGuard } from '@nestjs/passport'
// import { UpdateResult } from 'typeorm'
import { JwtAuthGuard } from './jwt-guard'
// eslint-disable-next-line @typescript-eslint/no-unused-vars
// import { ValidateTokenDTO } from './dto/validate-token.dto'
// import { Enable2FAType } from './types'
import { LoginDTO } from './dto/login.dto'
import { ApiBearerAuth, ApiCookieAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger'
import { RefreshTokenDTO } from './dto/refresh-token.dto'
import { ROUTES } from 'src/common/constants'
import { UserResponseDTO } from 'src/user/dto/user-response-dto'
import { RolesGuard } from './roles.guard'
import { Roles } from '../decorators/roles.decorator'
import { Public } from 'src/decorators/global.decorator'
import { ROLES } from 'src/enums'
import { ExampleException } from 'src/custom-exceptions/example-exception'
import { CookieInterceptor } from 'src/middleware/cookie-interceptor'

@Controller(ROUTES.AUTH.BASE)
@ApiTags('Auth API')
@ApiCookieAuth()
export class AuthController {
  private readonly logger = new Logger(AuthController.name);
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
  async signup(
    @Body()
    userDTO: CreateUserDTO
  ): Promise<UserResponseDTO> {
    try {
      return await this.userService.create(userDTO)
    } catch (error) {
      this.logger.error(error)
    }
  }

  @Post(ROUTES.AUTH.LOGIN)
  @Public()
  @UseInterceptors(CookieInterceptor)
  async login(
    @Body()
    loginDTO: LoginDTO
  ) {
    try {
      return await this.authService.login(loginDTO)
    } catch (error) {
      this.logger.error(error)
    }
  }

  @Post(ROUTES.AUTH.REFRESH_TOKEN)
  @UseInterceptors(CookieInterceptor)
  async refreshToken(
    @Request()
    req
  ) {
    try {
      const refreshTokenDTO = new RefreshTokenDTO()
      refreshTokenDTO.refreshToken = req.cookies.refreshToken
      return await this.authService.refreshToken(refreshTokenDTO)
    } catch (error) {
      this.logger.error(error)
    }
  }

  @UseGuards(JwtAuthGuard)
  @Post(ROUTES.AUTH.LOGOUT)
  async logout(
    @Response()
    res
  ) {
    try {
	    res.clearCookie('accessToken')
	    res.clearCookie('refreshToken')
	    return res.status(200).json({
	      code: 200,
	      message: 'Success'
	    })
    } catch (error) {
      this.logger.error(error)
    }
  }

  @Get(ROUTES.AUTH.PROFILE)
  @ApiBearerAuth('JWT-auth')
  @UseGuards(JwtAuthGuard)
  getProfile(
    @Req()
    request
  ) {
    try {
      return request.user
    } catch (error) {
      this.logger.error(error)
    }
  }

  @Post(ROUTES.AUTH.SEND_CODE)
  @Public()
  sendCode(@Body() { email }: { email: string }) {
    return this.authService.sendCode(email)
  }

  @Post(ROUTES.AUTH.RESET_PASSWORD)
  @Public()
  resetPassword(@Body() { code, newPassword }: { code: string; newPassword: string }) {
    return this.authService.updatePassword(code, newPassword)
  }

  @Get('test')
  @UseGuards(JwtAuthGuard, RolesGuard) // Ensure correct order
  @Roles(ROLES.ADMIN)
  testEnvVariable() {
    try {
      return this.authService.getEnvVariable()
    } catch (error) {
      this.logger.error(error)
    }
  }

  @Get('testCustomException')
  testCustomException(): string | void {
    try {
      throw new ExampleException('Custom message', HttpStatus.NOT_FOUND)
    } catch (error) {
      this.logger.error(error)
    }
  }
}
