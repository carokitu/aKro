import { useCallback, useEffect, useState } from 'react'

import { type MaxInt, type PlayHistory } from '@spotify/web-api-ts-sdk'

import { useSpotifyApi } from './useSpotifyApi'

const REFRESH_INTERVAL = 5000 // 5 seconds

export const useRecentTracks = (limit?: MaxInt<50>) => {
  const { loading: loadingToken, spotifyApi } = useSpotifyApi()
  const [tracks, setTracks] = useState<PlayHistory[]>()
  const [loading, setLoading] = useState(loadingToken)

  const fetchRecentTracks = useCallback(async () => {
    if (!spotifyApi) {
      return
    }

    try {
      const recentTracks = await spotifyApi.player.getRecentlyPlayedTracks(limit)
      setTracks(recentTracks?.items)
    } catch (error) {
      console.error('Error fetching recently played tracks:', error)
    }
  }, [spotifyApi, limit])

  useEffect(() => {
    if (!spotifyApi) {
      return
    }

    const fetchData = async () => {
      setLoading(true)
      await fetchRecentTracks()
      setLoading(false)
    }

    // Initial fetch only if needed
    fetchData()

    // Set up interval for periodic refresh
    const intervalId = setInterval(fetchRecentTracks, REFRESH_INTERVAL)

    // Cleanup interval on unmount
    return () => clearInterval(intervalId)
  }, [spotifyApi, fetchRecentTracks])

  return { fetchRecentTracks, loading, tracks }
}
