import { useEffect, useState } from 'react'

import { type DeezerTrack } from '../models'
import { useDebouncedValue } from './useDebouncedValue'

export const useDeezerSearch = (query: string) => {
  const debouncedQuery = useDebouncedValue(query, 400)

  const [tracks, setTracks] = useState<DeezerTrack[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<null | string>(null)

  useEffect(() => {
    let cancelled = false
    const fetchTracks = async () => {
      setLoading(true)
      setError(null)

      try {
        const endpoint = debouncedQuery.trim()
          ? `https://api.deezer.com/search?q=${encodeURIComponent(debouncedQuery)}`
          : `https://api.deezer.com/chart/0/tracks`

        const res = await fetch(endpoint)
        const data = await res.json()

        if (!cancelled) {
          setTracks(data.data || [])
        }
      } catch {
        if (!cancelled) {
          setError('Erreur lors du chargement')
          setTracks([])
        }
      } finally {
        if (!cancelled) {
          setLoading(false)
        }
      }
    }

    fetchTracks()
    return () => {
      cancelled = true
    }
  }, [debouncedQuery])

  return { error, loading, tracks }
}
