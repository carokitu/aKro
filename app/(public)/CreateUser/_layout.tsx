import { Stack } from 'expo-router'

import { UserRegistrationProvider } from '../../../hooks/useUserRegistration'
import { theme } from '../../../src/theme'

const CreateUserLayout = () => {
  return (
    <UserRegistrationProvider>
      <Stack screenOptions={{ contentStyle: { backgroundColor: theme.surface.base.default }, headerShown: false }}>
        <Stack.Screen name="avatar" />
        <Stack.Screen name="birthday" />
        <Stack.Screen name="name" />
        <Stack.Screen name="username" />
      </Stack>
    </UserRegistrationProvider>
  )
}

export default CreateUserLayout
