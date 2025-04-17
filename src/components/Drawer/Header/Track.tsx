import { Image, StyleSheet, View } from 'react-native'

import { type Track as TTrack } from '@spotify/web-api-ts-sdk'

import { Label } from '../../../system'
import { theme } from '../../../theme'
import { padding, spacing } from '../../../theme/spacing'

export const Track = (track: TTrack) => (
  <View style={styles.section}>
    <View style={styles.trackContainer}>
      <Image source={{ uri: track.album.images[0].url }} style={styles.albumCover} />
      <View style={styles.textContainer}>
        <Label ellipsizeMode="tail" numberOfLines={1} style={styles.trackName} size="large">
          {track.name}
        </Label>
        <Label color="secondary" ellipsizeMode="tail" numberOfLines={1}>
          {track.artists.map((artist) => artist.name).join(', ')}
        </Label>
      </View>
    </View>
  </View>
)

const styles = StyleSheet.create({
  albumCover: {
    borderRadius: theme.radius['small'],
    height: 50,
    marginRight: 10,
    width: 50,
  },
  section: {
    marginBottom: 15,
  },
  textContainer: {
    flex: 1,
  },
  trackContainer: {
    alignItems: 'center',
    flexDirection: 'row',
    marginHorizontal: padding['400'],
  },
  trackName: {
    marginBottom: spacing['50'],
  },
})
