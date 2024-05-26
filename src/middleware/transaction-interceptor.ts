import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { TransactionManager } from '../transaction/transaction-manager';

@Injectable()
export class TransactionInterceptor implements NestInterceptor {
  constructor(private readonly transactionManager: TransactionManager) {}

  async intercept(context: ExecutionContext, next: CallHandler): Promise<Observable<any>> {
    const request = context.switchToHttp().getRequest();
    request.transactionManager = this.transactionManager;

    return next
      .handle()
      .pipe(
        catchError(async (err) => {
          throw err;
        }),
      );
  }
}
