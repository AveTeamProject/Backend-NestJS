import { Body, Post, Controller, Get, UseGuards, Req, HttpStatus, Request, Response } from '@nestjs/common'
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
    description: 'It will return the user in the response'
  })
  signup(
    @Body()
    userDTO: CreateUserDTO
  ): Promise<UserResponseDTO> {
    return this.userService.create(userDTO)
  }

  @Post(ROUTES.AUTH.LOGIN)
  @Public()
  async login(
    @Body()
    loginDTO: LoginDTO,
    @Response()
    res
  ) {
    const result = await this.authService.login(loginDTO)
    if ('accessToken' in result) {
      res.cookie('accessToken', result.accessToken, { httpOnly: true })
      res.cookie('refreshToken', result.refreshToken, { httpOnly: true })
    }
    return res.status(200).json({
      code: 200,
      message: 'Success',
      data: result
    })
  }

  @Post(ROUTES.AUTH.REFRESH_TOKEN)
  async refreshToken(
    @Request()
    req,
    @Response()
    res
  ) {
    const refreshTokenDTO = new RefreshTokenDTO()
    refreshTokenDTO.refreshToken = req.cookies.refreshToken
    const newAccessToken = await this.authService.refreshToken(refreshTokenDTO)
    res.cookie('accessToken', newAccessToken.accessToken, { httpOnly: true })
    return res.status(200).json({
      code: 200,
      message: 'Success',
      data: newAccessToken
    })
  }

  @UseGuards(JwtAuthGuard)
  @Post(ROUTES.AUTH.LOGOUT)
  async logout(
    @Request()
    req,
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
  getProfile(
    @Req()
    request
  ) {
    return request.user
  }

  @Get('test')
  @UseGuards(JwtAuthGuard, RolesGuard) // Ensure correct order
  @Roles(ROLES.ADMIN)
  testEnvVariable() {
    return this.authService.getEnvVariable()
  }

  @Get('testCustomException')
  testCustomException(): string {
    throw new ExampleException('Custom message', HttpStatus.NOT_FOUND)
  }
}
