import { Module } from '@nestjs/common'
import { ConfigModule, ConfigService } from '@nestjs/config'
import { JwtModule, JwtService } from '@nestjs/jwt'
import { UserModule } from 'src/user/user.module'
import { AuthService } from './auth.service'
import { JwtStrategy } from './jwt-strategy'
import { ApiKeyStrategy } from './api-key-strategy'
import { AuthController } from './auth.controller'
import { PassportModule } from '@nestjs/passport'
import { RolesGuard } from './roles.guard'

@Module({
  imports: [
    ConfigModule.forRoot(),
    UserModule,
    PassportModule,
    JwtModule.registerAsync({
      global: true,
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        secret: configService.get<string>('jwtSecret'),
        signOptions: {
          expiresIn: configService.get<string>('jwtAccessExpiresIn')
        }
      }),
      inject: [ConfigService]
    })
  ],
  providers: [AuthService, JwtStrategy, RolesGuard, JwtService, ApiKeyStrategy],
  controllers: [AuthController],
  exports: [AuthService]
})
export class AuthModule {}
