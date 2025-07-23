import React, { forwardRef, useImperativeHandle, useRef, useState } from 'react'
import { Animated, Pressable, type StyleProp, StyleSheet, View, type ViewStyle } from 'react-native'

import { useDoubleTap } from '../../../hooks'
import { theme } from '../../theme'

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
    <Pressable onPress={handleTap}>
      <View style={[styles.post, style]}>
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
      </View>
    </Pressable>
  )
})

const styles = StyleSheet.create({
  overlay: {
    alignItems: 'center',
    bottom: 0,
    justifyContent: 'center',
    left: 0,
    position: 'absolute',
    right: 0,
    top: 0,
  },
  post: {
    backgroundColor: theme.surface.brand.default,
    borderRadius: theme.radius.medium,
    padding: theme.spacing[400],
  },
})
