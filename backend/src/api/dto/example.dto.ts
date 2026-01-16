import { z } from 'zod'

// Zod 驗證 Schema 範例
export const CreateExampleSchema = z.object({
  name: z.string().min(1, '名稱不能為空'),
  email: z.string().email('請輸入有效的電子郵件'),
  age: z.number().int().min(0).max(150).optional(),
})

export type CreateExampleDto = z.infer<typeof CreateExampleSchema>
