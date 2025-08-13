export enum StreamingPlatforms {
  AMAZON_MUSIC = 'amazonMusic',
  APPLE_MUSIC = 'appleMusic',
  DEEZER = 'deezer',
  SOUNDCLOUD = 'soundcloud',
  SPOTIFY = 'spotify',
  TIDAL = 'tidal',
  // YOUTUBE = 'youtube',
  // YOUTUBE_MUSIC = 'youtubeMusic',
}

export const streamingPlatformName: Record<StreamingPlatforms, string> = {
  [StreamingPlatforms.AMAZON_MUSIC]: 'Amazon Music',
  [StreamingPlatforms.APPLE_MUSIC]: 'Apple Music',
  [StreamingPlatforms.DEEZER]: 'Deezer',
  [StreamingPlatforms.SOUNDCLOUD]: 'SoundCloud',
  [StreamingPlatforms.SPOTIFY]: 'Spotify',
  [StreamingPlatforms.TIDAL]: 'Tidal',
}
