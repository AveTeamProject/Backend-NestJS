import { Expose } from 'class-transformer'
import { PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, BeforeInsert, Column } from 'typeorm'
import { v4 as uuidv4 } from 'uuid'

export abstract class BaseEntity {
  @PrimaryGeneratedColumn('uuid')
  @Expose()
  id: string

  @CreateDateColumn({ type: 'timestamp' })
  createdAt: Date

  @UpdateDateColumn({ type: 'timestamp' })
  updatedAt: Date

  @Column({ default: false, type: 'boolean' })
  isDeleted: boolean

  @BeforeInsert()
  generateId() {
    this.id = uuidv4()
  }
}
