import { Controller, Get, UseGuards } from '@nestjs/common'
import { AuthGuard } from '@nestjs/passport'
import { RolesGuard } from '../../common/guards/roles.guard' // 👈 Import Guard
import { Roles } from '../../common/decorators/roles.decorator' // 👈 Import Decorator
import { Role } from '../../common/enums/role.enum'

@Controller('admin')
@UseGuards(AuthGuard('jwt'), RolesGuard)
export class AdminController {
  @Get('dashboard')
  @Roles(Role.ADMIN)
  getAdminDashboard() {
    return { message: 'Welcome to Admin Dashboard (Top Secret)' }
  }

  @Get('public')
  @Roles(Role.USER, Role.ADMIN)
  getPublicData() {
    return { message: 'Hello everyone' }
  }
}
