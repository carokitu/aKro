import { useEffect, useState } from 'react'

import { SpotifyApi } from '@spotify/web-api-ts-sdk'

import { useSpotifyAuth } from './useSpotifyAuth'

export const useSpotifyApi = () => {
  const [loading, setLoading] = useState(true)
  const [spotifyApi, setSpotifyApi] = useState<null | SpotifyApi>(null)
  const { accessToken } = useSpotifyAuth()

  useEffect(() => {
    const prepareRequest = async () => {
      setLoading(true)

      if (!accessToken) {
        setLoading(false)
        return
      }

      try {
        const sdk = SpotifyApi.withAccessToken(process.env.EXPO_PUBLIC_SPOTIFY_CLIENT_ID as string, accessToken)
        setSpotifyApi(sdk)
      } catch (error) {
        console.error('Error initializing Spotify API:', error)
      } finally {
        setLoading(false)
      }
    }

    prepareRequest()
  }, [accessToken])

  return { loading, spotifyApi }
}
