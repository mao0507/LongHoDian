import { Controller, Post, Body, Get, UseGuards, Request } from '@nestjs/common'
import { AuthService } from './auth.service'
import { RegisterSchema, RegisterDto, LoginSchema, LoginDto } from '../dto/auth.dto'
import { ZodValidationPipe } from '../pipes/zod-validation.pipe'
import { JwtAuthGuard } from './jwt-auth.guard'
import { Public } from './public.decorator'

@Controller('api/auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Public()
  @Post('register')
  async register(@Body(ZodValidationPipe(RegisterSchema)) registerDto: RegisterDto) {
    return this.authService.register(registerDto)
  }

  @Public()
  @Post('login')
  async login(@Body(ZodValidationPipe(LoginSchema)) loginDto: LoginDto) {
    return this.authService.login(loginDto)
  }

  @UseGuards(JwtAuthGuard)
  @Get('profile')
  async getProfile(@Request() req) {
    const { passwordHash, ...user } = req.user
    return { user }
  }

  @UseGuards(JwtAuthGuard)
  @Get('me')
  async getMe(@Request() req) {
    const { passwordHash, ...user } = req.user
    return { user }
  }
}
