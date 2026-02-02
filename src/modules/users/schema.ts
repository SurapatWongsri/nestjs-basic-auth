import { pgEnum, pgTable, text, timestamp, uuid } from 'drizzle-orm/pg-core'
import { Role } from '../../common/enums/role.enum'

export const roleEnum = pgEnum('role', ['USER', 'ADMIN'])
export const users = pgTable('users', {
  id: uuid('id').primaryKey().defaultRandom(),
  email: text('email').notNull().unique(),
  password: text('password').notNull(),
  name: text('name'),
  createdAt: timestamp('created_at').defaultNow(),
  role: roleEnum('role').notNull().default(Role.USER),
  hashedRefreshToken: text('hashed_refresh_token'),
})
