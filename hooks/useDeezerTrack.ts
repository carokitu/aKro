import { useState } from 'react'

import * as Sentry from '@sentry/react-native'

import { client } from '../supabase'

type DeezerArtist = {
  id: string
  link: string
  name: string
  picture: string
  picture_big: string
  picture_medium: string
  picture_small: string
  picture_xl: string
  radio: boolean
  role?: string // présent dans contributors
  share: string
  tracklist: string
  type: string
}

type DeezerAlbum = {
  cover: string
  cover_big: string
  cover_medium: string
  cover_small: string
  cover_xl: string
  id: string
  link: string
  md5_image: string
  release_date: string
  title: string
  tracklist: string
  type: string
}

type DeezerTrack = {
  album: DeezerAlbum
  artist: DeezerArtist
  available_countries: string[]
  bpm: number
  contributors: DeezerArtist[]
  disk_number: number
  duration: number
  explicit_content_cover: number
  explicit_content_lyrics: number
  explicit_lyrics: boolean
  gain: number
  id: string
  isrc: string
  link: string
  preview: string
  rank: number
  readable: boolean
  release_date: string
  share: string
  title: string
  title_short: string
  title_version: string
  track_position: number
  track_token: string
  type: string
}

const convertDeezerTrackToTrack = (deezerTrack: DeezerTrack) => {
  return {
    album_cover_big: deezerTrack.album.cover_big,
    album_cover_medium: deezerTrack.album.cover_medium,
    album_cover_small: deezerTrack.album.cover_small,
    album_cover_xl: deezerTrack.album.cover_xl,
    album_release_date: deezerTrack.album.release_date,
    album_title: deezerTrack.album.title,
    artist_name: deezerTrack.artist.name,
    artist_picture: deezerTrack.artist.picture_medium,
    artist_role: deezerTrack.contributors?.[0]?.role ?? null,
    bpm: deezerTrack.bpm,
    deezer_album_id: deezerTrack.album.id,
    deezer_album_link: deezerTrack.album.link,
    deezer_artist_id: deezerTrack.artist.id,
    deezer_link: deezerTrack.link,
    deezer_track_id: deezerTrack.id,
    disk_number: deezerTrack.disk_number,
    duration: deezerTrack.duration,
    isrc: deezerTrack.isrc,
    preview_url: deezerTrack.preview,
    rank: deezerTrack.rank,
    release_date: deezerTrack.release_date,
    title: deezerTrack.title,
  }
}

const convertAndSaveTrack = async (deezerTrack: DeezerTrack) => {
  const track = convertDeezerTrackToTrack(deezerTrack)
  const { error } = await client.from('tracks').insert(track)

  if (error) {
    Sentry.captureException(error)
    return null
  }

  return track
}

export const useFetchOrSaveDeezerTrack = (trackId: number) => {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<null | string>(null)

  const fetchAndSaveTrack = async () => {
    setLoading(true)

    const { data: existingTrack } = await client.from('tracks').select('*').eq('deezer_track_id', trackId).single()

    setError(null)

    if (existingTrack) {
      return existingTrack.isrc
    } else {
      try {
        const res = await fetch(`https://api.deezer.com/track/${trackId}`)

        if (!res.ok) {
          throw new Error(`Error ${res.status}`)
        }

        const track = (await res.json()) as DeezerTrack
        const convertedTrack = await convertAndSaveTrack(track)

        if (convertedTrack) {
          return convertedTrack.isrc
        } else {
          setError('Une erreur est survenue')
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Une erreur est survenue')
        Sentry.captureException(err)
        return null
      } finally {
        setLoading(false)
      }
    }

    return null
  }

  return { error, fetchAndSaveTrack, loading }
}
