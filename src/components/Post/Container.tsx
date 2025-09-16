import { type StyleProp, StyleSheet, View, type ViewStyle } from 'react-native'

import { LinearGradient } from 'expo-linear-gradient'

import { theme } from '../../theme'
import { useTrackColors } from './ColorProvider'

export const Container = ({ children, style }: { children: React.ReactNode; style?: StyleProp<ViewStyle> }) => {
  const { color } = useTrackColors()

  return (
    <View style={[styles.post, style]}>
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
  post: {
    borderRadius: theme.radius.medium,
    padding: theme.spacing[400],
  },
})
