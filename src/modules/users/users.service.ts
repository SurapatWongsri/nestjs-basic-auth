import { Inject, Injectable } from '@nestjs/common'
import { NodePgDatabase } from 'drizzle-orm/node-postgres'
import { DRIZZLE } from 'src/common/database/database.module'
import * as schema from './schema'
import { users } from './schema'
import { eq } from 'drizzle-orm'

export type User = typeof users.$inferSelect
export type NewUser = typeof users.$inferInsert

@Injectable()
export class UsersService {
  constructor(@Inject(DRIZZLE) private db: NodePgDatabase<typeof schema>) {}

  async updateRefreshToken(userId: string, hashedRefreshToken: string | null) {
    await this.db
      .update(users)
      .set({ hashedRefreshToken })
      .where(eq(users.id, userId))
  }
  async findByEmail(email: string): Promise<User | undefined> {
    const result = await this.db.query.users.findFirst({
      where: eq(users.email, email),
    })
    return result ?? undefined
  }

  async create(data: NewUser): Promise<User[]> {
    return this.db.insert(users).values(data).returning()
  }

  async findById(id: string): Promise<User | undefined> {
    return this.db.query.users.findFirst({
      where: eq(users.id, id),
    })
  }
}
