import { StatusBar } from 'react-native'

import { Outfit_400Regular, Outfit_600SemiBold } from '@expo-google-fonts/outfit'
import { useFonts } from 'expo-font'
import { Stack } from 'expo-router'

import { SpotifyAuthProvider, UserProvider, useSpotifyAuth, useUser } from '../hooks'
import { theme } from '../src/theme'

const Layout = () => {
  const { user } = useUser()
  const { accessToken } = useSpotifyAuth()

  const isSignedIn = !!(user && accessToken)

  return (
    <>
      <StatusBar backgroundColor={theme.surface.base.default} barStyle="dark-content" translucent />
      <Stack
        screenOptions={{
          contentStyle: {
            backgroundColor: theme.surface.base.default,
            flex: 1,
          },
          headerTitleStyle: {
            fontFamily: 'Outfit',
          },
        }}
      >
        {isSignedIn ? (
          <Stack.Screen
            name="(private)"
            options={{
              headerShown: false,
            }}
          />
        ) : (
          <Stack.Screen
            name="(public)"
            options={{
              headerShown: false,
            }}
          />
        )}
      </Stack>
    </>
  )
}

export const RootLayout = () => {
  const [fontsLoaded] = useFonts({
    Outfit: Outfit_400Regular,
    'Outfit-Bold': Outfit_600SemiBold,
  })

  if (!fontsLoaded) {
    return null
  }

  return (
    <UserProvider>
      <SpotifyAuthProvider>
        <Layout />
      </SpotifyAuthProvider>
    </UserProvider>
  )
}

export default RootLayout
