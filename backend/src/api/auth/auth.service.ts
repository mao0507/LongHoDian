import { Injectable, UnauthorizedException, ConflictException } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
import { JwtService } from '@nestjs/jwt'
import * as bcrypt from 'bcrypt'
import { User, UserRole } from '../entities/user.entity'
import { RegisterDto, LoginDto, JwtPayload } from '../dto/auth.dto'

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
    private jwtService: JwtService,
  ) {}

  /**
   * 註冊新用戶
   */
  async register(registerDto: RegisterDto): Promise<{ user: Omit<User, 'passwordHash'>; token: string }> {
    const { username, nickname, password, role = 'user' } = registerDto

    // 檢查用戶名是否已存在
    const existingUser = await this.userRepository.findOne({ where: { username } })
    if (existingUser) {
      throw new ConflictException('使用者名稱已被使用')
    }

    // 雜湊密碼
    const saltRounds = 10
    const passwordHash = await bcrypt.hash(password, saltRounds)

    // 建立新用戶
    const user = this.userRepository.create({
      username,
      nickname: nickname || username,
      passwordHash,
      role: role === 'organizer' ? UserRole.ORGANIZER : UserRole.USER,
    })

    await this.userRepository.save(user)

    // 生成 JWT token
    const token = this.generateToken(user)

    // 移除密碼雜湊後返回
    const { passwordHash: _, ...userWithoutPassword } = user
    return { user: userWithoutPassword, token }
  }

  /**
   * 登入
   */
  async login(loginDto: LoginDto): Promise<{ user: Omit<User, 'passwordHash'>; token: string }> {
    const { username, password } = loginDto

    const user = await this.userRepository.findOne({ where: { username } })
    if (!user) {
      throw new UnauthorizedException('使用者名稱或密碼錯誤')
    }

    // 驗證密碼
    if (!user.passwordHash) {
      throw new UnauthorizedException('使用者名稱或密碼錯誤')
    }

    const isPasswordValid = await bcrypt.compare(password, user.passwordHash)
    if (!isPasswordValid) {
      throw new UnauthorizedException('使用者名稱或密碼錯誤')
    }

    // 生成 JWT token
    const token = this.generateToken(user)

    // 移除密碼雜湊後返回
    const { passwordHash, ...userWithoutPassword } = user
    return { user: userWithoutPassword, token }
  }

  /**
   * 根據 ID 查找用戶
   */
  async findById(id: number): Promise<User | null> {
    return this.userRepository.findOne({ where: { id } })
  }

  /**
   * 根據用戶名查找用戶
   */
  async findByUsername(username: string): Promise<User | null> {
    return this.userRepository.findOne({ where: { username } })
  }

  /**
   * 生成 JWT Token
   */
  private generateToken(user: User): string {
    const payload: JwtPayload = {
      sub: user.id,
      username: user.username,
      role: user.role,
    }
    return this.jwtService.sign(payload)
  }

  /**
   * 驗證 JWT Token
   */
  async validateUser(payload: JwtPayload): Promise<User | null> {
    return this.findById(payload.sub)
  }
}
