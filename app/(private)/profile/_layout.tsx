import { Redirect, Stack } from 'expo-router'

import { FeedProvider, useSpotifyAuth, useUser } from '../../../hooks'
import { theme } from '../../../src/theme'

export const PrivateLayout = () => {
  const { user } = useUser()
  const { accessToken } = useSpotifyAuth()

  if (!user || !accessToken) {
    return <Redirect href="/(public)" />
  }

  return (
    <FeedProvider>
      <Stack screenOptions={{ contentStyle: { backgroundColor: theme.surface.base.default } }}>
        <Stack.Screen name="me" options={{ headerShown: false }} />
        <Stack.Screen name="[username]" options={{ headerShown: false }} />
        <Stack.Screen name="followers/[username]" options={{ headerShown: false }} />
        <Stack.Screen name="following/[username]" options={{ headerShown: false }} />
      </Stack>
    </FeedProvider>
  )
}

export default PrivateLayout
