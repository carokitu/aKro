import { User } from 'lucide-react-native'
import { StyleSheet, View } from 'react-native'

import { Image } from 'expo-image'

import { theme } from '../theme'

type AvatarSize = 'lg' | 'md' | 'sm' | 'xl' | 'xxl'

type AvatarProps = {
  avatar?: null | string // relative avatar in the public bucket
  size?: AvatarSize
}

const SIZES: Record<AvatarSize, number> = {
  lg: 48,
  md: 32,
  sm: 24,
  xl: 88,
  xxl: 100,
}

export const Avatar = ({ avatar, size = 'md' }: AvatarProps) => {
  const dimension = SIZES[size]

  if (!avatar) {
    return (
      <View style={[styles.iconContainer, { height: dimension, width: dimension }]}>
        <User color={theme.colors.neutral['50']} size={dimension * 0.65} />
      </View>
    )
  }

  const publicUrl = `${process.env.EXPO_PUBLIC_SUPABASE_URL}/storage/v1/object/public/avatars/${avatar}`

  return (
    <View style={{ height: dimension, width: dimension }}>
      <Image
        cachePolicy="memory-disk"
        contentFit="cover"
        source={{ uri: publicUrl }}
        style={styles.avatar}
        transition={100}
      />
    </View>
  )
}

const styles = StyleSheet.create({
  avatar: {
    borderRadius: theme.radius.full,
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
