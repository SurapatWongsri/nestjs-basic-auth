import { Module } from '@nestjs/common'
import { ConfigModule } from '@nestjs/config'
import { envSchema } from './common/configs/env.validation'
import { AuthModule } from './modules/auth/auth.module'
import { UsersModule } from './modules/users/users.module'
import { DatabaseModule } from './common/database/database.module'
import { AppController } from './app.controller'
import { AppService } from './app.service'

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true, // เรียกใช้ได้ทุกที่โดยไม่ต้อง import ซ้ำ
      validate: (config) => envSchema.parse(config), // ถ้า validate ไม่ผ่าน App จะ Crash ทันที (ดีมาก!)
    }),
    DatabaseModule,
    UsersModule,
    AuthModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
