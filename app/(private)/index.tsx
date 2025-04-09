import React from 'react'
import { Button, SafeAreaView } from 'react-native'

import { Link } from 'expo-router'

import { useSpotifyAuth, useUser } from '../../hooks'
import { Text } from '../../src/system'

const Index = () => {
  const { logout: logoutFromSpotify } = useSpotifyAuth()
  const { logout: logoutFromUser } = useUser()

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
