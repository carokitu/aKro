import { useUser } from './useUser'

export const useUserPrivate = () => {
  const { user } = useUser()

  if (!user) {
    throw new Error('useRequiredUser must be used in private routes')
  }

  return user
}
