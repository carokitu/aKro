import { Stack } from 'expo-router'

import { UserRegistrationProvider } from '../../../hooks/useUserRegistration'

const CreateUserLayout = () => {
  return (
    <UserRegistrationProvider>
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="avatar" />
        <Stack.Screen name="birthday" />
        <Stack.Screen name="name" />
        <Stack.Screen name="username" />
      </Stack>
    </UserRegistrationProvider>
  )
}

export default CreateUserLayout
