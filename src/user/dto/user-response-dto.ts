import { Expose } from 'class-transformer'

export class UserResponseDTO {
  @Expose()
  id: string
  @Expose()
  firstName: string
  @Expose()
  lastName: string
  @Expose()
  email: string

  constructor(id: string, firstName: string, lastName: string, email: string) {
    this.id = id
    this.firstName = firstName
    this.lastName = lastName
    this.email = email
  }
}
