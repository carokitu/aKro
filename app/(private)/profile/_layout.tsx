import { Redirect, Stack } from 'expo-router'

import { FeedProvider, useSpotifyAuth, useUser } from '../../../hooks'

export const PrivateLayout = () => {
  const { user } = useUser()
  const { accessToken } = useSpotifyAuth()

  if (!user || !accessToken) {
    return <Redirect href="/(public)" />
  }

  return (
    <FeedProvider>
      <Stack>
        <Stack.Screen name="me" options={{ headerShown: false }} />
        <Stack.Screen name="[username]" options={{ headerShown: false }} />
      </Stack>
    </FeedProvider>
  )
}

export default PrivateLayout
