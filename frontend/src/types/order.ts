export enum OrderStatus {
  OPEN = 'open',
  CLOSED = 'closed',
  COMPLETED = 'completed',
}

export interface Order {
  id: number
  name: string
  deadline: string
  storeId: number
  shareToken: string
  status: OrderStatus
  organizerId: number
  store?: {
    id: number
    name: string
  }
  items?: OrderItem[]
  createdAt: string
  updatedAt: string
}

export interface OrderItem {
  id: number
  orderId: number
  participantName: string
  itemId: number
  quantity: number
  customizationOptions: string | null // JSON string 或 null
  notes: string | null
  subtotal: number
  item?: {
    id: number
    name: string
    price: number
  }
  createdAt: string
  updatedAt: string
}

export interface CreateOrderDto {
  name: string
  deadline: string // ISO datetime string
  storeId: number
}

export interface UpdateOrderDto {
  name?: string
  deadline?: string // ISO datetime string
  status?: OrderStatus
}

export interface CartItem {
  itemId: number
  item: {
    id: number
    name: string
    price: number
    imageUrl: string | null
    category: string | null
  }
  quantity: number
  customizationOptions?: Record<string, string> // { "大小": "中", "辣度": "小辣" }
  notes?: string
}

export interface SubmitOrderDto {
  participantName: string
  items: {
    itemId: number
    quantity: number
    customizationOptions?: Record<string, string>
    notes?: string
  }[]
  notes?: string
}
