import { NestFactory } from '@nestjs/core'
import {
  FastifyAdapter,
  NestFastifyApplication,
} from '@nestjs/platform-fastify'
import { AppModule } from './app.module'
import { ConfigService } from '@nestjs/config'
import { ZodValidationPipe } from 'nestjs-zod'
import { LoggingInterceptor } from './common/interceptors/logging.interceptor'
import { AllExceptionsFilter } from './common/filters/all-exceptions.filter'
import cookie from '@fastify/cookie'
import { TransformInterceptor } from './common/interceptors/transform.interceptor'

async function bootstrap() {
  const app = await NestFactory.create<NestFastifyApplication>(
    AppModule,
    new FastifyAdapter(),
  )

  await app.register(cookie)
  app.enableCors()
  app.useGlobalPipes(new ZodValidationPipe())
  app.useGlobalInterceptors(
    new LoggingInterceptor(),
    new TransformInterceptor(),
  )
  app.useGlobalFilters(new AllExceptionsFilter())
  const configService = app.get(ConfigService)
  const port = configService.getOrThrow<number>('PORT')
  await app.listen(port, '0.0.0.0')
  console.log(`Application is running on: ${await app.getUrl()}`)
}
bootstrap()
