import { useCallback, useEffect, useState } from 'react'

import { type DeezerTrack } from '../models'
import { useDebouncedValue } from './useDebouncedValue'

type DeezerApiResponse = {
  data: DeezerTrack[]
  next?: string
  total: number
}

export const useDeezerSearch = (query: string) => {
  const debouncedQuery = useDebouncedValue(query, 400)

  const [tracks, setTracks] = useState<DeezerTrack[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<null | string>(null)
  const [nextUrl, setNextUrl] = useState<null | string>(null)

  const fetchTracks = async (url: string, append = false) => {
    try {
      const res = await fetch(url)
      const data: DeezerApiResponse = await res.json()

      if (append) {
        setTracks((prev) => [...prev, ...data.data])
      } else {
        setTracks(data.data)
      }

      setNextUrl(data.next ?? null)
    } catch {
      setError('Erreur lors du chargement')
      if (!append) {
        setTracks([])
      }
    }

    setLoading(false)
  }

  useEffect(() => {
    if (!debouncedQuery && debouncedQuery !== '') {
      return
    }

    setLoading(true)
    setError(null)

    const url = debouncedQuery.trim()
      ? `https://api.deezer.com/search?q=${encodeURIComponent(debouncedQuery)}`
      : `https://api.deezer.com/chart/0/tracks`

    fetchTracks(url)
  }, [debouncedQuery])

  const fetchMore = useCallback(() => {
    if (!nextUrl) {
      return
    }

    fetchTracks(nextUrl, true)
  }, [nextUrl])

  return { error, fetchMore, loading, tracks }
}
