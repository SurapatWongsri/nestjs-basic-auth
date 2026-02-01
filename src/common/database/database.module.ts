import { Global, Module } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { drizzle } from 'drizzle-orm/node-postgres'
import { Pool } from 'pg'
import * as schema from '../../modules/users/schema'
import { DrizzleLogger } from './drizzle-logger'

export const DRIZZLE = 'DRIZZLE_CONNECTION'

@Global()
@Module({
  providers: [
    {
      provide: DRIZZLE,
      useFactory: (configService: ConfigService) => {
        // ดึงค่าแยกส่วนออกมา
        const user = configService.getOrThrow<string>('DB_USER')
        const password = configService.getOrThrow<string>('DB_PASSWORD')
        const host = configService.getOrThrow<string>('DB_HOST')
        const port = configService.getOrThrow<number>('DB_PORT')
        const dbName = configService.getOrThrow<string>('DB_NAME')

        // ประกอบร่างเป็น Connection String
        const connectionString = `postgresql://${user}:${password}@${host}:${port}/${dbName}`

        const pool = new Pool({ connectionString })
        return drizzle(pool, {
          schema,
          logger: new DrizzleLogger(), // 📝 ใช้ Custom Logger ที่ทำเอง
        })
      },
      inject: [ConfigService],
    },
  ],
  exports: [DRIZZLE],
})
export class DatabaseModule {}
