import { Entity, Column, OneToMany } from 'typeorm'
import { Product } from './product.entity'
import { BaseEntity } from './base.entity'

@Entity('category')
export class Category extends BaseEntity {
  @Column({ type: 'varchar', unique: true, length: 2000 })
  name: string

  @OneToMany(() => Product, (product) => product.category)
  products: Product[]
}
