import React from 'react'
import { Button, SafeAreaView } from 'react-native'

import { Link } from 'expo-router'

import { useSpotifyAuth, useUser } from '../../hooks'
import { Text } from '../../src/system'

export const Index = () => {
  const { accessToken, login, logout: logoutFromSpotify } = useSpotifyAuth()
  const { login: loginWithEmailAndPassword, logout: logoutFromUser, user } = useUser()

  if (!accessToken) {
    return (
      <SafeAreaView>
        <Button onPress={login} title="Login with Spotify" />
      </SafeAreaView>
    )
  }

  if (!user) {
    return (
      <SafeAreaView>
        <Button
          onPress={() => loginWithEmailAndPassword({ email: 'caroline@akroapp.com', password: 'caroline' })}
          title="log in with user name"
        />
      </SafeAreaView>
    )
  }

  return (
    <SafeAreaView>
      <Text>🎵 Logged in to Spotify! 🎵</Text>
      <Link asChild href="/feed">
        <Button title="Go to Recently Played Tracks" />
      </Link>
      <Button onPress={logoutFromSpotify} title="Logout from Spotify" />
      <Button onPress={logoutFromUser} title="Logout from Supabase" />
    </SafeAreaView>
  )
}

export default Index
