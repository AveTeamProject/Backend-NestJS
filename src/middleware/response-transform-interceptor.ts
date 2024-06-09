import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
  HttpException,
  HttpStatus,
  Logger
} from '@nestjs/common'
import { Observable, throwError } from 'rxjs'
import { catchError, map } from 'rxjs/operators'
import { v4 as uuidv4 } from 'uuid'
import * as Sentry from '@sentry/node'

@Injectable()
export class ResponseTransformInterceptor implements NestInterceptor {
  private readonly logger = new Logger(ResponseTransformInterceptor.name)

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest()
    const requestId = uuidv4()

    const { method, originalUrl } = request
    const userAgent = request.get('user-agent') || ''
    const timestamp = new Date().toISOString()
    const requestName = `Request ${originalUrl} ${requestId}`

    return next.handle().pipe(
      map((data) => {
        const response = context.switchToHttp().getResponse()
        response.setHeader('X-Request-Id', requestId)
        response.status(200)
        const responseTime = (Date.now() - new Date(timestamp).getTime()) / 1000

        this.logger.log({
          message: requestName,
          requestId,
          method,
          originalUrl,
          timestamp: new Date().toISOString(),
          responseTime,
          responseTimeUnit: 'seconds',
          userAgent
        })
        return {
          code: 200,
          message: response.message || 'Success',
          data: data
        }
      }),
      catchError((error) => {
        const response = context.switchToHttp().getResponse()
        response.setHeader('X-Request-Id', requestId)
        const status = error instanceof HttpException ? error.getStatus() : HttpStatus.INTERNAL_SERVER_ERROR
        const errorResponse = {
          code: status,
          message: error.message || 'An unexpected error occurred',
          data: error.data || null
        }
        const responseTime = (Date.now() - new Date(timestamp).getTime()) / 1000
        const errorLog = {
          message: requestName,
          error: error,
          requestId,
          method,
          originalUrl,
          timestamp: new Date().toISOString(),
          responseTime,
          responseTimeUnit: 'seconds',
          userAgent
        }
        this.logger.error(errorLog)
        if (process.env.NODE_ENV === 'production') {
          Sentry.withScope((scope) => {
            scope.setTag('requestId', requestId)
            scope.setExtra('info', errorLog)
            Sentry.captureException(error)
          })
        }

        return throwError(() => new HttpException(errorResponse, status))
      })
    )
  }
}
