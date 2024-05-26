import { Module } from '@nestjs/common'
import { AppController } from './app.controller'
import { AppService } from './app.service'
import { ConfigModule, ConfigService } from '@nestjs/config'
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
import { MailerModule } from '@nestjs-modules/mailer'
import { HandlebarsAdapter } from '@nestjs-modules/mailer/dist/adapters/handlebars.adapter'
import { join } from 'path'
@Module({
  imports: [
    ConfigModule.forRoot({
      envFilePath: [`${process.cwd()}/.env.${process.env.NODE_ENV}`],
      isGlobal: true,
      load: [configuration],
      validate: validate
    }),
    MailerModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        transport: {
          host: configService.get('emailHost'),
          auth: {
            user: configService.get('emailUsername'),
            pass: configService.get('emailPassword')
          }
        },
        defaults: {
          from: `"No Reply" <${configService.get('emailFrom')}>`
        },
        template: {
          dir: join(process.cwd(), 'src/templates/email'),
          adapter: new HandlebarsAdapter(),
          options: {
            strict: true
          }
        }
      }),
      inject: [ConfigService]
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
