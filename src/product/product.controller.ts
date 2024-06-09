import { Body, Controller, Delete, Get, Param, Post, Put } from '@nestjs/common'
import { ProductService } from './product.service'
import { CreateProductDto } from './dto/create-product.dto'
import { UpdateProductDto } from './dto/update-product.dto'
import { DeleteProductsDto } from './dto/delete-product.dto'
import { ROUTES } from 'src/common/constants'
import { FindOptionsDto } from 'src/utils/find-options.dto'

@Controller(ROUTES.PRODUCT.BASE)
export class ProductController {
  constructor(private readonly productService: ProductService) {}

  @Post()
  async create(@Body() createProductDto: CreateProductDto) {
    return await this.productService.create(createProductDto)
  }

  @Post(ROUTES.PRODUCT.FIND)
  async findAll(@Body() findOptionsDto: FindOptionsDto) {
    return await this.productService.findAll(findOptionsDto)
  }

  @Get(ROUTES.PRODUCT.FIND_ONE)
  async findOne(@Param('id') id: string) {
    return await this.productService.findOne(id)
  }

  @Put(ROUTES.PRODUCT.UPDATE)
  async update(@Param('id') id: string, @Body() updateProductDto: UpdateProductDto) {
    return await this.productService.update(id, updateProductDto)
  }

  @Delete(ROUTES.PRODUCT.DELETE)
  async remove(@Param('id') id: string) {
    return await this.productService.remove(id)
  }

  @Delete(ROUTES.PRODUCT.DELETE_MULTIPLES)
  async removeMultiple(@Body() deleteProductsDto: DeleteProductsDto) {
    return await this.productService.removeMultiple(deleteProductsDto)
  }
}
