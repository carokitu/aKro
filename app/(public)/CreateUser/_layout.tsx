import { Stack } from 'expo-router'

import { UserRegistrationProvider } from '../../../hooks/useUserRegistration'

const CreateUserLayout = () => {
  return (
    <UserRegistrationProvider>
      <Stack>
        <Stack.Screen
          name="name"
          options={{
            headerShown: false,
          }}
        />
        <Stack.Screen
          name="username"
          options={{
            headerShown: false,
          }}
        />
        <Stack.Screen
          name="birthday"
          options={{
            headerShown: false,
          }}
        />
        <Stack.Screen
          name="avatar"
          options={{
            headerShown: false,
          }}
        />
      </Stack>
    </UserRegistrationProvider>
  )
}

export default CreateUserLayout
