import React from 'react'
import { Button, Text, View } from 'react-native'

import { Link } from 'expo-router'

import { useSpotifyAuth } from '../hooks'

const SpotifyLogin = () => {
  const { accessToken, login, logout } = useSpotifyAuth()

  return (
    <View>
      {accessToken ? (
        <>
          <Text>🎵 Logged in to Spotify!</Text>
          {/* Navigate to RecentTracks */}
          <Link asChild href="/recent">
            <Button title="Go to Recently Played Tracks" />
          </Link>
          <Button onPress={logout} title="Logout" />
        </>
      ) : (
        <Button onPress={login} title="Login with Spotify" />
      )}
    </View>
  )
}

export default SpotifyLogin
