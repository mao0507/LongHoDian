import { z } from 'zod'

// 建立訂單 Schema（召集人）
export const CreateOrderSchema = z.object({
  name: z.string().min(1, '訂單名稱不能為空').max(100, '訂單名稱最多 100 字元'),
  deadline: z.string().datetime('截止時間格式不正確').transform((val) => new Date(val)),
  storeId: z.number().int().positive('店家 ID 必須為正整數'),
})

export type CreateOrderDto = z.infer<typeof CreateOrderSchema>

// 點餐項目 Schema
export const OrderItemSchema = z.object({
  itemId: z.number().int().positive('品項 ID 必須為正整數'),
  quantity: z.number().int().min(1, '數量必須大於等於 1'),
  customizationOptions: z.record(z.string(), z.string()).optional(), // { "大小": "中", "辣度": "小辣" }
  notes: z.string().optional(),
})

export type OrderItemDto = z.infer<typeof OrderItemSchema>

// 提交點餐 Schema（匿名用戶）
export const SubmitOrderSchema = z.object({
  participantName: z.string().min(1, '參與者姓名不能為空').max(100, '參與者姓名最多 100 字元'),
  items: z.array(OrderItemSchema).min(1, '至少需要一個品項'),
  notes: z.string().optional(),
})

export type SubmitOrderDto = z.infer<typeof SubmitOrderSchema>

// 更新訂單 Schema
export const UpdateOrderSchema = z.object({
  name: z.string().min(1, '訂單名稱不能為空').max(100, '訂單名稱最多 100 字元').optional(),
  deadline: z
    .string()
    .datetime('截止時間格式不正確')
    .transform((val) => new Date(val))
    .optional(),
  status: z.enum(['open', 'closed', 'completed']).optional(),
})

export type UpdateOrderDto = z.infer<typeof UpdateOrderSchema>
