import { useCallback, useEffect, useState } from 'react'

import { type MaxInt, type SavedTrack } from '@spotify/web-api-ts-sdk'

import { useSpotifyApi } from './useSpotifyApi'

export const useSavedTracks = (baseLimit?: MaxInt<50>) => {
  const { loading: loadingToken, spotifyApi } = useSpotifyApi()
  const [tracks, setTracks] = useState<SavedTrack[]>([])
  const [loading, setLoading] = useState(loadingToken)

  const fetchSavedTracks = useCallback(
    async (limit?: MaxInt<50>, offset?: number) => {
      if (!spotifyApi) {
        return
      }

      setLoading(true)

      try {
        const { items } = await spotifyApi.currentUser.tracks.savedTracks(limit, offset)
        setTracks(items)
      } catch (error) {
        console.error('Error fetching currently played tracks:', error)
      }

      setLoading(false)
    },
    [spotifyApi],
  )

  useEffect(() => {
    if (spotifyApi) {
      fetchSavedTracks(baseLimit)
    }
  }, [spotifyApi, baseLimit])

  return { fetchSavedTracks, loading, setTracks, tracks }
}
