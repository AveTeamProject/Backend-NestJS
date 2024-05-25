import { BaseEntity } from 'src/entities/base.entity'
import { Product } from 'src/entities/product.entity'
import { User } from 'src/entities/user.entity'
import { Entity, ManyToOne, JoinColumn } from 'typeorm'

@Entity('order')
export class Order extends BaseEntity {
  @ManyToOne(() => User, (user) => user.orders)
  @JoinColumn({ name: 'user_id' })
  user: User

  @ManyToOne(() => Product, (product) => product.orders)
  @JoinColumn({ name: 'product_id' })
  product: Product
}
