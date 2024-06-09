import { Body, Controller, Delete, Get, Logger, Param, Post, Put } from '@nestjs/common'
import { ProductService } from './product.service'
import { CreateProductDto } from './dto/create-product.dto'
import { UpdateProductDto } from './dto/update-product.dto'
import { DeleteProductsDto } from './dto/delete-product.dto'
import { ROUTES } from 'src/common/constants'
import { FindOptionsDto } from 'src/utils/find-options.dto'

@Controller(ROUTES.PRODUCT.BASE)
export class ProductController {
  private readonly logger = new Logger(ProductController.name);
  constructor(private readonly productService: ProductService) {}

  @Post()
  async create(@Body() createProductDto: CreateProductDto) {
    try {
      return await this.productService.create(createProductDto)
    } catch (error) {
      this.logger.error(error)
    }
  }

  @Post(ROUTES.PRODUCT.FIND)
  async findAll(@Body() findOptionsDto: FindOptionsDto) {
    try {
      return await this.productService.findAll(findOptionsDto)
    } catch (error) {
      this.logger.error(error)
    }
  }

  @Get(ROUTES.PRODUCT.FIND_ONE)
  async findOne(@Param('id') id: string) {
    try {
      return await this.productService.findOne(id)
    } catch (error) {
      this.logger.error(error)
    }
  }

  @Put(ROUTES.PRODUCT.UPDATE)
  async update(@Param('id') id: string, @Body() updateProductDto: UpdateProductDto) {
    try {
      return await this.productService.update(id, updateProductDto)
    } catch (error) {
      this.logger.error(error)
    }
  }

  @Delete(ROUTES.PRODUCT.DELETE)
  async remove(@Param('id') id: string) {
    try {
    return await this.productService.remove(id)
  } catch (error) {
    this.logger.error(error)
  }
  }

  @Delete(ROUTES.PRODUCT.DELETE_MULTIPLES)
  async removeMultiple(@Body() deleteProductsDto: DeleteProductsDto) {
    try {
      return await this.productService.removeMultiple(deleteProductsDto)
    } catch (error) {
      this.logger.error(error)
    }
  }
}
