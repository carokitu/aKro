import { Image, StyleSheet, View } from 'react-native'

import { BlurView } from 'expo-blur'

import { type Post } from '../../../models'
import { theme } from '../../theme'

export const Track = ({
  children,
  item,
  size = 'large',
}: {
  children?: React.ReactNode
  item: Pick<Post, 'album_cover_url'>
  size?: 'large' | 'medium'
}) => {
  return (
    <View style={styles.track}>
      <View>
        <View style={size === 'large' ? styles.largeDiskContainer : styles.diskContainer}>
          <Image
            source={{ uri: item.album_cover_url }}
            style={size === 'large' ? styles.largeDiskImage : styles.diskImage}
          />
          <BlurView intensity={80} style={size === 'large' ? styles.largeDiskBlur : styles.diskBlur} tint="light" />
        </View>
        <Image source={{ uri: item.album_cover_url }} style={size === 'large' ? styles.largeCover : styles.cover} />
      </View>
      {children}
    </View>
  )
}

const styles = StyleSheet.create({
  cover: {
    borderRadius: theme.radius.small,
    height: 250,
    left: 0,
    position: 'absolute',
    top: 0,
    width: 250,
  },
  diskBlur: {
    height: 250,
    position: 'absolute',
    top: 0,
    width: 250,
  },
  diskContainer: {
    borderRadius: theme.radius.full,
    height: 250,
    marginLeft: 40,
    overflow: 'hidden',
    position: 'absolute',
    width: 250,
  },
  diskImage: {
    height: 250,
    width: 250,
  },
  largeCover: {
    borderRadius: theme.radius.small,
    height: 290,
    left: 0,
    position: 'absolute',
    top: 0,
    width: 290,
  },
  largeDiskBlur: {
    height: 290,
    position: 'absolute',
    top: 0,
    width: 290,
  },
  largeDiskContainer: {
    borderRadius: theme.radius.full,
    height: 290,
    marginLeft: 50,
    overflow: 'hidden',
    position: 'absolute',
    width: 290,
  },
  largeDiskImage: {
    height: 290,
    width: 290,
  },
  track: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: theme.spacing[600],
    marginTop: theme.spacing[200],
  },
})
