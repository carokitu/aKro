import { useCallback, useEffect, useState, useRef } from 'react'

import { type MaxInt, type PlayHistory } from '@spotify/web-api-ts-sdk'

import { useSpotifyApi } from './useSpotifyApi'

const REFRESH_INTERVAL = 5000 // 5 seconds

export const useRecentTracks = (limit?: MaxInt<50>) => {
  const { loading: loadingToken, useApi } = useSpotifyApi()
  const [tracks, setTracks] = useState<PlayHistory[]>()
  const [loading, setLoading] = useState(loadingToken)
  const initialFetchRef = useRef(false)

  const fetchRecentTracks = useCallback(async () => {
    if (!useApi) return;
    
    try {
      const recentTracks = await useApi.player.getRecentlyPlayedTracks(limit)
      setTracks(recentTracks?.items)
    } catch (error) {
      console.error('Error fetching recently played tracks:', error)
    }
  }, [useApi, limit])

  useEffect(() => {
    if (!useApi) return;
    
    // Don't run this effect if we've already fetched data and useApi hasn't changed
    if (initialFetchRef.current && tracks) return;
    
    const fetchData = async () => {
      setLoading(true)
      await fetchRecentTracks()
      setLoading(false)
      initialFetchRef.current = true
    }

    // Initial fetch only if needed
    fetchData()

    // Set up interval for periodic refresh
    const intervalId = setInterval(fetchRecentTracks, REFRESH_INTERVAL)

    // Cleanup interval on unmount
    return () => clearInterval(intervalId)
  }, [useApi, fetchRecentTracks])

  return { fetchRecentTracks, loading, tracks }
}
