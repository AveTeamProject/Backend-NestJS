import { CallHandler, ExecutionContext, Injectable, NestInterceptor } from '@nestjs/common'
import { ConfigService } from '@nestjs/config';
import { Observable } from 'rxjs'
import { tap } from 'rxjs/operators'
import * as ms from 'ms'

@Injectable()
export class CookieInterceptor implements NestInterceptor {
  constructor(private readonly configService: ConfigService) {}
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    return next.handle().pipe(
      tap((result) => {
        const ctx = context.switchToHttp()
        const response = ctx.getResponse()
        if ('accessToken' in result) {
          response.cookie('accessToken', 
            result.accessToken, 
            {
              httpOnly: true,
              sameSite: 'None',
              secure: process.env.NODE_ENV === 'production',
              maxAge: ms(this.configService.get<string>('jwtAccessExpiresIn'))
            }
          )
        }
        if ('refreshToken' in result) {
          response.cookie('refreshToken', 
            result.refreshToken, 
            {
              httpOnly: true,
              sameSite: 'None',
              secure: process.env.NODE_ENV === 'production',
              maxAge: ms(this.configService.get<string>('jwtRefreshExpiresIn'))
            }
          )
        }
      }),
    );
  }
}
