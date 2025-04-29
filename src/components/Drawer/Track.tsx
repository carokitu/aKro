import { AudioLines } from 'lucide-react-native'
import { Image, type StyleProp, StyleSheet, View, type ViewStyle } from 'react-native'

import { type Track as TTrack } from '@spotify/web-api-ts-sdk'

import { Label } from '../../system'
import { theme } from '../../theme'
import { padding, spacing } from '../../theme/spacing'

type Props = {
  current?: boolean
  isFirst?: boolean
  isLast?: boolean
  style?: StyleProp<ViewStyle>
  track: TTrack
}

export const Track = ({ current = false, isFirst, isLast, style: propsStyle, track }: Props) => (
  <View style={[styles.trackContainer, propsStyle, isFirst && styles.firstTrack, isLast && styles.lastTrack]}>
    <Image source={{ uri: track.album.images[0].url }} style={styles.albumCover} />
    <View style={styles.textContainer}>
      <View style={styles.title}>
        {current && <AudioLines color={theme.text.brand.secondary} size={theme.fontSize.xl} />}
        <Label ellipsizeMode="tail" numberOfLines={1} size="large" style={styles.trackName}>
          {track.name}
        </Label>
      </View>
      <Label color="secondary" ellipsizeMode="tail" numberOfLines={1}>
        {track.artists.map((artist) => artist.name).join(', ')}
      </Label>
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
  firstTrack: {
    paddingTop: theme.padding['400'],
  },
  lastTrack: {
    paddingBottom: theme.padding['400'],
  },
  textContainer: {
    flex: 1,
    gap: theme.spacing['100'],
  },
  title: {
    flexDirection: 'row',
    gap: theme.spacing['100'],
  },
  trackContainer: {
    alignItems: 'center',
    backgroundColor: theme.colors.neutral[50],
    borderRadius: theme.radius.small,
    flexDirection: 'row',
    marginHorizontal: padding['400'],
    paddingHorizontal: theme.padding['400'],
    paddingVertical: theme.padding['200'],
  },
  trackName: {
    marginBottom: spacing['50'],
  },
})
