import React, { useRef, useState } from 'react'
import { Animated, Pressable, type StyleProp, StyleSheet, View, type ViewStyle } from 'react-native'

import { useDoubleTap } from '../../../hooks'
import { theme } from '../../theme'

export const InteractiveContainer = ({
  children,
  handleLike,
  style,
}: {
  children: React.ReactNode
  handleLike: () => void
  style?: StyleProp<ViewStyle>
}) => {
  const [showLikeOverlay, setShowLikeOverlay] = useState(false)
  const scale = useRef(new Animated.Value(0)).current

  const likePost = () => {
    setShowLikeOverlay(true)
    Animated.sequence([
      Animated.timing(scale, { duration: 150, toValue: 1, useNativeDriver: true }),
      Animated.timing(scale, { delay: 300, duration: 300, toValue: 0, useNativeDriver: true }),
    ]).start(() => setShowLikeOverlay(false))
    handleLike()
  }

  const handleTap = useDoubleTap({ onDoubleTap: () => likePost() })

  return (
    <Pressable onPress={handleTap}>
      <View style={[styles.post, style]}>
        {children}
        {showLikeOverlay && (
          <Animated.Image
            // eslint-disable-next-line @typescript-eslint/no-require-imports
            source={require('../../../assets/images/post-overlay/like.png')}
            style={[
              styles.overlay,
              {
                opacity: scale,
                transform: [{ scale }],
              },
            ]}
          />
        )}
      </View>
    </Pressable>
  )
}

const styles = StyleSheet.create({
  overlay: {
    height: '100%',
    position: 'absolute',
    width: '100%',
  },
  post: {
    backgroundColor: theme.surface.brand.default,
    borderRadius: theme.radius.medium,
    padding: theme.spacing[400],
  },
})
