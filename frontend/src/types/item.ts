export interface CustomizationOption {
  id?: number
  optionName: string
  optionValues: string[]
  defaultValue?: string
  template?: string
}

export interface Item {
  id: number
  name: string
  price: number
  category: string | null
  notes: string | null
  description: string | null
  imageUrl: string | null
  sortOrder: number
  isRecommended: boolean
  isActive: boolean
  storeId: number
  customizationOptions?: CustomizationOption[]
  createdAt: string
  updatedAt: string
}

export interface CreateItemDto {
  name: string
  price: number
  description?: string
  category?: string
  notes?: string
  imageUrl?: string
  sortOrder?: number
  isRecommended?: boolean
  storeId: number
  isActive?: boolean
  customizationOptions?: CustomizationOption[]
}

export interface UpdateItemDto {
  name?: string
  price?: number
  description?: string
  category?: string
  notes?: string
  imageUrl?: string
  sortOrder?: number
  isRecommended?: boolean
  storeId?: number
  isActive?: boolean
  customizationOptions?: CustomizationOption[]
}
