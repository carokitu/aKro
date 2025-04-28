import { useCallback, useEffect, useState } from 'react'

import { type Track } from '@spotify/web-api-ts-sdk'

import { useSpotifyApi } from './useSpotifyApi'

const REFRESH_INTERVAL = 5000 // 5 seconds

export const useCurrentTrack = () => {
  const { loading: loadingToken, spotifyApi } = useSpotifyApi()
  const [currentTrack, setCurrentTrack] = useState<null | Track>(null)
  const [loading, setLoading] = useState(loadingToken)

  const fetchCurrentTrack = useCallback(async () => {
    try {
      const current = await spotifyApi?.player.getCurrentlyPlayingTrack()
      if (current?.item && 'album' in current.item) {
        setCurrentTrack(current.item as Track)
      }
    } catch (error) {
      console.error('Error fetching currently played tracks:', error)
    }
  }, [spotifyApi])

  useEffect(() => {
    const fetchData = async () => {
      await fetchCurrentTrack()
      setLoading(false)
    }

    // Initial fetch
    setLoading(true)
    fetchData()

    // Set up interval for periodic refresh
    const intervalId = setInterval(fetchData, REFRESH_INTERVAL)

    // Cleanup interval on unmount
    return () => clearInterval(intervalId)
  }, [fetchCurrentTrack])

  return { currentTrack, fetchCurrentTrack, loading }
}
