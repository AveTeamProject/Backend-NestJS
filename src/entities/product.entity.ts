import { BaseEntity } from 'src/entities/base.entity'
import { Order } from 'src/entities/order.entity'
import { Entity, Column, ManyToMany } from 'typeorm'

@Entity('product')
export class Product extends BaseEntity {
  @Column({ type: 'varchar', length: 2000 })
  name: string

  @Column({ type: 'varchar', unique: true, length: 2000 })
  description: string

  @Column({ type: 'float' })
  price: number

  @ManyToMany(() => Order, (order) => order.product)
  orders: Order[]
}
