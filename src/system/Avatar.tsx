import { User } from 'lucide-react-native'
import { useState } from 'react'
import { Image, type StyleProp, StyleSheet, View, type ViewStyle } from 'react-native'

import { theme } from '../theme'

type Props = {
  avatar?: null | string
  size?: 'lg' | 'md' | 'sm'
  style?: StyleProp<ViewStyle>
}

const SIZE_STYLES = {
  lg: {
    height: 48,
    width: 48,
  },
  md: {
    height: 32,
    width: 32,
  },
  sm: {
    height: 24,
    width: 24,
  },
}

export const Avatar = ({ avatar, size = 'md', style }: Props) => {
  const [error, setError] = useState(false)

  if (!avatar || error) {
    return (
      <View style={[styles.iconContainer, SIZE_STYLES[size], style]}>
        <User color={theme.colors.neutral['50']} style={styles.icon} />
      </View>
    )
  }

  return (
    <View style={[styles.avatarContainer, SIZE_STYLES[size], style]}>
      <Image onError={() => setError(true)} resizeMode="cover" source={{ uri: avatar }} style={styles.avatar} />
    </View>
  )
}

const styles = StyleSheet.create({
  avatar: {
    borderRadius: theme.radius.full,
    height: '100%',
    width: '100%',
  },
  avatarContainer: {
    borderRadius: theme.radius.full,
    overflow: 'hidden',
  },
  icon: {
    height: '100%',
    width: '100%',
  },
  iconContainer: {
    alignItems: 'center',
    backgroundColor: theme.colors.neutral['500'],
    borderRadius: theme.radius.full,
    justifyContent: 'center',
  },
})
