import { Injectable, NestInterceptor, ExecutionContext, CallHandler } from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { ApiResponse } from '../interfaces/api-response.interface';

@Injectable()
export class TransformInterceptor<T> implements NestInterceptor<T, ApiResponse<T>> {
  intercept(context: ExecutionContext, next: CallHandler): Observable<ApiResponse<T>> {
    return next.handle().pipe(
      map((res) => {
        // If response is already formatted as ApiResponse, return as is
        if (res && typeof res === 'object' && 'success' in res) {
          return res;
        }

        // If response has data and meta (e.g. paginated)
        if (res && typeof res === 'object' && 'data' in res && 'meta' in res) {
          return {
            success: true,
            data: res.data,
            meta: res.meta,
            message: res.message || 'Operation successful',
          };
        }

        return {
          success: true,
          data: res,
          message: 'Operation successful',
        };
      }),
    );
  }
}
