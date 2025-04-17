import { useEffect, useMemo } from 'react'
import { View } from 'react-native'

import { router, Slot } from 'expo-router'

import { useUser } from '../../hooks'

export const PublicLayout = () => {
  const { isLoggedIn, loading, user } = useUser()

  const shouldCreateUser = useMemo(() => isLoggedIn && !user, [isLoggedIn, user])
  const shouldRedirect = useMemo(() => isLoggedIn && user, [isLoggedIn, user])

  useEffect(() => {
    if (!loading && shouldCreateUser) {
      router.replace('/(public)/CreateUser/name')
    }
  }, [loading, shouldCreateUser])

  useEffect(() => {
    if (!loading && shouldRedirect) {
      router.replace('/(private)')
    }
  }, [loading, shouldRedirect])

  if (loading) {
    return <View />
  }

  return <Slot />
}

export default PublicLayout
