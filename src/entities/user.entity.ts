import { ApiProperty } from '@nestjs/swagger'
import { Order } from 'src/entities/order.entity'
import { BeforeInsert, BeforeUpdate, Column, Entity, JoinTable, ManyToMany, OneToMany } from 'typeorm'
import { BaseEntity } from './base.entity'
import { Role } from './role.entity'

import * as bcrypt from 'bcrypt'

@Entity('users')
export class User extends BaseEntity {
  @ApiProperty({
    example: 'Jane',
    description: 'Provide the first name of the user'
  })
  @Column()
  firstName: string
  @ApiProperty({
    example: 'Doe',
    description: 'provide the lastName of the user'
  })
  @Column()
  lastName: string
  @ApiProperty({
    example: 'jane_doe@gmail.com',
    description: 'Provide the email of the user'
  })
  @Column({ unique: true })
  email: string
  @ApiProperty({
    example: 'test123#@',
    description: 'Provide the password of the user'
  })
  @Column()
  password: string

  @Column({ nullable: true, type: 'text' })
  twoFASecret: string

  @Column({ default: false, type: 'boolean' })
  enable2FA: boolean

  @Column({ nullable: true, type: 'text' })
  verificationCode: string

  @Column({ nullable: true, type: 'timestamp without time zone' })
  verificationCodeExpiredTime: Date

  @Column()
  apiKey: string

  @OneToMany(() => Order, (order) => order.user)
  orders: Order[]

  @ManyToMany(() => Role)
  @JoinTable({ name: 'user_roles' })
  roles: Role[]

  // Make sure password hashed before insert to database
  @BeforeInsert()
  @BeforeUpdate()
  async hashPassword() {
    if (this.password) {
      this.password = await bcrypt.hash(this.password, 10)
    }
  }
}
