export interface Item {
  id: number
  name: string
  price: number
  category: string | null
  notes: string | null
  isActive: boolean
  storeId: number
  createdAt: string
  updatedAt: string
}

export interface CreateItemDto {
  name: string
  price: number
  category?: string
  notes?: string
  storeId: number
  isActive?: boolean
}

export interface UpdateItemDto {
  name?: string
  price?: number
  category?: string
  notes?: string
  storeId?: number
  isActive?: boolean
}
