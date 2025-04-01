import React from 'react'
import { Button, Text, View } from 'react-native'

import { Link } from 'expo-router'

import { useSpotifyAuth } from '../hooks'

const SpotifyLogin = () => {
  const { accessToken, login, logout } = useSpotifyAuth()

  if (!accessToken) {
    return (
      <View>
        <Button onPress={login} title="Login with Spotify" />
      </View>
    )
  }

  return (
    <View>
      <Text>🎵 Logged in to Spotify! 🎵</Text>
      <Link asChild href="/feed">
        <Button title="Go to Recently Played Tracks" />
      </Link>
      <Button onPress={logout} title="Logout" />
    </View>
  )
}

export default SpotifyLogin
