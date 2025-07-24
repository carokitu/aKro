import React, { forwardRef, useImperativeHandle, useRef, useState } from 'react'
import { Animated, Image, Pressable, type StyleProp, StyleSheet, View, type ViewStyle } from 'react-native'

import { BlurView } from 'expo-blur'
import { LinearGradient } from 'expo-linear-gradient'

import { useDoubleTap } from '../../../hooks'
import { theme } from '../../theme'

export type InteractiveContainerRef = {
  triggerOverlay: () => void
}

export const InteractiveContainer = forwardRef<
  InteractiveContainerRef,
  {
    albumCoverUrl: string
    children: React.ReactNode
    handleLike: () => void
    style?: StyleProp<ViewStyle>
  }
>(({ albumCoverUrl, children, handleLike, style }, ref) => {
  const [showLikeOverlay, setShowLikeOverlay] = useState(false)
  const scale = useRef(new Animated.Value(0)).current

  const triggerOverlay = () => {
    setShowLikeOverlay(true)
    Animated.sequence([
      Animated.timing(scale, { duration: 150, toValue: 1, useNativeDriver: true }),
      Animated.timing(scale, { delay: 300, duration: 300, toValue: 0, useNativeDriver: true }),
    ]).start(() => setShowLikeOverlay(false))
  }

  const likePost = () => {
    triggerOverlay()
    handleLike()
  }

  const handleTap = useDoubleTap({ onDoubleTap: () => likePost() })

  useImperativeHandle(ref, () => ({
    triggerOverlay,
  }))

  return (
    <Pressable onPress={handleTap} style={[styles.post, style]}>
      <View style={styles.backgroundContainer}>
        <Image source={{ uri: albumCoverUrl }} style={styles.backgroundImage} />
        <BlurView intensity={100} style={styles.blurOverlay} tint="regular" />
        <LinearGradient
          colors={['rgba(0,0,0,0.3)', 'rgba(0,0,0,0.0)', 'rgba(0,0,0,0.25)', 'rgba(0,0,0,0.5)']}
          locations={[0, 0.2, 0.7, 1]}
          style={styles.gradientOverlay}
        />
      </View>
      {children}
      {showLikeOverlay && (
        <View style={styles.overlay}>
          <Animated.Image
            // eslint-disable-next-line @typescript-eslint/no-require-imports
            source={require('../../../assets/images/icons/heart-filled.png')}
            style={{
              opacity: scale,
              transform: [{ scale }],
            }}
          />
        </View>
      )}
    </Pressable>
  )
})

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
  overlay: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    justifyContent: 'center',
  },
  post: {
    borderRadius: theme.radius.medium,
    padding: theme.spacing[400],
    position: 'relative',
  },
})
