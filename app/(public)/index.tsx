import React from 'react'
import { Button, SafeAreaView } from 'react-native'

import { useSpotifyAuth, useUser } from '../../hooks'
import ProviderSignIn from './provider-sign-in'

export const Index = () => {
  const { accessToken } = useSpotifyAuth()
  const { login: loginWithEmailAndPassword } = useUser()

  if (!accessToken) {
    return <ProviderSignIn />
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
