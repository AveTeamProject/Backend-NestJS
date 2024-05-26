import { CallHandler, ExecutionContext, Injectable, NestInterceptor, HttpException, HttpStatus } from '@nestjs/common';
import { Observable, throwError } from 'rxjs';
import { catchError, map } from 'rxjs/operators';

@Injectable()
export class ResponseTransformInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    return next.handle().pipe(
      map(data => {
        const response =  context.switchToHttp().getResponse();
        return {
          code: 200,
          message: response.message || 'Success',
          data: data
        };
      }),
      catchError(error => {
        const status = error instanceof HttpException ? error.getStatus() : HttpStatus.INTERNAL_SERVER_ERROR;
        const errorResponse = {
          code: status,
          message: error.message || 'An unexpected error occurred',
          data: error.data || null
        };
        return throwError(() => new HttpException(errorResponse, status));
      })
    );
  }
}
