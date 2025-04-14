import { useEffect } from 'react'
import { View } from 'react-native'

import { router, Slot } from 'expo-router'

import { useUser } from '../../hooks'

export const PublicLayout = () => {
  const { isLoggedIn, loading, user } = useUser()

  // const shouldCreateUser = useMemo(() => isLoggedIn && !user, [isLoggedIn, user])
  const shouldCreateUser = true

  useEffect(() => {
    if (!loading && shouldCreateUser) {
      router.replace('/(public)/CreateUser/name')
    }
  }, [loading, shouldCreateUser])

  if (loading) {
    return <View />
  }

  return <Slot />
}

export default PublicLayout
