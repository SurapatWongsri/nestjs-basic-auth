import { SetMetadata } from '@nestjs/common'
import { Role } from '../enums/role.enum'

export const ROLES_KEY = 'roles'
// รับค่าเป็น Array ของ Role (เช่น ADMIN, USER)
export const Roles = (...roles: Role[]) => SetMetadata(ROLES_KEY, roles)
