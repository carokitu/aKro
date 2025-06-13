import { Stack } from 'expo-router'

import { theme } from '../../../../src/theme'

export const SettingsLayout = () => {
  return (
    <Stack screenOptions={{ contentStyle: { backgroundColor: theme.surface.base.default } }}>
      <Stack.Screen name="index" options={{ headerShown: false }} />
      <Stack.Screen name="edit-profile" options={{ headerShown: false }} />
      <Stack.Screen name="signal-issue" options={{ headerShown: false }} />
      <Stack.Screen name="privacy-policy" options={{ headerShown: false }} />
    </Stack>
  )
}

export default SettingsLayout
