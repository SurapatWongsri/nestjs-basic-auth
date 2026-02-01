import {
  ConflictException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common'
import { UsersService } from '../users/users.service'
import { JwtService } from '@nestjs/jwt'
import { AuthDto, LoginDto } from './dto/auth.dto'
import * as bcrypt from 'bcrypt'
import { ConfigService } from '@nestjs/config'

// สร้าง Type สำหรับ Return ค่าออกไป (เพื่อให้ Controller รู้ Type)
export type AuthResponse = {
  data: {
    tokens: {
      accessToken?: string
      refreshToken?: string
    }
    user: {
      id: string
      email: string
      name: string | null
    }
  }
  message?: string
}

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
    private configService: ConfigService,
  ) {}

  async signUp(dto: AuthDto): Promise<AuthResponse> {
    const existingUser = await this.usersService.findByEmail(dto.email)
    if (existingUser) {
      throw new ConflictException({ message: 'Email already exists' })
    }

    const hashedPassword = await bcrypt.hash(dto.password, 10)
    const [newUser] = await this.usersService.create({
      email: dto.email,
      password: hashedPassword,
      name: dto.name,
    })

    return {
      message: 'Sign up successfully',
      data: {
        tokens: {
          accessToken: undefined,
          refreshToken: undefined,
        },
        user: {
          id: newUser.id,
          email: newUser.email,
          name: newUser.name,
        },
      },
    }
  }

  async login(dto: LoginDto): Promise<AuthResponse> {
    const user = await this.usersService.findByEmail(dto.email)

    if (!user) {
      throw new UnauthorizedException('Email or password is not correct')
    }

    const isMatch = await bcrypt.compare(dto.password, user.password)
    if (!isMatch) {
      throw new UnauthorizedException('Email or password is not correct')
    }

    const tokens = await this.getTokens(user.id, user.email)
    await this.updateRefreshToken(user.id, tokens.refreshToken)

    return {
      message: 'Login successfully',
      data: {
        tokens: {
          accessToken: tokens.accessToken,
          refreshToken: tokens.refreshToken,
        },
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
        },
      },
    }
  }

  async refreshToken(refreshToken: string): Promise<AuthResponse> {
    try {
      // 1. Verify Refresh Token (ใช้ Secret ของ Refresh Token)
      const payload = await this.jwtService.verifyAsync<{
        sub: string
        email: string
      }>(refreshToken, {
        secret: this.configService.getOrThrow('JWT_REFRESH_SECRET'),
      })

      // 2. Check User & Stored Token
      const user = await this.usersService.findById(payload.sub)
      if (!user || !user.hashedRefreshToken) {
        throw new UnauthorizedException('Access Denied')
      }

      const refreshTokenMatches = await bcrypt.compare(
        refreshToken,
        user.hashedRefreshToken,
      )
      if (!refreshTokenMatches) {
        throw new UnauthorizedException('Access Denied')
      }

      // 3. Rotate Tokens
      const tokens = await this.getTokens(user.id, user.email)
      await this.updateRefreshToken(user.id, tokens.refreshToken)

      return {
        message: 'Refresh token successfully',
        data: {
          tokens: {
            accessToken: tokens.accessToken,
            refreshToken: tokens.refreshToken,
          },
          user: {
            id: user.id,
            email: user.email,
            name: user.name,
          },
        },
      }
    } catch {
      throw new UnauthorizedException('Invalid Refresh Token')
    }
  }

  async updateRefreshToken(userId: string, refreshToken: string) {
    const hash = await bcrypt.hash(refreshToken, 10)
    await this.usersService.updateRefreshToken(userId, hash)
  }

  async getTokens(userId: string, email: string) {
    const payload = { sub: userId, email }
    const [at, rt] = await Promise.all([
      this.jwtService.signAsync(payload, {
        secret: this.configService.getOrThrow('JWT_SECRET'),
        expiresIn: '15m', // Access Token อายุสั้น
      }),
      this.jwtService.signAsync(payload, {
        secret: this.configService.getOrThrow('JWT_REFRESH_SECRET'),
        expiresIn: '7d', // Refresh Token อายุยาว
      }),
    ])

    return {
      accessToken: at,
      refreshToken: rt,
    }
  }
}
