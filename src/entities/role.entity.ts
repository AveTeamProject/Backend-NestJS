import { BaseEntity } from 'src/entities/base.entity'
import { Entity, Column, ManyToMany } from 'typeorm'
import { User } from './user.entity'

@Entity('role')
export class Role extends BaseEntity {
  @Column()
  roleName: string

  @ManyToMany(() => User, (user) => user.roles)
  users: User[]
}
