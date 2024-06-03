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
  create(@Body() createProductDto: CreateProductDto) {
    return this.productService.create(createProductDto)
  }

  @Post(ROUTES.PRODUCT.FIND)
  findAll(@Body() findOptionsDto: FindOptionsDto) {
    return this.productService.findAll(findOptionsDto)
  }

  @Get(ROUTES.PRODUCT.FIND_ONE)
  findOne(@Param('id') id: string) {
    return this.productService.findOne(id)
  }

  @Put(ROUTES.PRODUCT.UPDATE)
  update(@Param('id') id: string, @Body() updateProductDto: UpdateProductDto) {
    return this.productService.update(id, updateProductDto)
  }

  @Delete(ROUTES.PRODUCT.DELETE)
  remove(@Param('id') id: string) {
    return this.productService.remove(id)
  }

  @Delete(ROUTES.PRODUCT.DELETE_MULTIPLES)
  removeMultiple(@Body() deleteProductsDto: DeleteProductsDto) {
    return this.productService.removeMultiple(deleteProductsDto)
  }
}
