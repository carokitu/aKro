import React, { forwardRef, useImperativeHandle, useRef, useState } from 'react'
import { Animated, Pressable, type StyleProp, StyleSheet, View, type ViewStyle } from 'react-native'

import { LinearGradient } from 'expo-linear-gradient'

import { useDoubleTap } from '../../../hooks'
import { theme } from '../../theme'
import { useTrackColors } from './ColorProvider'

export type InteractiveContainerRef = {
  triggerOverlay: () => void
}

export const InteractiveContainer = forwardRef<
  InteractiveContainerRef,
  {
    children: React.ReactNode
    handleLike: () => void
    style?: StyleProp<ViewStyle>
  }
>(({ children, handleLike, style }, ref) => {
  const [showLikeOverlay, setShowLikeOverlay] = useState(false)
  const scale = useRef(new Animated.Value(0)).current
  const { color } = useTrackColors()

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
      <View style={[styles.backgroundContainer, { backgroundColor: color }]}>
        <LinearGradient colors={['rgba(13,26,38,0.4)', 'rgba(13,26,38,0.4)']} style={StyleSheet.absoluteFillObject} />
        <LinearGradient
          colors={['rgba(13,26,38,0.07)', 'rgba(13,26,38,0)', 'rgba(13,26,38,0.07)', 'rgba(13,26,38,0.2)']}
          end={{ x: 0.5, y: 1 }}
          locations={[0, 0.1154, 0.7981, 0.9038]}
          start={{ x: 0.5, y: 0 }}
          style={StyleSheet.absoluteFillObject}
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
