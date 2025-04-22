import React from 'react'

import { useSpotifyAuth } from '../../hooks'
import ProviderSignIn from './provider-sign-in'
import SignIn from './sign-in'

export const Index = () => {
  const { accessToken } = useSpotifyAuth()

  if (!accessToken) {
    return <ProviderSignIn />
  }

  return <SignIn />
}

export default Index
