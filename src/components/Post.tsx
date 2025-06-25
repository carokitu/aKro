/* eslint-disable @typescript-eslint/no-require-imports */
import { memo } from 'react'
import { Image, type StyleProp, StyleSheet, TouchableOpacity, View, type ViewStyle } from 'react-native'

import { useSpotifyApi } from '../../hooks/useSpotifyApi'
import { type Post as TPost } from '../../models'
import { Label, Text } from '../system'
import { theme } from '../theme'

type TrackForPost = Pick<
  TPost,
  'album_cover_url' | 'artist_name' | 'description' | 'preview_url' | 'spotify_track_id' | 'track_name'
>

type Props = {
  ActionButtons?: React.ReactNode
  Header?: React.ReactNode
  item: TrackForPost
  style?: StyleProp<ViewStyle>
}

export const Post = memo(({ ActionButtons, Header, item, style }: Props) => {
  const { spotifyApi } = useSpotifyApi()

  const playOnSpotify = async () => {
    if (!spotifyApi) {
      return
    }

    try {
      await spotifyApi.player.startResumePlayback('', undefined, [`spotify:track:${item.spotify_track_id}`])
    } catch (error) {
      console.error('Error playing on Spotify:', error)
    }
  }

  return (
    <View style={[styles.post, style]}>
      {Header}
      <View style={styles.track}>
        <View>
          <View style={ActionButtons ? styles.disk : styles.largeDisk} />
          <Image source={{ uri: item.album_cover_url }} style={ActionButtons ? styles.cover : styles.largeCover} />
        </View>
        {ActionButtons}
      </View>
      <View style={styles.footer}>
        <View style={styles.trackInfo}>
          <Label color="invert" ellipsizeMode="tail" numberOfLines={1} size="large">
            {item.track_name}
          </Label>
          <Text color="invert" ellipsizeMode="tail" numberOfLines={1} size="small">
            {item.artist_name}
          </Text>
        </View>
        <TouchableOpacity onPress={playOnSpotify} style={styles.spotify}>
          <View>
            <Text color="invert" size="extraSmall">
              Écouter sur
            </Text>
            <Text color="invert" size="large">
              Spotify
            </Text>
          </View>
          <Image source={require('../../assets/images/icons/spotify.png')} style={styles.logo} />
        </TouchableOpacity>
      </View>
    </View>
  )
})

const styles = StyleSheet.create({
  cover: {
    borderRadius: theme.radius.small,
    height: 250,
    left: 0,
    position: 'absolute',
    top: 0,
    width: 250,
  },
  disk: {
    backgroundColor: theme.surface.danger.default,
    borderRadius: theme.radius.full,
    height: 250,
    marginLeft: 40,
    width: 250,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  largeCover: {
    borderRadius: theme.radius.small,
    height: 300,
    left: 0,
    position: 'absolute',
    top: 0,
    width: 300,
  },
  largeDisk: {
    backgroundColor: theme.surface.danger.default,
    borderRadius: theme.radius.full,
    height: 300,
    marginLeft: 40,
    width: 300,
  },
  logo: {
    height: 30,
    width: 30,
  },
  post: {
    backgroundColor: theme.surface.brand.default,
    borderRadius: theme.radius.medium,
    paddingHorizontal: theme.spacing[400],
    paddingVertical: theme.spacing[400],
  },
  spotify: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: theme.spacing[200],
  },
  track: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: theme.spacing[600],
    marginTop: theme.spacing[200],
  },
  trackInfo: {
    flex: 1,
    overflow: 'hidden',
    paddingRight: theme.spacing[400],
  },
})
