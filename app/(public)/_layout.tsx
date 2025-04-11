import { Redirect, Slot } from 'expo-router'

import { useSpotifyAuth, useUser } from '../../hooks'

export const PublicLayout = () => {
  const { user } = useUser()
  const { accessToken } = useSpotifyAuth()

  if (user && accessToken) {
    return <Redirect href="/(private)/feed" />
  }

  return <Slot />
}

export default PublicLayout
