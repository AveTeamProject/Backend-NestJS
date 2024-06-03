import { Module } from '@nestjs/common'
import { ProductService } from './product.service'
import { TypeOrmModule } from '@nestjs/typeorm'
import { Product } from 'src/entities/product.entity'
import { ProductController } from './product.controller'
import { Category } from 'src/entities/category.entity'

@Module({
  imports: [TypeOrmModule.forFeature([Product, Category])],
  providers: [ProductService],
  controllers: [ProductController]
})
export class ProductModule {}
