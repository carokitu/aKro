import { Redirect, Stack } from 'expo-router'

import { useUser } from '../../../hooks'
import { theme } from '../../../src/theme'

export const PrivateLayout = () => {
  const { user } = useUser()

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
