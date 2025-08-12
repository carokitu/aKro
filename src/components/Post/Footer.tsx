/* eslint-disable @typescript-eslint/no-require-imports */
import { Image, Linking, StyleSheet, TouchableOpacity, View } from 'react-native'

import { Label, Text } from '../../system'
import { theme } from '../../theme'

const playOnSpotify = async (url?: string) => {
  if (!url) {
    return
  }

  Linking.openURL(url)
}

export const Footer = ({
  artistName,
  platformLinks,
  trackName,
}: {
  artistName: string
  platformLinks?: Record<string, string>
  trackName: string
}) => {
  const platformLink = platformLinks?.spotify

  return (
    <View style={styles.footer}>
      <View style={styles.trackInfo}>
        <Label color="invert" ellipsizeMode="tail" numberOfLines={1} size="large">
          {trackName}
        </Label>
        <Text color="invert" ellipsizeMode="tail" numberOfLines={1} size="small">
          {artistName}
        </Text>
      </View>
      <TouchableOpacity onPress={() => playOnSpotify(platformLink)} style={styles.spotify}>
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
