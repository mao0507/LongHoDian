import { z } from 'zod'

// 新增店家 Schema
export const CreateStoreSchema = z.object({
  name: z.string().min(1, '店家名稱不能為空').max(100, '店家名稱最多 100 字元'),
  contact: z.string().max(200, '聯絡方式最多 200 字元').optional(),
  notes: z.string().optional(),
  imageUrl: z
    .union([z.string().url('圖片 URL 格式不正確'), z.literal('')])
    .optional()
    .transform((val) => (val === '' ? undefined : val)),
  categoryTags: z.array(z.string()).optional(),
  sortOrder: z.number().int().min(0).optional().default(0),
  isActive: z.boolean().optional().default(true),
})

export type CreateStoreDto = z.infer<typeof CreateStoreSchema>

// 更新店家 Schema
export const UpdateStoreSchema = z.object({
  name: z.string().min(1, '店家名稱不能為空').max(100, '店家名稱最多 100 字元').optional(),
  contact: z.string().max(200, '聯絡方式最多 200 字元').optional(),
  notes: z.string().optional(),
  imageUrl: z
    .union([z.string().url('圖片 URL 格式不正確'), z.literal('')])
    .optional()
    .transform((val) => (val === '' ? undefined : val)),
  categoryTags: z.array(z.string()).optional(),
  sortOrder: z.number().int().min(0).optional(),
  isActive: z.boolean().optional(),
})

export type UpdateStoreDto = z.infer<typeof UpdateStoreSchema>
