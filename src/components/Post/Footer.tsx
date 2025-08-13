/* eslint-disable @typescript-eslint/no-require-imports */
import { Copy } from 'lucide-react-native'
import { Image, Linking, StyleSheet, TouchableOpacity, View } from 'react-native'

import * as Clipboard from 'expo-clipboard'

import { streamingPlatformName, StreamingPlatforms } from '../../../constants'
import { useUser } from '../../../hooks/useUser'
import { Label, Text } from '../../system'
import { theme } from '../../theme'

type Props = {
  artistName: string
  platformLinks?: Record<string, string>
  trackName: string
}

const platformLogos = {
  [StreamingPlatforms.AMAZON_MUSIC]: require('../../../assets/images/platforms/amazon-music.png'),
  [StreamingPlatforms.APPLE_MUSIC]: require('../../../assets/images/platforms/apple-music.png'),
  [StreamingPlatforms.DEEZER]: require('../../../assets/images/platforms/deezer.png'),
  [StreamingPlatforms.SOUNDCLOUD]: require('../../../assets/images/platforms/soundcloud.png'),
  [StreamingPlatforms.SPOTIFY]: require('../../../assets/images/platforms/spotify.png'),
  [StreamingPlatforms.TIDAL]: require('../../../assets/images/platforms/tidal.png'),
} as const

const PlatformLink = ({ artistName, platformLinks, trackName }: Props) => {
  const { streaming_platform: streamingPlatform } = useUser()

  const handleCopy = async () => {
    const text = `${trackName} - ${artistName}`
    await Clipboard.setStringAsync(text)
  }

  if (!streamingPlatform || !platformLinks?.[streamingPlatform]) {
    return (
      <TouchableOpacity onPress={handleCopy} style={styles.spotify}>
        <Copy color={theme.surface.base.default} size={30} />
      </TouchableOpacity>
    )
  }

  const link = platformLinks[streamingPlatform]

  return (
    <TouchableOpacity onPress={() => Linking.openURL(link)} style={styles.spotify}>
      <View>
        <Text color="invert" size="extraSmall">
          Écouter sur
        </Text>
        <Text color="invert" size="large">
          {streamingPlatformName[streamingPlatform]}
        </Text>
      </View>
      <Image source={platformLogos[streamingPlatform]} style={styles.logo} />
    </TouchableOpacity>
  )
}

export const Footer = ({ artistName, platformLinks, trackName }: Props) => (
  <View style={styles.footer}>
    <View style={styles.trackInfo}>
      <Label color="invert" ellipsizeMode="tail" numberOfLines={1} size="large">
        {trackName}
      </Label>
      <Text color="invert" ellipsizeMode="tail" numberOfLines={1} size="small">
        {artistName}
      </Text>
    </View>
    <PlatformLink artistName={artistName} platformLinks={platformLinks} trackName={trackName} />
  </View>
)

const styles = StyleSheet.create({
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  logo: {
    height: 35,
    resizeMode: 'contain',
    width: 50,
  },
  spotify: {
    alignItems: 'flex-end',
    flexDirection: 'row',
    gap: theme.spacing[200],
  },
  trackInfo: {
    flex: 1,
    overflow: 'hidden',
    paddingRight: theme.spacing[400],
  },
})
