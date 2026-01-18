export interface Store {
  id: number
  name: string
  contact: string | null
  notes: string | null
  imageUrl: string | null
  categoryTags: string[] | null
  sortOrder: number
  isActive: boolean
  organizerId: number
  createdAt: string
  updatedAt: string
}

export interface CreateStoreDto {
  name: string
  contact?: string
  notes?: string
  imageUrl?: string
  categoryTags?: string[]
  sortOrder?: number
  isActive?: boolean
}

export interface UpdateStoreDto {
  name?: string
  contact?: string
  notes?: string
  imageUrl?: string
  categoryTags?: string[]
  sortOrder?: number
  isActive?: boolean
}
