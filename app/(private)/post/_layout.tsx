import { Redirect, Stack } from 'expo-router'

import { useSpotifyAuth, useUser } from '../../../hooks'
import { theme } from '../../../src/theme'

export const PrivateLayout = () => {
  const { user } = useUser()
  const { accessToken } = useSpotifyAuth()

  if (!user || !accessToken) {
    return <Redirect href="/(public)" />
  }

  return (
    <Stack screenOptions={{ contentStyle: { backgroundColor: theme.surface.base.default } }}>
      <Stack.Screen name="[id]" options={{ headerShown: false }} />
    </Stack>
  )
}

export default PrivateLayout
