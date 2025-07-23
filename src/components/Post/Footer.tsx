/* eslint-disable @typescript-eslint/no-require-imports */
import { Image, StyleSheet, TouchableOpacity, View } from 'react-native'

import { type Post } from '../../../models'
import { Label, Text } from '../../system'
import { theme } from '../../theme'

const playOnSpotify = async () => {
  console.log('playOnSpotify')
}

export const Footer = ({ item }: { item: Pick<Post, 'artist_name' | 'spotify_track_id' | 'track_name'> }) => {
  return (
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
        <Image source={require('../../../assets/images/icons/spotify.png')} style={styles.logo} />
      </TouchableOpacity>
    </View>
  )
}

const styles = StyleSheet.create({
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  logo: {
    height: 30,
    width: 30,
  },
  spotify: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: theme.spacing[200],
  },
  trackInfo: {
    flex: 1,
    overflow: 'hidden',
    paddingRight: theme.spacing[400],
  },
})
