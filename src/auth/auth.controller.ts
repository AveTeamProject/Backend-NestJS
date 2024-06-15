import {
  Body,
  Post,
  Controller,
  Get,
  UseGuards,
  Req,
  HttpStatus,
  Request,
  Response,
  UseInterceptors
} from '@nestjs/common'
import { UserService } from 'src/user/user.service'
import { AuthService } from './auth.service'
import { CreateUserDTO } from 'src/user/dto/create-user.dto'
import { JwtAuthGuard } from './jwt-guard'
import { LoginDTO } from './dto/login.dto'
import { ApiBearerAuth, ApiCookieAuth, ApiOperation, ApiResponse, ApiTags, ApiBody } from '@nestjs/swagger'
import { RefreshTokenDTO } from './dto/refresh-token.dto'
import { ROUTES } from 'src/common/constants'
import { UserResponseDTO } from 'src/user/dto/user-response-dto'
import { RolesGuard } from './roles.guard'
import { Roles } from '../decorators/roles.decorator'
import { Public } from 'src/decorators/global.decorator'
import { ROLES } from 'src/enums'
import { ExampleException } from 'src/custom-exceptions/example-exception'
import { CookieInterceptor } from 'src/middleware/cookie-interceptor'
import { SendCodeDTO } from './dto/send-code.dto'
import { ResetPasswordDTO } from './dto/reset-password.dto'

@Controller(ROUTES.AUTH.BASE)
@ApiTags('Auth API')
@ApiCookieAuth()
export class AuthController {
  constructor(
    private userService: UserService,
    private authService: AuthService
  ) {}

  @Post(ROUTES.AUTH.SIGNUP)
  @ApiOperation({ summary: 'Register new user' })
  @ApiResponse({
    status: 200,
    description: 'User registered successfully',
    type: UserResponseDTO
  })
  @ApiResponse({ status: 400, description: 'Bad Request' })
  async signup(
    @Body()
    userDTO: CreateUserDTO
  ): Promise<UserResponseDTO> {
    return await this.userService.create(userDTO)
  }

  @Post(ROUTES.AUTH.LOGIN)
  @Public()
  @UseInterceptors(CookieInterceptor)
  @ApiOperation({ summary: 'Login user' })
  @ApiResponse({ status: 200, description: 'User logged in successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiBody({
    description: 'User login details',
    type: LoginDTO,
    examples: {
      example1: {
        summary: 'Sample login request',
        value: {
          email: 'user@example.com',
          password: 'password123'
        }
      }
    }
  })
  async login(
    @Body()
    loginDTO: LoginDTO
  ) {
    return await this.authService.login(loginDTO)
  }

  @Post(ROUTES.AUTH.REFRESH_TOKEN)
  @UseInterceptors(CookieInterceptor)
  @ApiOperation({ summary: 'Refresh access token' })
  @ApiResponse({ status: 200, description: 'Token refreshed successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async refreshToken(
    @Request()
    req
  ) {
    const refreshTokenDTO = new RefreshTokenDTO()
    refreshTokenDTO.refreshToken = req.cookies.refreshToken
    return await this.authService.refreshToken(refreshTokenDTO)
  }

  @UseGuards(JwtAuthGuard)
  @Post(ROUTES.AUTH.LOGOUT)
  @ApiOperation({ summary: 'Logout user' })
  @ApiResponse({ status: 200, description: 'User logged out successfully' })
  async logout(
    @Response()
    res
  ) {
    res.clearCookie('accessToken')
    res.clearCookie('refreshToken')
    return res.status(200).json({
      code: 200,
      message: 'Success'
    })
  }

  @Get(ROUTES.AUTH.PROFILE)
  @ApiBearerAuth('JWT-auth')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Get user profile' })
  @ApiResponse({ status: 200, description: 'User profile fetched successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  getProfile(
    @Req()
    request
  ) {
    return request.user
  }

  @Post(ROUTES.AUTH.SEND_CODE)
  @Public()
  @ApiOperation({ summary: 'Send verification code to email' })
  @ApiResponse({ status: 200, description: 'Code sent successfully' })
  @ApiResponse({ status: 400, description: 'Bad Request' })
  @ApiBody({
    description: 'Email address to send the verification code to',
    type: SendCodeDTO,
    examples: {
      example1: {
        summary: 'Sample send code request',
        value: {
          email: 'user@example.com'
        }
      }
    }
  })
  sendCode(@Body() { email }: { email: string }) {
    return this.authService.sendCode(email)
  }

  @Post(ROUTES.AUTH.RESET_PASSWORD)
  @Public()
  @ApiOperation({ summary: 'Reset password with code' })
  @ApiResponse({ status: 200, description: 'Password reset successfully' })
  @ApiResponse({ status: 400, description: 'Bad Request' })
  @ApiBody({
    description: 'Reset password details',
    type: ResetPasswordDTO,
    examples: {
      example1: {
        summary: 'Sample reset password request',
        value: {
          code: '123456',
          newPassword: 'newpassword123'
        }
      }
    }
  })
  resetPassword(@Body() { code, newPassword }: { code: string; newPassword: string }) {
    return this.authService.updatePassword(code, newPassword)
  }

  @Get('test')
  @UseGuards(JwtAuthGuard, RolesGuard) // Ensure correct order
  @Roles(ROLES.ADMIN)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Test environment variable (Admin only)' })
  @ApiResponse({ status: 200, description: 'Environment variable fetched successfully' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  testEnvVariable() {
    return this.authService.getEnvVariable()
  }

  @Get('testCustomException')
  @ApiOperation({ summary: 'Test custom exception' })
  @ApiResponse({ status: 404, description: 'Custom exception thrown' })
  testCustomException(): string | void {
    throw new ExampleException('Custom message', HttpStatus.NOT_FOUND)
  }
}
