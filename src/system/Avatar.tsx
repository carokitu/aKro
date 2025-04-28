import { User } from 'lucide-react-native'
import { useCallback, useEffect, useState } from 'react'
import { Image, type StyleProp, StyleSheet, View, type ViewStyle } from 'react-native'

import { client } from '../../supabase'
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
  const [image, setImage] = useState<null | string>(null)

  const loadAvatar = useCallback(async () => {
    if (!avatar) {
      return
    }

    const { data, error: downloadError } = await client.storage.from('avatars').download(avatar)
    if (data) {
      const fr = new FileReader()
      fr.readAsDataURL(data)
      fr.onload = () => {
        setImage(fr.result as string)
      }
    } else if (downloadError) {
      setError(true)
    }
  }, [avatar])

  useEffect(() => {
    loadAvatar()
  }, [loadAvatar])

  if (!image || error) {
    return (
      <View style={[styles.iconContainer, SIZE_STYLES[size], style]}>
        <User color={theme.colors.neutral['50']} style={styles.icon} />
      </View>
    )
  }

  return (
    <View style={[styles.avatarContainer, SIZE_STYLES[size], style]}>
      <Image
        onError={() => {
          setError(true)
        }}
        resizeMode="cover"
        source={{ uri: image }}
        style={styles.avatar}
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
