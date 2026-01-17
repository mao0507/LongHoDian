export type UserRole = 'user' | 'organizer'

export interface User {
  id: number
  username: string
  nickname: string | null
  role: UserRole
  createdAt: string
  updatedAt: string
}
