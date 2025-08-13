import { type StreamingPlatforms } from '../constants'

export type PrivateUser = {
  avatar_url?: null | string
  bio?: null | string
  birthday?: Date | null
  created_at: string
  email?: string
  id: string
  name: string
  phone?: null | string
  streaming_platform?: StreamingPlatforms
  username: string
}

export type User = Omit<PrivateUser, 'email' | 'phone'>
