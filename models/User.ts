export type PrivateUser = {
  avatar_url?: null | string
  bio?: null | string
  birthday?: Date | null
  created_at: string
  email?: string
  id: string
  name: string
  phone?: null | string
  username: string
}

export type User = Omit<PrivateUser, 'email' | 'phone'>
