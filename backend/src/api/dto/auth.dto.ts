import { z } from 'zod'

// 註冊 Schema
export const RegisterSchema = z.object({
  username: z.string().min(1, '使用者名稱不能為空').max(50, '使用者名稱最多 50 字元'),
  nickname: z.string().min(1, '暱稱不能為空').max(100, '暱稱最多 100 字元').optional(),
  password: z.string().min(6, '密碼至少需要 6 個字元').max(100, '密碼最多 100 字元'),
  role: z.enum(['user', 'organizer']).optional().default('user'),
})

export type RegisterDto = z.infer<typeof RegisterSchema>

// 登入 Schema
export const LoginSchema = z.object({
  username: z.string().min(1, '使用者名稱不能為空'),
  password: z.string().min(1, '密碼不能為空'),
})

export type LoginDto = z.infer<typeof LoginSchema>

// JWT Payload
export interface JwtPayload {
  sub: number // user id
  username: string
  role: string
}
