import { Test, TestingModule } from '@nestjs/testing'
import { getRepositoryToken } from '@nestjs/typeorm'
import { JwtService } from '@nestjs/jwt'
import { ConflictException, UnauthorizedException } from '@nestjs/common'
import { AuthService } from './auth.service'
import { User, UserRole } from '../entities/user.entity'
import * as bcrypt from 'bcrypt'

// Mock bcrypt
jest.mock('bcrypt', () => ({
  hash: jest.fn(),
  compare: jest.fn(),
}))

describe('AuthService', () => {
  let service: AuthService
  let userRepository: any
  let jwtService: JwtService

  const mockUser: User = {
    id: 1,
    username: 'testuser',
    nickname: '測試用戶',
    passwordHash: 'hashed_password',
    role: UserRole.ORGANIZER,
    createdAt: new Date(),
    updatedAt: new Date(),
  }

  const mockUserRepository = {
    findOne: jest.fn(),
    create: jest.fn(),
    save: jest.fn(),
  }

  const mockJwtService = {
    sign: jest.fn().mockReturnValue('mock-jwt-token'),
  }

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: getRepositoryToken(User),
          useValue: mockUserRepository,
        },
        {
          provide: JwtService,
          useValue: mockJwtService,
        },
      ],
    }).compile()

    service = module.get<AuthService>(AuthService)
    userRepository = module.get(getRepositoryToken(User))
    jwtService = module.get<JwtService>(JwtService)

    jest.clearAllMocks()
  })

  describe('register', () => {
    const registerDto = {
      username: 'newuser',
      password: 'password123',
      nickname: '新用戶',
      role: 'organizer' as const,
    }

    it('應該成功註冊新用戶', async () => {
      mockUserRepository.findOne.mockResolvedValue(null)
      mockUserRepository.create.mockReturnValue({
        ...mockUser,
        username: registerDto.username,
        nickname: registerDto.nickname,
      })
      mockUserRepository.save.mockResolvedValue({
        ...mockUser,
        username: registerDto.username,
        nickname: registerDto.nickname,
      })
      ;(bcrypt.hash as jest.Mock).mockResolvedValue('hashed_password')

      const result = await service.register(registerDto)

      expect(result.user.username).toBe(registerDto.username)
      expect(result.token).toBe('mock-jwt-token')
      expect(result.user).not.toHaveProperty('passwordHash')
      expect(mockUserRepository.save).toHaveBeenCalled()
    })

    it('用戶名已存在時應該拋出 ConflictException', async () => {
      mockUserRepository.findOne.mockResolvedValue(mockUser)

      await expect(service.register(registerDto)).rejects.toThrow(ConflictException)
      expect(mockUserRepository.save).not.toHaveBeenCalled()
    })

    it('沒有提供角色時應該預設為 user', async () => {
      mockUserRepository.findOne.mockResolvedValue(null)
      mockUserRepository.create.mockImplementation((data) => ({
        ...mockUser,
        ...data,
        role: data.role,
      }))
      mockUserRepository.save.mockImplementation((user) => Promise.resolve(user))
      ;(bcrypt.hash as jest.Mock).mockResolvedValue('hashed_password')

      await service.register({ username: 'test', password: 'pass123' })

      expect(mockUserRepository.create).toHaveBeenCalledWith(
        expect.objectContaining({
          role: UserRole.USER,
        })
      )
    })
  })

  describe('login', () => {
    const loginDto = {
      username: 'testuser',
      password: 'password123',
    }

    it('應該成功登入並返回 token', async () => {
      mockUserRepository.findOne.mockResolvedValue(mockUser)
      ;(bcrypt.compare as jest.Mock).mockResolvedValue(true)

      const result = await service.login(loginDto)

      expect(result.user.username).toBe(mockUser.username)
      expect(result.token).toBe('mock-jwt-token')
      expect(result.user).not.toHaveProperty('passwordHash')
    })

    it('用戶不存在時應該拋出 UnauthorizedException', async () => {
      mockUserRepository.findOne.mockResolvedValue(null)

      await expect(service.login(loginDto)).rejects.toThrow(UnauthorizedException)
    })

    it('密碼錯誤時應該拋出 UnauthorizedException', async () => {
      mockUserRepository.findOne.mockResolvedValue(mockUser)
      ;(bcrypt.compare as jest.Mock).mockResolvedValue(false)

      await expect(service.login(loginDto)).rejects.toThrow(UnauthorizedException)
    })

    it('用戶沒有密碼雜湊時應該拋出 UnauthorizedException', async () => {
      mockUserRepository.findOne.mockResolvedValue({ ...mockUser, passwordHash: null })

      await expect(service.login(loginDto)).rejects.toThrow(UnauthorizedException)
    })
  })

  describe('findById', () => {
    it('應該根據 ID 找到用戶', async () => {
      mockUserRepository.findOne.mockResolvedValue(mockUser)

      const result = await service.findById(1)

      expect(result).toEqual(mockUser)
      expect(mockUserRepository.findOne).toHaveBeenCalledWith({ where: { id: 1 } })
    })

    it('用戶不存在時應該返回 null', async () => {
      mockUserRepository.findOne.mockResolvedValue(null)

      const result = await service.findById(999)

      expect(result).toBeNull()
    })
  })

  describe('findByUsername', () => {
    it('應該根據用戶名找到用戶', async () => {
      mockUserRepository.findOne.mockResolvedValue(mockUser)

      const result = await service.findByUsername('testuser')

      expect(result).toEqual(mockUser)
      expect(mockUserRepository.findOne).toHaveBeenCalledWith({ where: { username: 'testuser' } })
    })
  })

  describe('validateUser', () => {
    it('應該驗證 JWT payload 並返回用戶', async () => {
      mockUserRepository.findOne.mockResolvedValue(mockUser)

      const payload = { sub: 1, username: 'testuser', role: UserRole.ORGANIZER }
      const result = await service.validateUser(payload)

      expect(result).toEqual(mockUser)
    })
  })
})
