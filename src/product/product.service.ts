import { Inject, Injectable, NotFoundException } from '@nestjs/common'
import { CreateProductDto } from './dto/create-product.dto'
import { InjectRepository } from '@nestjs/typeorm'
import { Product } from 'src/entities/product.entity'
import { In, Repository } from 'typeorm'
import { UpdateProductDto } from './dto/update-product.dto'
import { DeleteProductsDto } from './dto/delete-product.dto'
import { FindOptionsDto } from 'src/utils/find-options.dto'
import { applyFilters } from 'src/utils/filter-utils'
import { CACHE_MANAGER } from '@nestjs/cache-manager'
import { Cache } from 'cache-manager'

@Injectable()
export class ProductService {
  private readonly CacheExpiredTime : number = 3000
  constructor(
    @InjectRepository(Product)
    private readonly productRepository: Repository<Product>,
    @Inject(CACHE_MANAGER) private cacheService: Cache
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
    const cachedData = await this.cacheService.get<Product>(this.productCacheKey(id))
    if (cachedData) {
      console.log('get data')
      return cachedData
    }
    const product = await this.productRepository.findOneBy({ id })
    await this.cacheService.set(this.productCacheKey(id), product, this.CacheExpiredTime)
    return product
  }

  async update(id: string, updateProductDto: UpdateProductDto): Promise<Product> {
    await this.productRepository.update(id, updateProductDto)
    const updatedProduct = await this.productRepository.findOneBy({ id })
    if (!updatedProduct) {
      throw new NotFoundException(`Product with ID ${id} not found`)
    }
    await this.cacheService.set(this.productCacheKey(id), updatedProduct, this.CacheExpiredTime)
    return updatedProduct
  }

  async remove(id: string): Promise<void> {
    const result = await this.productRepository.delete({ id })
    if (result.affected === 0) {
      throw new NotFoundException(`Product with ID ${id} not found`)
    }
    await this.cacheService.del(this.productCacheKey(id))
  }

  async removeMultiple(deleteProductsDto: DeleteProductsDto): Promise<void> {
    const { ids } = deleteProductsDto
    const result = await this.productRepository.delete({ id: In(ids) })
    if (result.affected === 0) {
      throw new NotFoundException(`No products found for the provided IDs`)
    }
  }

  private productCacheKey(suffixes: string) : string {
    return `product-${suffixes}`
  }
}
