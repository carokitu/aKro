import { Image, type StyleProp, StyleSheet, View, type ViewStyle } from 'react-native'

import { BlurView } from 'expo-blur'
import { LinearGradient } from 'expo-linear-gradient'

import { theme } from '../../theme'

export const Container = ({
  children,
  coverUrl,
  style,
}: {
  children: React.ReactNode
  coverUrl: string
  style?: StyleProp<ViewStyle>
}) => {
  return (
    <View style={[styles.post, style]}>
      <View style={styles.backgroundContainer}>
        <Image source={{ uri: coverUrl }} style={styles.backgroundImage} />
        <BlurView intensity={100} style={styles.blurOverlay} tint="regular" />
        <LinearGradient
          colors={['rgba(0,0,0,0.3)', 'rgba(0,0,0,0.0)', 'rgba(0,0,0,0.25)', 'rgba(0,0,0,0.5)']}
          locations={[0, 0.2, 0.7, 1]}
          style={styles.gradientOverlay}
        />
      </View>
      {children}
    </View>
  )
}

const styles = StyleSheet.create({
  backgroundContainer: {
    borderRadius: theme.radius.medium,
    bottom: 0,
    left: 0,
    overflow: 'hidden',
    position: 'absolute',
    right: 0,
    top: 0,
  },
  backgroundImage: {
    height: '100%',
    resizeMode: 'cover',
    width: '100%',
  },
  blurOverlay: {
    ...StyleSheet.absoluteFillObject,
  },
  gradientOverlay: {
    ...StyleSheet.absoluteFillObject,
  },
  post: {
    borderRadius: theme.radius.medium,
    padding: theme.spacing[400],
  },
})
