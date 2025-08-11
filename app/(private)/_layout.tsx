import { useEffect } from 'react'
import { StatusBar } from 'react-native'

import { Audio } from 'expo-av'
import { Stack } from 'expo-router'

import { FeedProvider, MuteProvider } from '../../hooks'
import { theme } from '../../src/theme'

export const PrivateLayout = () => {
  useEffect(() => {
    Audio.setAudioModeAsync({
      allowsRecordingIOS: false,
      playsInSilentModeIOS: true,
      playThroughEarpieceAndroid: false,
      shouldDuckAndroid: true,
    })
  }, [])

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
