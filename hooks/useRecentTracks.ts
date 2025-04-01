import { useCallback, useEffect, useState } from 'react'

import { type MaxInt, type PlayHistory } from '@spotify/web-api-ts-sdk'

import { useSpotifyApi } from './useSpotifyApi'

const REFRESH_INTERVAL = 5000 // 5 seconds

export const useRecentTracks = (limit?: MaxInt<50>) => {
  const { loading: loadingToken, useApi } = useSpotifyApi()
  const [tracks, setTracks] = useState<PlayHistory[]>()
  const [loading, setLoading] = useState(loadingToken)

  const fetchRecentTracks = useCallback(async () => {
    try {
      const recentTracks = await useApi?.player.getRecentlyPlayedTracks(limit)
      setTracks(recentTracks?.items)
    } catch (error) {
      console.error('Error fetching recently played tracks:', error)
    }
  }, [useApi])

  useEffect(() => {
    const fetchData = async () => {
      await fetchRecentTracks()
      setLoading(false)
    }

    // Initial fetch
    setLoading(true)
    fetchData()

    // Set up interval for periodic refresh
    const intervalId = setInterval(fetchData, REFRESH_INTERVAL)

    // Cleanup interval on unmount
    return () => clearInterval(intervalId)
  }, [fetchRecentTracks])

  return { fetchRecentTracks, loading, tracks }
}
