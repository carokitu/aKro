import { useAuth } from './useAuth'

export const useUser = () => {
  const { user } = useAuth()

  if (!user) {
    throw new Error('useRequiredUser must be used in private routes')
  }

  return user
}
