import { Stack } from 'expo-router'

import { theme } from '../../../src/theme'

const CreateUserLayout = () => {
  return (
    <Stack screenOptions={{ contentStyle: { backgroundColor: theme.surface.base.default }, headerShown: false }}>
      <Stack.Screen name="avatar" />
      <Stack.Screen name="birthday" />
      <Stack.Screen name="name" />
      <Stack.Screen name="username" />
    </Stack>
  )
}

export default CreateUserLayout
