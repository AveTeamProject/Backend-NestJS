import { Injectable, CanActivate, ExecutionContext, UnauthorizedException } from '@nestjs/common'
import { Reflector } from '@nestjs/core'
import { Observable } from 'rxjs'
import { ROLES_KEY } from '../decorators/roles.decorator'
import { JwtService } from '@nestjs/jwt'

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(
    private reflector: Reflector,
    private jwtService: JwtService
  ) {}

  canActivate(context: ExecutionContext): boolean | Promise<boolean> | Observable<boolean> {
    const requiredRoles = this.reflector.getAllAndOverride<string[]>(ROLES_KEY, [
      context.getHandler(),
      context.getClass()
    ])
    // console.log('Required roles: ', requiredRoles)

    if (!requiredRoles) {
      return true
    }
    const request = context.switchToHttp().getRequest()
    const token = request.cookies['accessToken']

    if (!token) {
      throw new UnauthorizedException()
    }

    let hasRole = false

    try {
      const payload = this.jwtService.verify(token, {
        secret: process.env.JWT_ACCESS_SECRET
      })

      // console.log('User roles: ', payload.roles)

      hasRole = requiredRoles.some((role) => payload.roles.includes(role))
      if (!hasRole) {
        console.log(`User does not have required roles: ${requiredRoles}`)
      }
    } catch {
      throw new UnauthorizedException()
    }

    return hasRole
  }

  // private extractTokenFromCookie(request: Request): string | undefined {
  //   const [type, token] = (request.headers as any).authorization?.split(' ') ?? []
  //   return type === 'Bearer' ? token : undefined
  // }
}
