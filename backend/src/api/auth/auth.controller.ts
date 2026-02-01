import { Controller, Post, Body, Get, UseGuards, Request } from '@nestjs/common'
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiBody,
} from '@nestjs/swagger'
import { AuthService } from './auth.service'
import { RegisterSchema, RegisterDto, LoginSchema, LoginDto } from '../dto/auth.dto'
import { ZodValidationPipe } from '../pipes/zod-validation.pipe'
import { JwtAuthGuard } from './jwt-auth.guard'
import { Public } from './public.decorator'

@ApiTags('Auth')
@Controller('api/auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Public()
  @Post('register')
  @ApiOperation({ summary: '用戶註冊', description: '註冊新用戶帳號，可選擇 user 或 organizer 角色' })
  @ApiBody({
    description: '註冊資訊',
    schema: {
      type: 'object',
      required: ['username', 'password'],
      properties: {
        username: { type: 'string', minLength: 1, maxLength: 50, example: 'john_doe' },
        password: { type: 'string', minLength: 6, maxLength: 100, example: 'password123' },
        nickname: { type: 'string', maxLength: 50, example: '小明', nullable: true },
        role: { type: 'string', enum: ['user', 'organizer'], default: 'user', example: 'organizer' },
      },
    },
  })
  @ApiResponse({ status: 201, description: '註冊成功，返回用戶資訊和 JWT Token' })
  @ApiResponse({ status: 400, description: '請求參數錯誤或用戶名已存在' })
  async register(@Body(ZodValidationPipe(RegisterSchema)) registerDto: RegisterDto) {
    return this.authService.register(registerDto)
  }

  @Public()
  @Post('login')
  @ApiOperation({ summary: '用戶登入', description: '使用用戶名和密碼登入，返回 JWT Token' })
  @ApiBody({
    description: '登入資訊',
    schema: {
      type: 'object',
      required: ['username', 'password'],
      properties: {
        username: { type: 'string', example: 'john_doe' },
        password: { type: 'string', example: 'password123' },
      },
    },
  })
  @ApiResponse({
    status: 200,
    description: '登入成功',
    schema: {
      type: 'object',
      properties: {
        access_token: { type: 'string', description: 'JWT Token' },
        user: {
          type: 'object',
          properties: {
            id: { type: 'number' },
            username: { type: 'string' },
            nickname: { type: 'string', nullable: true },
            role: { type: 'string', enum: ['user', 'organizer'] },
          },
        },
      },
    },
  })
  @ApiResponse({ status: 401, description: '用戶名或密碼錯誤' })
  async login(@Body(ZodValidationPipe(LoginSchema)) loginDto: LoginDto) {
    return this.authService.login(loginDto)
  }

  @UseGuards(JwtAuthGuard)
  @Get('profile')
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: '取得個人資料', description: '取得當前登入用戶的詳細資料' })
  @ApiResponse({
    status: 200,
    description: '成功取得用戶資料',
    schema: {
      type: 'object',
      properties: {
        user: {
          type: 'object',
          properties: {
            id: { type: 'number' },
            username: { type: 'string' },
            nickname: { type: 'string', nullable: true },
            role: { type: 'string' },
            createdAt: { type: 'string', format: 'date-time' },
            updatedAt: { type: 'string', format: 'date-time' },
          },
        },
      },
    },
  })
  @ApiResponse({ status: 401, description: '未授權，需要有效的 JWT Token' })
  async getProfile(@Request() req) {
    const { passwordHash, ...user } = req.user
    return { user }
  }

  @UseGuards(JwtAuthGuard)
  @Get('me')
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: '取得個人資料（別名）', description: '與 /profile 相同，取得當前登入用戶的資料' })
  @ApiResponse({ status: 200, description: '成功取得用戶資料' })
  @ApiResponse({ status: 401, description: '未授權' })
  async getMe(@Request() req) {
    const { passwordHash, ...user } = req.user
    return { user }
  }
}
