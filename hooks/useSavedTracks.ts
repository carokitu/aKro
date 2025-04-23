import { useCallback, useEffect, useState } from 'react'

import { type MaxInt, type SavedTrack } from '@spotify/web-api-ts-sdk'

import { useSpotifyApi } from './useSpotifyApi'

export const useSavedTracks = (baseLimit?: MaxInt<50>) => {
  const { loading: loadingToken, useApi } = useSpotifyApi()
  const [tracks, setTracks] = useState<SavedTrack[]>()
  const [loading, setLoading] = useState(loadingToken)

  const fetchSavedTracks = useCallback(
    async (limit?: MaxInt<50>, offset?: number) => {
      setLoading(true)
      try {
        const likedTracks = await useApi?.currentUser.tracks.savedTracks(limit, offset)
        setTracks(likedTracks?.items)
      } catch (error) {
        console.error('Error fetching currently played tracks:', error)
      } finally {
        setLoading(false)
      }
    },
    [useApi],
  )

  const refreshSavedTracks = useCallback(async () => {
    setLoading(true)
    await fetchSavedTracks(baseLimit)
    setLoading(false)
  }, [fetchSavedTracks, baseLimit])

  useEffect(() => {
    refreshSavedTracks()
  }, [])

  return { fetchSavedTracks, loading, refreshSavedTracks, setTracks, tracks }
}
