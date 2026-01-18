import { z } from 'zod'

// 客製化選項 Schema
export const CustomizationOptionSchema = z.object({
  id: z.number().optional(),
  optionName: z.string().min(1, '選項名稱不能為空').max(100, '選項名稱最多 100 字元'),
  optionValues: z.array(z.string()).min(1, '至少需要一個選項值'),
  defaultValue: z.string().optional(),
  template: z.string().optional(),
})

export type CustomizationOptionDto = z.infer<typeof CustomizationOptionSchema>

// 新增品項 Schema
export const CreateItemSchema = z.object({
  name: z.string().min(1, '品項名稱不能為空').max(100, '品項名稱最多 100 字元'),
  price: z.number().min(0, '價格必須大於等於 0'),
  description: z.string().optional(),
  category: z.string().max(50, '分類最多 50 字元').optional(),
  notes: z.string().optional(),
  imageUrl: z
    .union([z.string().url('圖片 URL 格式不正確'), z.literal('')])
    .optional()
    .transform((val) => (val === '' ? undefined : val)),
  sortOrder: z.number().int().min(0).optional().default(0),
  isRecommended: z.boolean().optional().default(false),
  storeId: z.number().int().positive('店家 ID 必須為正整數'),
  isActive: z.boolean().optional().default(true),
  customizationOptions: z.array(CustomizationOptionSchema).optional(),
})

export type CreateItemDto = z.infer<typeof CreateItemSchema>

// 更新品項 Schema
export const UpdateItemSchema = z.object({
  name: z.string().min(1, '品項名稱不能為空').max(100, '品項名稱最多 100 字元').optional(),
  price: z.number().min(0, '價格必須大於等於 0').optional(),
  description: z.string().optional(),
  category: z.string().max(50, '分類最多 50 字元').optional(),
  notes: z.string().optional(),
  imageUrl: z
    .union([z.string().url('圖片 URL 格式不正確'), z.literal('')])
    .optional()
    .transform((val) => (val === '' ? undefined : val)),
  sortOrder: z.number().int().min(0).optional(),
  isRecommended: z.boolean().optional(),
  storeId: z.number().int().positive('店家 ID 必須為正整數').optional(),
  isActive: z.boolean().optional(),
  customizationOptions: z.array(CustomizationOptionSchema).optional(),
})

export type UpdateItemDto = z.infer<typeof UpdateItemSchema>
