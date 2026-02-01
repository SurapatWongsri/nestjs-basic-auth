import {
  CallHandler,
  ExecutionContext,
  HttpException,
  Injectable,
  Logger,
  NestInterceptor,
} from '@nestjs/common'
import { Observable, throwError } from 'rxjs'
import { tap, catchError } from 'rxjs/operators'
import { FastifyRequest, FastifyReply } from 'fastify'
import chalk from 'chalk'

@Injectable()
export class LoggingInterceptor implements NestInterceptor {
  private readonly logger = new Logger('HTTP')

  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    const ctx = context.switchToHttp()
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    const request = ctx.getRequest<FastifyRequest>()
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    const response = ctx.getResponse<FastifyReply>()
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    const { method, url, body } = request
    const startTime = Date.now()

    const logRequest = (responseBody: unknown, isError = false): void => {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      const statusCode = response.statusCode as number
      const duration = Date.now() - startTime

      let methodColor = chalk.bold
      if (method === 'GET') methodColor = chalk.blue.bold
      else if (method === 'POST') methodColor = chalk.green.bold
      else if (method === 'PUT') methodColor = chalk.yellow.bold
      else if (method === 'DELETE') methodColor = chalk.red.bold

      let statusColor = chalk.green
      if (statusCode >= 500) statusColor = chalk.red
      else if (statusCode >= 400) statusColor = chalk.yellow
      else if (statusCode >= 300) statusColor = chalk.cyan

      const logMessage =
        `\n${chalk.gray('━'.repeat(70))}\n` +
        `${isError ? chalk.red('❌') : chalk.green('✅')} ${methodColor(method)} ${url} ${statusColor(statusCode)} ${chalk.yellow(`+${duration}ms`)}\n` +
        `${chalk.gray('📦 Body:')} ${chalk.cyan(JSON.stringify(body ?? {}, null, 2))}\n` +
        `${chalk.gray('📤 Response:')} ${chalk.magenta(JSON.stringify(responseBody ?? {}, null, 2))}\n` +
        `${chalk.gray('━'.repeat(70))}`

      if (isError) {
        this.logger.error(logMessage)
      } else {
        this.logger.log(logMessage)
      }
    }

    return next.handle().pipe(
      tap((responseBody) => logRequest(responseBody, false)),
      catchError((error: HttpException | Error) => {
        const errorResponse =
          error instanceof HttpException ? error.getResponse() : error.message
        logRequest(errorResponse, true)
        return throwError(() => error)
      }),
    )
  }
}
