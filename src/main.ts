import { NestFactory } from '@nestjs/core'
import { AppModule } from './app.module'
import { ValidationPipe } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger'
import { ResponseTransformInterceptor } from './middleware/response-transform-interceptor'
import * as cookieParser from 'cookie-parser'
import { SeedService } from './seed/seed.service'
declare const module: any

async function bootstrap() {
  const app = await NestFactory.create(AppModule)
  app.useGlobalPipes(new ValidationPipe())
  // const seedService = app.get(SeedService)
  // await seedService.seed()
  // app.useGlobalGuards(new RolesGuard(new Reflector()))
  app.useGlobalInterceptors(new ResponseTransformInterceptor())
  app.use(cookieParser())
  // Swagger documentation
  const config = new DocumentBuilder()
    .setTitle('Booking Website')
    .setDescription('The Booking Website Api documentation')
    .setVersion('1.0')
    .addCookieAuth('accessToken')
    // .addBearerAuth(
    //   // Enable Bearer Auth here
    //   {
    //     type: 'http',
    //     scheme: 'bearer',
    //     bearerFormat: 'JWT',
    //     name: 'JWT',
    //     description: 'Enter JWT token',
    //     in: 'header'
    //   },
    //   'JWT-auth' // We will use this Bearer Auth with JWT-auth name on the controller function
    // )
    .build()

  const document = SwaggerModule.createDocument(app, config)
  SwaggerModule.setup('api', app, document)

  app.enableCors({
    origin: '*',
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    credentials: true
  })

  const configService = app.get(ConfigService)
  await app.listen(configService.get<number>('port'))

  if (module.hot) {
    module.hot.accept()
    module.hot.dispose(() => app.close())
  }
}
bootstrap()
