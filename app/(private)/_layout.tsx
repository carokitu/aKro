import { StatusBar } from 'react-native'

import { Redirect, Stack } from 'expo-router'

import { FeedProvider, MuteProvider, useSpotifyAuth, useUser } from '../../hooks'
import { SplashScreen } from '../../src'
import { theme } from '../../src/theme'

export const PrivateLayout = () => {
  const { loading: userLoading, user } = useUser()
  const { accessToken, loading: tokenLoading } = useSpotifyAuth()

  if (userLoading || tokenLoading) {
    return <SplashScreen />
  }

  if (!user || !accessToken) {
    return <Redirect href="/(public)" />
  }

  return (
    <FeedProvider>
      <MuteProvider>
        <StatusBar backgroundColor={theme.surface.base.default} barStyle="dark-content" />
        <Stack screenOptions={{ contentStyle: { backgroundColor: theme.surface.base.default } }}>
          <Stack.Screen name="feed" options={{ headerShown: false }} />
          <Stack.Screen name="search-users" options={{ headerShown: false }} />
          <Stack.Screen name="profile" options={{ headerShown: false }} />
          <Stack.Screen name="post" options={{ headerShown: false }} />
        </Stack>
      </MuteProvider>
    </FeedProvider>
  )
}

export default PrivateLayout
