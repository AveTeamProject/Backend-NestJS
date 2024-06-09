export interface JwtPayload {
  email: string
  userId: string
  roles: string[]
}

export type Enable2FAType = {
  secret: string
}
