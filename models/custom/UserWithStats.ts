import { type User } from '../User'

export type UserWithStats = Pick<User, 'avatar_url' | 'id' | 'name' | 'username'> & {
  follows_me: boolean
  is_followed: boolean
  mutual_count: number
}
