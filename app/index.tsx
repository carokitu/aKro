import React from 'react'
import { Button, Text, View } from 'react-native'

import { useSpotifyAuth } from '../hooks'

const SpotifyLogin = () => {
  const { login, logout, token } = useSpotifyAuth()

  return (
    <View>
      {token ? (
        <>
          <Text>🎵 Logged in to Spotify!</Text>
          <Button onPress={logout} title="Logout" />
        </>
      ) : (
        <Button onPress={login} title="Login with Spotify" />
      )}
    </View>
  )
}

export default SpotifyLogin
