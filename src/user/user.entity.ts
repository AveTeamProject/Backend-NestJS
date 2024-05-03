import { ApiProperty } from '@nestjs/swagger'
import { Exclude } from 'class-transformer'
import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm'

@Entity('users')
export class User {
  @PrimaryGeneratedColumn()
  id: number

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
  @Exclude()
  password: string

  @Column({ nullable: true, type: 'text' })
  twoFASecret: string

  @Column({ default: false, type: 'boolean' })
  enable2FA: boolean

  @Column()
  apiKey: string
}
