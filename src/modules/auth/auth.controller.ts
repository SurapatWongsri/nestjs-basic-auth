import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Post,
  UseGuards,
} from '@nestjs/common'
import { AuthDto, LoginDto, RefreshTokenDto } from './dto/auth.dto'
import { AuthService } from './auth.service'
import { AuthGuard } from '@nestjs/passport'
import { CurrentUser } from 'src/common/decorators/current-user.decorator'
import type { User } from '../users/users.service'

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @HttpCode(HttpStatus.CREATED)
  @Post('signup')
  async signUp(@Body() dto: AuthDto) {
    return await this.authService.signUp(dto)
  }

  @HttpCode(HttpStatus.OK)
  @Post('login')
  async login(@Body() dto: LoginDto) {
    return await this.authService.login(dto)
  }

  @HttpCode(HttpStatus.OK)
  @Post('refresh')
  async refresh(@Body() dto: RefreshTokenDto) {
    return await this.authService.refreshToken(dto.refreshToken)
  }

  @Get('me')
  @HttpCode(HttpStatus.OK)
  @UseGuards(AuthGuard('jwt')) // 🔒 ล็อคประตู! ต้องมี Token ถึงจะเข้าได้
  getProfile(@CurrentUser() user: User) {
    // user ตรงนี้จะมี Type ครบถ้วน ไม่ต้องเดา
    return {
      statusCode: HttpStatus.OK,
      data: {
        id: user.id,
        email: user.email,
        name: user.name,
      },
    }
  }
}
