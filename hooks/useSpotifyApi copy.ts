import { useEffect, useState } from 'react'

import { type PlayHistory, SpotifyApi } from '@spotify/web-api-ts-sdk'
import * as SecureStore from 'expo-secure-store'

import { ACCESS_TOKEN_KEY } from '../constants'

const getToken = async () => {
  const tokenString = await SecureStore.getItemAsync(ACCESS_TOKEN_KEY)
  return JSON.parse(tokenString || '')
}

export const useSpotifyApi = () => {
  const [tracks, setTracks] = useState<PlayHistory[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchRecentTracks = async () => {
      setLoading(true)

      const token = await getToken()

      if (!token) {
        setLoading(false)
        return
      }

      try {
        const sdk = SpotifyApi.withAccessToken(process.env.EXPO_PUBLIC_SPOTIFY_CLIENT_ID as string, token)
        const recentTracks = await sdk.player.getRecentlyPlayedTracks()
        setTracks(recentTracks.items)
      } catch (error) {
        console.error('Error fetching recently played tracks:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchRecentTracks()
  }, [])

  return { loading, tracks }
}
