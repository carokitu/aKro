import { Image, StyleSheet, View } from 'react-native'

import { theme } from '../../theme'
import { useTrackColors } from './ColorProvider'

export const Track = ({
  children,
  coverUrl,
  size = 'large',
}: {
  children?: React.ReactNode
  coverUrl: string
  size?: 'large' | 'medium'
}) => {
  const { color } = useTrackColors()

  return (
    <View style={styles.track}>
      <View>
        <View style={size === 'large' ? styles.largeDiskContainer : styles.diskContainer}>
          <View style={[size === 'large' ? styles.largeDiskImage : styles.diskImage, { backgroundColor: color }]} />
        </View>
        <Image source={{ uri: coverUrl }} style={size === 'large' ? styles.largeCover : styles.cover} />
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
    opacity: 0.7,
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
  largeDiskContainer: {
    borderRadius: theme.radius.full,
    marginLeft: 50,
    overflow: 'hidden',
    width: 290,
  },
  largeDiskImage: {
    height: 290,
    opacity: 0.7,
    width: 290,
  },
  track: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: theme.spacing[600],
    marginTop: theme.spacing[200],
  },
})
