// drizzle.config.ts
import { defineConfig } from 'drizzle-kit'
import 'dotenv/config' // ต้องโหลด .env ตรงนี้ด้วย

// ประกอบร่าง URL เอง
const connectionString = `postgresql://${process.env.DB_USER}:${process.env.DB_PASSWORD}@${process.env.DB_HOST}:${process.env.DB_PORT}/${process.env.DB_NAME}`

export default defineConfig({
  schema: './src/modules/**/schema.ts',
  out: './drizzle',
  dialect: 'postgresql',
  dbCredentials: {
    url: connectionString,
  },
})
