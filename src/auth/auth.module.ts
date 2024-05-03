import { Module } from '@nestjs/common'
import { ConfigModule, ConfigService } from '@nestjs/config'
import { JwtModule } from '@nestjs/jwt'
import { UserModule } from 'src/user/user.module'
import { AuthService } from './auth.service'
import { JwtStrategy } from './jwt-strategy'
import { ApiKeyStrategy } from './api-key-strategy'
import { AuthController } from './auth.controller'

@Module({
  imports: [
    UserModule,
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        secret: configService.get<string>('secret'),
        signOptions: {
          expiresIn: '1d'
        }
      }),
      inject: [ConfigService]
    })
  ],
  providers: [AuthService, JwtStrategy, ApiKeyStrategy],
  controllers: [AuthController],
  exports: [AuthService]
})
export class AuthModule {}
