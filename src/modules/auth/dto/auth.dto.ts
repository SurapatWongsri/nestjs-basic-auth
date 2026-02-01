import { createZodDto } from 'nestjs-zod'
import { z } from 'zod'

const authSchema = z.object({
  email: z.email({ message: 'รูปแบบอีเมลไม่ถูกต้อง' }),
  password: z
    .string()
    .min(6, { message: 'รหัสผ่านต้องมีอย่างน้อย 6 ตัวอักษร' }),
  name: z.string().min(1, { message: 'กรุณาระบุชื่อ' }),
})

const loginSchema = z.object({
  email: z.email({ message: 'รูปแบบอีเมลไม่ถูกต้อง' }),
  password: z
    .string()
    .min(6, { message: 'รหัสผ่านต้องมีอย่างน้อย 6 ตัวอักษร' }),
})

export const refreshTokenSchema = z.object({
  refreshToken: z.string(),
})

// Magic แปลง Zod Schema เป็น NestJS DTO class
export class AuthDto extends createZodDto(authSchema) {}
export class LoginDto extends createZodDto(loginSchema) {}
export class RefreshTokenDto extends createZodDto(refreshTokenSchema) {}
