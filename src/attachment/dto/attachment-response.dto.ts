import { UserResponseDTO } from 'src/user/dto/user-response-dto'

export class AttachmentResponseDTO {
  id: string
  fileName: string
  owner: UserResponseDTO
  publicUrl: string

  constructor(id: string, fileName: string, owner: UserResponseDTO, publicUrl: string) {
    this.id = id
    this.fileName = fileName
    this.owner = owner
    this.publicUrl = publicUrl
  }
}
