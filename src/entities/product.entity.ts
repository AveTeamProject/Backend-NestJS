import { BaseEntity } from 'src/entities/base.entity'
import { Order } from 'src/entities/order.entity'
import { Entity, Column, ManyToMany, ManyToOne, JoinColumn } from 'typeorm'
import { Category } from './category.entity'

@Entity('product')
export class Product extends BaseEntity {
  @Column({ type: 'varchar', length: 2000 })
  name: string

  @Column({ type: 'varchar', length: 2000 })
  description: string

  @Column({ type: 'decimal' })
  price: number

  @Column()
  imageUrl: string

  @ManyToMany(() => Order, (order) => order.product)
  orders: Order[]

  @ManyToOne(() => Category, (category) => category.products)
  @JoinColumn({ name: 'categoryId' })
  category: Category
}
