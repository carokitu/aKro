import { AudioLines } from 'lucide-react-native'
import { memo, useState } from 'react'
import { Image, type StyleProp, StyleSheet, TouchableWithoutFeedback, View, type ViewStyle } from 'react-native'

import { type DeezerTrack } from '../../../models'
import { Label } from '../../system'
import { theme } from '../../theme'
import { spacing } from '../../theme/spacing'
import { ShareModal } from './ShareModal'

type Props = {
  current?: boolean
  isFirst?: boolean
  isLast?: boolean
  style?: StyleProp<ViewStyle>
  track: DeezerTrack
}

export const Track = memo(({ current = false, isFirst, isLast, style: propsStyle, track }: Props) => {
  const [trackToShare, setTrackToShare] = useState<DeezerTrack | null>(null)
  const [pressed, setPressed] = useState(false)

  return (
    <>
      <TouchableWithoutFeedback
        onPress={() => setTrackToShare(track)}
        onPressIn={() => setPressed(true)}
        onPressOut={() => setPressed(false)}
      >
        <View style={[styles.container, isFirst && styles.firstTrack, isLast && styles.lastTrack]}>
          <View style={[styles.trackContainer, propsStyle, pressed && styles.pressed]}>
            <Image source={{ uri: track.album.cover_medium }} style={styles.albumCover} />
            <View style={styles.textContainer}>
              <View style={styles.title}>
                {current && <AudioLines color={theme.text.brand.secondary} size={theme.fontSize.xl} />}
                <Label ellipsizeMode="tail" numberOfLines={1} size="large" style={styles.trackName}>
                  {track.title}
                </Label>
              </View>
              <Label color="secondary" ellipsizeMode="tail" numberOfLines={1}>
                {track.artist.name}
              </Label>
            </View>
          </View>
        </View>
      </TouchableWithoutFeedback>
      {trackToShare && <ShareModal onClose={() => setTrackToShare(null)} track={trackToShare} />}
    </>
  )
})

const styles = StyleSheet.create({
  albumCover: {
    borderRadius: theme.radius['small'],
    height: 50,
    marginRight: 10,
    width: 50,
  },
  container: {
    backgroundColor: theme.colors.neutral[50],
    paddingVertical: theme.padding['100'],
  },
  firstTrack: {
    borderTopLeftRadius: theme.radius.small,
    borderTopRightRadius: theme.radius.small,
    paddingTop: theme.padding['200'],
  },
  lastTrack: {
    borderBottomLeftRadius: theme.radius.small,
    borderBottomRightRadius: theme.radius.small,
    paddingBottom: theme.padding['200'],
  },
  pressed: {
    backgroundColor: theme.colors.neutral[200],
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
    borderRadius: theme.radius.small,
    flexDirection: 'row',
    padding: theme.padding['100'],
  },
  trackName: {
    marginBottom: spacing['50'],
  },
})
