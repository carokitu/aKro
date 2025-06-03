import { useEffect, useMemo } from 'react'
import { View } from 'react-native'

import { router, Stack } from 'expo-router'

import { useSpotifyAuth, useUser } from '../../hooks'
import { theme } from '../../src/theme'

export const PublicLayout = () => {
  const { isLoggedIn, loading, user } = useUser()
  const { accessToken } = useSpotifyAuth()

  const shouldCreateUser = useMemo(() => isLoggedIn && !user, [isLoggedIn, user])
  const shouldRedirect = useMemo(() => isLoggedIn && user && accessToken, [accessToken, isLoggedIn, user])

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

  return (
    <Stack screenOptions={{ contentStyle: { backgroundColor: theme.surface.base.default }, headerShown: false }}>
      <Stack.Screen name="index" />
      <Stack.Screen name="password" />
      <Stack.Screen name="provider-sign-in" />
      <Stack.Screen name="sign-in" />
      <Stack.Screen name="sign-in-with-email" />
      <Stack.Screen name="verify-code" />
    </Stack>
  )
}

export default PublicLayout
