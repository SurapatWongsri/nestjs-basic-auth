import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
} from '@nestjs/common'
import { Reflector } from '@nestjs/core'
import { ROLES_KEY } from '../decorators/roles.decorator'
import { Role } from '../enums/role.enum'

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    // 1. ดูว่าที่แปะป้าย @Roles ไว้ ต้องการยศอะไรบ้าง
    const requiredRoles = this.reflector.getAllAndOverride<Role[]>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ])

    // ถ้าไม่ได้แปะป้าย @Roles แปลว่าใครเข้าก็ได้ (Public) -> ปล่อยผ่าน
    if (!requiredRoles) {
      return true
    }

    // 2. ดึง User ออกมาจาก Request (ซึ่ง JwtStrategy เป็นคนยัดมาให้)
    const { user } = context.switchToHttp().getRequest()

    // กันเหนียว: ถ้าไม่มี User (ลืมใส่ AuthGuard) ให้ดีดออกเลย
    if (!user) {
      throw new ForbiddenException('Access Denied: User not found')
    }

    // 3. เช็คว่า User มียศตรงกับที่ต้องการไหม
    // เช่น required = ['ADMIN'], user.role = 'USER' -> false
    const hasRole = requiredRoles.includes(user.role)

    if (!hasRole) {
      throw new ForbiddenException('Access Denied: Insufficient permissions')
    }

    return true
  }
}
