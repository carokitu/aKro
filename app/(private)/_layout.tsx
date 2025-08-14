import { useEffect } from 'react'
import { StatusBar } from 'react-native'

import { setAudioModeAsync } from 'expo-audio'
import { Redirect, Stack } from 'expo-router'

import { FeedProvider, MuteProvider, useAuth } from '../../hooks'
import { theme } from '../../src/theme'

export const PrivateLayout = () => {
  const { isLoggedIn, user } = useAuth()

  useEffect(() => {
    setAudioModeAsync({
      allowsRecording: false,
      interruptionMode: 'duckOthers',
      interruptionModeAndroid: 'duckOthers',
      playsInSilentMode: true,
      shouldRouteThroughEarpiece: false,
    })
  }, [])

  if (!isLoggedIn || !user) {
    return <Redirect href="/(public)" />
  }

  return (
    <FeedProvider>
      <MuteProvider>
        <StatusBar backgroundColor={theme.surface.base.default} barStyle="dark-content" />
        <Stack screenOptions={{ contentStyle: { backgroundColor: theme.surface.base.default } }}>
          <Stack.Screen name="feed" options={{ headerShown: false }} />
          <Stack.Screen name="search-users" options={{ headerShown: false }} />
          <Stack.Screen name="profile" options={{ headerShown: false }} />
          <Stack.Screen name="post" options={{ headerShown: false }} />
          <Stack.Screen name="ranking" options={{ headerShown: false }} />
        </Stack>
      </MuteProvider>
    </FeedProvider>
  )
}

export default PrivateLayout
