import { z } from 'zod'

// 新增品項 Schema
export const CreateItemSchema = z.object({
  name: z.string().min(1, '品項名稱不能為空').max(100, '品項名稱最多 100 字元'),
  price: z.number().min(0, '價格必須大於等於 0'),
  category: z.string().max(50, '分類最多 50 字元').optional(),
  notes: z.string().optional(),
  storeId: z.number().int().positive('店家 ID 必須為正整數'),
  isActive: z.boolean().optional().default(true),
})

export type CreateItemDto = z.infer<typeof CreateItemSchema>

// 更新品項 Schema
export const UpdateItemSchema = z.object({
  name: z.string().min(1, '品項名稱不能為空').max(100, '品項名稱最多 100 字元').optional(),
  price: z.number().min(0, '價格必須大於等於 0').optional(),
  category: z.string().max(50, '分類最多 50 字元').optional(),
  notes: z.string().optional(),
  storeId: z.number().int().positive('店家 ID 必須為正整數').optional(),
  isActive: z.boolean().optional(),
})

export type UpdateItemDto = z.infer<typeof UpdateItemSchema>
