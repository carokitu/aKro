import { useAuth } from './useAuth'
import * as Sentry from '@sentry/react-native'

export const useUser = () => {
  const { user } = useAuth()

  if (!user) {
    Sentry.captureException(new Error('useRequiredUser must be used in private routes'))
    throw new Error('useRequiredUser must be used in private routes')
  }

  return user
}
