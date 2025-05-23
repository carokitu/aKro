import { StatusBar } from 'react-native'

import { Redirect, Stack } from 'expo-router'

import { FeedProvider, useSpotifyAuth, useUser } from '../../hooks'
import { theme } from '../../src/theme'

export const PrivateLayout = () => {
  const { user } = useUser()
  const { accessToken } = useSpotifyAuth()

  if (!user || !accessToken) {
    return <Redirect href="/(public)" />
  }

  return (
    <FeedProvider>
      <StatusBar backgroundColor={theme.surface.base.default} barStyle="dark-content" />
      <Stack>
        <Stack.Screen name="feed" options={{ headerShown: false }} />
        <Stack.Screen name="search-users" options={{ headerShown: false }} />
        <Stack.Screen name="profile" options={{ headerShown: false }} />
      </Stack>
    </FeedProvider>
  )
}

export default PrivateLayout
