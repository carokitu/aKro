import { Dimensions } from 'react-native'

import { Stack } from 'expo-router'

const RootLayout = () => {
  return (
    <Stack
      screenOptions={{
        contentStyle: {
          flex: 1,
          height: Dimensions.get('window').height,
          width: Dimensions.get('window').width,
        },
      }}
    >
      <Stack.Screen
        name="feed"
        options={{
          headerShown: false,
        }}
      />
      <Stack.Screen
        name="index"
        options={{
          gestureEnabled: true,
        }}
      />
    </Stack>
  )
}

export default RootLayout
