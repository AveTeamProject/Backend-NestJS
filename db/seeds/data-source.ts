import { ConfigModule, ConfigService } from '@nestjs/config'
import { TypeOrmModuleAsyncOptions, TypeOrmModuleOptions } from '@nestjs/typeorm'
import { Attachment } from 'src/entities/attachment.entity'
import { Order } from 'src/entities/order.entity'
import { Product } from 'src/entities/product.entity'
import { Role } from 'src/entities/role.entity'
import { User } from 'src/entities/user.entity'
import { DataSource, DataSourceOptions } from 'typeorm'

// Load ENV variable
// eslint-disable-next-line @typescript-eslint/no-var-requires
// const path = require('path')
// const envPath = path.resolve(__dirname, `.env.${process.env.NODE_ENV}`)
// // eslint-disable-next-line @typescript-eslint/no-var-requires
// require('dotenv').config({ path: envPath })
// eslint-disable-next-line @typescript-eslint/no-var-requires
require('dotenv').config()

export const typeOrmAsyncConfig: TypeOrmModuleAsyncOptions = {
  imports: [ConfigModule],
  inject: [ConfigService],
  useFactory: async (configService: ConfigService): Promise<TypeOrmModuleOptions> => {
    return {
      type: 'postgres',
      host: configService.get<string>('dbHost'),
      port: configService.get<number>('dbPort'),
      database: configService.get<string>('dbName'),
      username: configService.get<string>('dbUsername'),
      password: configService.get<string>('dbPassword'),
      entities: [User, Role, Product, Order, Attachment],
      synchronize: false, // if production need set to false
      migrations: ['dist/db/migrations/*.js'],
      ssl: true
    }
  }
}

console.log('NODE_ENV: ', process.env.NODE_ENV)
console.log('DB_HOST: ', process.env.DB_HOST)
console.log('DB_PASSWORD: ', process.env.DB_PASSWORD)

export const dataSourceOptions: DataSourceOptions = {
  type: 'postgres',
  host: process.env.DB_HOST,
  port: parseInt(process.env.DB_PORT),
  username: process.env.DB_USERNAME,
  database: process.env.DB_NAME,
  password: process.env.DB_PASSWORD,
  entities: ['dist/**/*.entity.js'], //1
  synchronize: false, // 2
  migrations: ['dist/db/migrations/*.js'] // 3
}

const dataSource = new DataSource(dataSourceOptions) //4
export default dataSource
