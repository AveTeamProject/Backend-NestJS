import { Injectable, NotFoundException } from '@nestjs/common'
import { CreateProductDto } from './dto/create-product.dto'
import { InjectRepository } from '@nestjs/typeorm'
import { Product } from 'src/entities/product.entity'
import { In, Repository } from 'typeorm'
import { UpdateProductDto } from './dto/update-product.dto'
import { DeleteProductsDto } from './dto/delete-product.dto'
import { FindOptionsDto } from 'src/utils/find-options.dto'
import { applyFilters } from 'src/utils/filter-utils'

@Injectable()
export class ProductService {
  constructor(
    @InjectRepository(Product)
    private readonly productRepository: Repository<Product>
  ) {}

  async create(createProductDto: CreateProductDto): Promise<Product> {
    const product = this.productRepository.create(createProductDto)
    return this.productRepository.save(product)
  }

  async findAll(options: FindOptionsDto): Promise<Product[]> {
    const queryBuilder = this.productRepository
      .createQueryBuilder('product')
      .leftJoinAndSelect('product.category', 'category')

    const defaultFilter = applyFilters(queryBuilder, options, 'product')

    // const query = defaultFilter.andWhere('category.name = :categoryName', { categoryName: 'Short-billed Dowitcher' })

    return defaultFilter.getMany()
  }

  async findOne(id: string): Promise<Product> {
    return this.productRepository.findOneBy({ id })
  }

  async update(id: string, updateProductDto: UpdateProductDto): Promise<Product> {
    await this.productRepository.update(id, updateProductDto)
    const updatedProduct = await this.productRepository.findOneBy({ id })
    if (!updatedProduct) {
      throw new NotFoundException(`Product with ID ${id} not found`)
    }
    return updatedProduct
  }

  async remove(id: string): Promise<void> {
    const result = await this.productRepository.delete({ id })
    if (result.affected === 0) {
      throw new NotFoundException(`Product with ID ${id} not found`)
    }
  }

  async removeMultiple(deleteProductsDto: DeleteProductsDto): Promise<void> {
    const { ids } = deleteProductsDto
    const result = await this.productRepository.delete({ id: In(ids) })
    if (result.affected === 0) {
      throw new NotFoundException(`No products found for the provided IDs`)
    }
  }
}
