export interface Store {
  id: number
  name: string
  contact: string | null
  notes: string | null
  isActive: boolean
  organizerId: number
  createdAt: string
  updatedAt: string
}

export interface CreateStoreDto {
  name: string
  contact?: string
  notes?: string
  isActive?: boolean
}

export interface UpdateStoreDto {
  name?: string
  contact?: string
  notes?: string
  isActive?: boolean
}
