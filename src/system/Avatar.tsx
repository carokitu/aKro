import AsyncStorage from '@react-native-async-storage/async-storage'
import { User } from 'lucide-react-native'
import { useCallback, useEffect, useRef, useState } from 'react'
import { Image, type StyleProp, StyleSheet, View, type ViewStyle } from 'react-native'

import { client } from '../../supabase'
import { theme } from '../theme'

type Props = {
  avatar?: null | string
  size?: 'lg' | 'md' | 'sm' | 'xl'
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
  xl: {
    height: 88,
    width: 88,
  },
}

const CACHE_EXPIRY_TIME = 1000 * 60 * 60 * 24 // 1 day

// Caching functions
const cacheAvatar = async (avatarUrl: string, avatarKey: string) => {
  try {
    const cachedData = { avatarUrl, timestamp: Date.now() }
    await AsyncStorage.setItem(avatarKey, JSON.stringify(cachedData))
  } catch (cause) {
    console.error('Error saving avatar to AsyncStorage', cause)
  }
}

const getCachedAvatar = async (avatarKey: string) => {
  try {
    const cachedData = await AsyncStorage.getItem(avatarKey)
    if (cachedData) {
      const { avatarUrl, timestamp } = JSON.parse(cachedData)

      // Return null if cache has expired
      if (Date.now() - timestamp > CACHE_EXPIRY_TIME) {
        await AsyncStorage.removeItem(avatarKey)
        return null
      }

      return avatarUrl
    }

    return null
  } catch (cause) {
    console.error('Error retrieving avatar from AsyncStorage', cause)
    return null
  }
}

export const Avatar = ({ avatar, size = 'md', style }: Props) => {
  const [image, setImage] = useState<null | string>(null)
  const [error, setError] = useState(false)
  const fileReaderRef = useRef<FileReader | null>(null)

  const loadAvatar = useCallback(async () => {
    if (!avatar) {
      return
    }

    const avatarKey = `avatar-${avatar}`
    const cachedAvatar = await getCachedAvatar(avatarKey)
    if (cachedAvatar) {
      setImage(cachedAvatar)
      return
    }

    try {
      const { data, error: downloadError } = await client.storage.from('avatars').download(avatar)
      if (downloadError || !data) {
        throw new Error('Failed to download avatar')
      }

      // Use FileReader to convert image data to base64
      const fr = new FileReader()
      fileReaderRef.current = fr

      fr.onload = () => {
        const avatarUrl = fr.result as string
        if (avatarUrl !== image) {
          setImage(avatarUrl)
          cacheAvatar(avatarUrl, avatarKey) // Cache the avatar for future use
        }
      }

      fr.readAsDataURL(data)
    } catch {
      setError(true)
    }
  }, [avatar, image])

  useEffect(() => {
    loadAvatar()
  }, [loadAvatar])

  if (!image || !avatar || error) {
    return (
      <View style={[styles.iconContainer, SIZE_STYLES[size], style]}>
        <User color={theme.colors.neutral['50']} style={styles.icon} />
      </View>
    )
  }

  return (
    <View style={[styles.avatarContainer, SIZE_STYLES[size], style]}>
      <Image onError={() => setError(true)} resizeMode="cover" source={{ uri: image }} style={styles.avatar} />
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
