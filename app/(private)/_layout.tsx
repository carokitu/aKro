import { Redirect, Slot } from 'expo-router'

import { useSpotifyAuth, useUser } from '../../hooks'

export const PrivateLayout = () => {
  const { user } = useUser()
  const { accessToken } = useSpotifyAuth()

  if (!user || !accessToken) {
    return <Redirect href="/(public)" />
  }

  return <Slot />
}

export default PrivateLayout
