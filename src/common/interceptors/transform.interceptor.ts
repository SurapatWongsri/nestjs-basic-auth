import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common'
import { Observable } from 'rxjs'
import { map } from 'rxjs/operators'

import { FastifyReply } from 'fastify'

// กำหนดหน้าตาของ Response มาตรฐาน
export interface Response<T> {
  statusCode: number
  message: string
  data: T
  timestamp: string
}

@Injectable()
export class TransformInterceptor<T> implements NestInterceptor<
  T,
  Response<T>
> {
  intercept(
    context: ExecutionContext,
    next: CallHandler,
  ): Observable<Response<T>> {
    return next.handle().pipe(
      map((data: unknown) => {
        // ดึง Status Code จาก Context (เพราะ Fastify/Express เก็บไว้ต่างกัน Nest จัดการให้)
        const ctx = context.switchToHttp()
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
        const response = ctx.getResponse<FastifyReply>()
        // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
        const statusCode = response.statusCode as number

        // ถ้า data เป็น Object และมี message ให้ดึงออกมาใช้ (เผื่อ Service อยากบอก message)
        const dataObj = data as { message?: string; data?: T }
        const message = dataObj?.message || 'Success'
        const finalData = (
          dataObj?.message ? dataObj.data || dataObj : data
        ) as T

        // ประกอบร่าง!
        return {
          statusCode,
          message,
          data: finalData,
          timestamp: new Date().toISOString(),
        }
      }),
    )
  }
}
