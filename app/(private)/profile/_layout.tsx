import { Redirect, Stack } from 'expo-router'

import { FeedProvider, useAuth } from '../../../hooks'
import { theme } from '../../../src/theme'

export const PrivateLayout = () => {
  const { user } = useAuth()

  if (!user) {
    return <Redirect href="/(public)" />
  }

  return (
    <FeedProvider>
      <Stack screenOptions={{ contentStyle: { backgroundColor: theme.surface.base.default } }}>
        <Stack.Screen name="[username]" options={{ headerShown: false }} />
        <Stack.Screen name="followers/[username]" options={{ headerShown: false }} />
        <Stack.Screen name="following/[username]" options={{ headerShown: false }} />
        <Stack.Screen name="settings" options={{ headerShown: false }} />
      </Stack>
    </FeedProvider>
  )
}

export default PrivateLayout
