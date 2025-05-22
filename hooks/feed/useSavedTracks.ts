import { useCallback, useEffect, useState } from 'react'

import { type MaxInt, type SavedTrack } from '@spotify/web-api-ts-sdk'

import { useSpotifyApi } from '../useSpotifyApi'

const DEFAULT_PAGE_SIZE: MaxInt<50> = 50

export const useSavedTracks = (baseLimit: MaxInt<50> = DEFAULT_PAGE_SIZE) => {
  const { loading: loadingToken, spotifyApi } = useSpotifyApi()
  const [tracks, setTracks] = useState<SavedTrack[]>([])
  const [offset, setOffset] = useState(0)
  const [loading, setLoading] = useState(loadingToken)
  const [refreshing, setIsRefreshing] = useState(false)

  const loadTracks = useCallback(
    async (offsetToUse: number) => {
      if (!spotifyApi) {
        return []
      }

      try {
        const { items } = await spotifyApi.currentUser.tracks.savedTracks(baseLimit, offsetToUse)
        return items
      } catch (error) {
        console.error('Error fetching saved tracks:', error)
        return []
      }
    },
    [spotifyApi, baseLimit],
  )

  const refresh = useCallback(async () => {
    setLoading(true)
    setIsRefreshing(true)

    const fresh = await loadTracks(0)
    setTracks(fresh)
    setOffset(baseLimit)

    setLoading(false)
    setIsRefreshing(false)
  }, [loadTracks, baseLimit])

  const loadMore = useCallback(async () => {
    if (loading || !spotifyApi) {
      return
    }

    setLoading(true)
    const more = await loadTracks(offset)

    const existingIds = new Set(tracks.map((t) => t.track.id))
    const newTracks = more.filter((t) => !existingIds.has(t.track.id))

    setTracks((prev) => [...prev, ...newTracks])
    setOffset((prev) => prev + baseLimit)
    setLoading(false)
  }, [loadTracks, offset, baseLimit, loading, tracks, spotifyApi])

  useEffect(() => {
    if (spotifyApi) {
      refresh()
    }
  }, [spotifyApi, refresh])

  return { loading, loadMore, refresh, refreshing, tracks }
}
