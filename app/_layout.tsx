import { Dimensions } from 'react-native'

import { Outfit_400Regular, Outfit_700Bold } from '@expo-google-fonts/outfit'
import { useFonts } from 'expo-font'
import { Stack } from 'expo-router'

const RootLayout = () => {
  const [fontsLoaded] = useFonts({
    Outfit: Outfit_400Regular,
    'Outfit-Bold': Outfit_700Bold,
  })

  if (!fontsLoaded) {
    return null
  }

  return (
    <Stack
      screenOptions={{
        contentStyle: {
          flex: 1,
          height: Dimensions.get('window').height,
          width: Dimensions.get('window').width,
        },
        headerTitleStyle: {
          fontFamily: 'Outfit',
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
