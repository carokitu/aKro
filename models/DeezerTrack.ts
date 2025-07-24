export type DeezerTrack = {
  album: {
    cover: string
    cover_big: string
    cover_medium: string
    cover_small: string
    cover_xl: string
    id: number
    title: string
  }
  artist: {
    id: number
    name: string
  }
  contributors?: {
    id: number
    name: string
    role: string
  }[]
  duration: number
  explicit_lyrics: boolean
  id: number
  isrc: string
  link: string
  preview: string
  title: string
}
