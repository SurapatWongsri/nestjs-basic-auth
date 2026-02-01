import {
  ArgumentsHost,
  ExceptionFilter,
  HttpException,
  HttpStatus,
  Catch,
  Logger,
} from '@nestjs/common'
import { FastifyReply } from 'fastify'
import { ZodValidationException } from 'nestjs-zod'

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  private readonly logger = new Logger(AllExceptionsFilter.name)

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp()
    const response = ctx.getResponse<FastifyReply>()

    let status = HttpStatus.INTERNAL_SERVER_ERROR
    let message: string | string[] = 'Internal Server Error'
    let error: string | null = 'Internal Server Error'
    let errors: Array<{ field: string; message: string }> | undefined

    if (exception instanceof ZodValidationException) {
      status = HttpStatus.BAD_REQUEST
      const response = exception.getResponse() as {
        errors?: Array<{ path: (string | number)[]; message: string }>
        message?: string
      }
      message = 'Validation failed'
      errors = response.errors?.map((err) => ({
        field: err.path.join('.'),
        message: err.message,
      }))
      error = 'Validation Error'
    } else if (exception instanceof HttpException) {
      status = exception.getStatus()
      const res = exception.getResponse()

      if (typeof res === 'object' && res !== null) {
        const payload = res as { message?: string | string[]; error?: string }
        message = payload.message || exception.message
        error = payload.error || exception.name
      } else {
        message = String(res)
        error = exception.name
      }
    } else if (
      typeof exception === 'object' &&
      exception !== null &&
      'code' in exception &&
      (exception as { code: unknown }).code === '23505'
    ) {
      status = HttpStatus.CONFLICT
      message = 'Data already exists'
      error = 'Conflict'
    } else {
      this.logger.error(exception)
    }

    response.status(status).send({
      statusCode: status,
      message,
      error,
      errors,
      timestamp: new Date().toISOString(),
    })
  }
}
