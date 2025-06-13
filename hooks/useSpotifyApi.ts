import { useEffect, useMemo, useState } from 'react'

import { SpotifyApi } from '@spotify/web-api-ts-sdk'

import { useSpotifyAuth } from './useSpotifyAuth'

export const useSpotifyApi = () => {
  const { accessToken } = useSpotifyAuth()
  const [spotifyApi, setSpotifyApi] = useState<null | SpotifyApi>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const initializeSdk = async () => {
      if (!accessToken) {
        setSpotifyApi(null)
        setLoading(false)
        return
      }

      try {
        const sdk = SpotifyApi.withAccessToken(process.env.EXPO_PUBLIC_SPOTIFY_CLIENT_ID as string, accessToken)
        setSpotifyApi(sdk)
      } catch (error) {
        console.error('Failed to initialize Spotify SDK:', error)
        setSpotifyApi(null)
      } finally {
        setLoading(false)
      }
    }

    setLoading(true)
    initializeSdk()
  }, [accessToken])

  const isReady = useMemo(() => !!spotifyApi, [spotifyApi])

  return { isReady, loading, spotifyApi }
}
