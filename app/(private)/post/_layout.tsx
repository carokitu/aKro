import { Redirect, Stack } from 'expo-router'

import { useAuth } from '../../../hooks'
import { theme } from '../../../src/theme'

export const PrivateLayout = () => {
  const { user } = useAuth()

  if (!user) {
    return <Redirect href="/(public)" />
  }

  return (
    <Stack screenOptions={{ contentStyle: { backgroundColor: theme.surface.base.default } }}>
      <Stack.Screen name="[id]" options={{ headerShown: false }} />
    </Stack>
  )
}

export default PrivateLayout
