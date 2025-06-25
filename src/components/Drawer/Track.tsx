import { AudioLines } from 'lucide-react-native'
import { memo, useState } from 'react'
import { Image, type StyleProp, StyleSheet, TouchableWithoutFeedback, View, type ViewStyle } from 'react-native'

import { type Track as TTrack } from '@spotify/web-api-ts-sdk'

import { Label } from '../../system'
import { theme } from '../../theme'
import { padding, spacing } from '../../theme/spacing'
import { ShareModal } from './ShareModal'

type Props = {
  current?: boolean
  isFirst?: boolean
  isLast?: boolean
  style?: StyleProp<ViewStyle>
  track: TTrack
}

export const Track = memo(({ current = false, isFirst, isLast, style: propsStyle, track }: Props) => {
  const [trackToShare, setTrackToShare] = useState<null | TTrack>(null)
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
        </View>
      </TouchableWithoutFeedback>
      <ShareModal onClose={() => setTrackToShare(null)} track={trackToShare} />
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
    marginHorizontal: padding['400'],
    paddingHorizontal: theme.padding['200'],
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
