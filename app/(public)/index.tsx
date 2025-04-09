import React from 'react'
import { Button, SafeAreaView } from 'react-native'

import { useSpotifyAuth, useUser } from '../../hooks'

export const Index = () => {
  const { accessToken, login } = useSpotifyAuth()
  const { login: loginWithEmailAndPassword } = useUser()

  if (!accessToken) {
    return (
      <SafeAreaView>
        <Button onPress={login} title="Login with Spotify" />
      </SafeAreaView>
    )
  }

  return (
    <SafeAreaView>
      <Button
        onPress={() => loginWithEmailAndPassword({ email: 'caroline@akroapp.com', password: 'caroline' })}
        title="log in with user name"
      />
    </SafeAreaView>
  )
}

export default Index
