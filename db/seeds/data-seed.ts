import { EntityManager } from 'typeorm'
import { faker } from '@faker-js/faker'
import { v4 as uuid4 } from 'uuid'
import { Product } from 'src/entities/product.entity'
import { Category } from 'src/entities/category.entity'
export const seedData = async (manager: EntityManager): Promise<void> => {
// await seedProducts()
  await seedCategory()
  async function seedProducts() {
    for (let i = 0; i < 20; i++) {
      const product = new Product()
      product.id = uuid4()
      product.description = faker.commerce.productDescription()
      product.imageUrl = faker.image.avatarLegacy()
      product.name = faker.commerce.productName()
      product.price = Number(faker.commerce.price())
      const category = new Category()
      category.id = uuid4()
      category.name = faker.animal.bird()
      product.category = category
      await manager.getRepository(Category).save(category)
      await manager.getRepository(Product).save(product)
    }
  }

  async function seedCategory() {
    const category = new Category()
    category.id = uuid4()
    category.name = faker.animal.bird()
    await manager.getRepository(Category).save(category)

    const category2 = new Category()
    category2.id = uuid4()
    category2.name = faker.animal.cat()
    await manager.getRepository(Category).save(category2)

    const category3 = new Category()
    category3.id = uuid4()
    category3.name = faker.animal.dog()
    await manager.getRepository(Category).save(category3)
  }
}
