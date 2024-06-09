import { BaseEntity } from 'src/entities/base.entity'
import { User } from 'src/entities/user.entity'
import { Entity, Column, ManyToOne } from 'typeorm'

@Entity('attachment')
export class Attachment extends BaseEntity {
  @Column({ type: 'varchar', length: 2000 })
  publicUrl: string

  @Column({ type: 'varchar', length: 2000 })
  fileName: string

  @ManyToOne(() => User)
  owner: User
}
