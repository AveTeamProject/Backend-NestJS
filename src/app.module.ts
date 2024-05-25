import { Module } from '@nestjs/common'
import { AppController } from './app.controller'
import { AppService } from './app.service'
import { ConfigModule } from '@nestjs/config'
import configuration from './config/configuration'
import { validate } from 'env.validation'
import { AuthModule } from './auth/auth.module'
import { UserModule } from './user/user.module'
import { TypeOrmModule } from '@nestjs/typeorm'
import { typeOrmAsyncConfig } from 'db/seeds/data-source'
import { AttachmentModule } from './attachment/attachment.module'
import { ProductModule } from './product/product.module'
import { OrderModule } from './order/order.module'
import { CommonModule } from './common/common.module'
import { JwtModule } from '@nestjs/jwt'
@Module({
  imports: [
    ConfigModule.forRoot({
      envFilePath: [`${process.cwd()}/.env.${process.env.NODE_ENV}`],
      isGlobal: true,
      load: [configuration],
      validate: validate
    }),
    TypeOrmModule.forRootAsync(typeOrmAsyncConfig),
    JwtModule,
    AuthModule,
    UserModule,
    AttachmentModule,
    ProductModule,
    OrderModule,
    CommonModule
  ],
  controllers: [AppController],
  providers: [AppService]
})
export class AppModule {}
