// auth/roles.decorator.ts
import { SetMetadata } from '@nestjs/common'
import { ROLES } from 'src/enums'

export const ROLES_KEY = 'roles'
export const Roles = (...roles: ROLES[]) => SetMetadata(ROLES_KEY, roles)
