import { useActionSheet } from '@expo/react-native-action-sheet'
import { EllipsisVertical } from 'lucide-react-native'
import { StyleSheet, TouchableOpacity, View } from 'react-native'

import { router } from 'expo-router'

import { type User } from '../../../../models'
import { client } from '../../../../supabase'
import { Avatar, Label, Text } from '../../../system'
import { theme } from '../../../theme'
import { formatRelativeDate } from '../../../utils'
import { type EnhancedFeedPost } from './types'

export const deletePost = async (postId: string): Promise<{ error?: string; success: boolean }> => {
  try {
    const { error } = await client.from('posts').delete().eq('id', postId)

    if (error) {
      return { error: error.message, success: false }
    }

    return { success: true }
  } catch (err) {
    return {
      error: err instanceof Error ? err.message : 'Unknown error',
      success: false,
    }
  }
}

export const Header = ({
  item,
  triggerRefresh,
  user,
}: {
  item: EnhancedFeedPost
  triggerRefresh: () => void
  user: User
}) => {
  const isCurrentUserPost = user.id === item.user_id
  const { showActionSheetWithOptions } = useActionSheet()

  const handleEllipsisPress = async () => {
    showActionSheetWithOptions(
      {
        destructiveButtonIndex: 1,
        message: 'Cette action est irréversible. Êtes-vous sûr de vouloir continuer ?',
        options: ['Conserver mon post', 'Supprimer mon post'],
        title: 'Supprimer ce post ?',
      },
      async (index) => {
        if (index === 1) {
          const { success } = await deletePost(item.id)
          if (success) {
            triggerRefresh()
          }
        }
      },
    )
  }

  return (
    <TouchableOpacity activeOpacity={0.6} onPress={() => router.push(`/profile/${item.username}`)} style={styles.user}>
      <Avatar avatar={item.avatar_url} />
      <View style={styles.info}>
        <Label color="invert">{item.username}</Label>
        <Text color="invert">{formatRelativeDate(item.created_at)}</Text>
      </View>
      {isCurrentUserPost && (
        <EllipsisVertical color={theme.text.base.invert} onPress={handleEllipsisPress} style={styles.ellipsis} />
      )}
    </TouchableOpacity>
  )
}

const styles = StyleSheet.create({
  ellipsis: {
    marginLeft: 'auto',
  },
  info: {
    marginLeft: theme.spacing[200],
  },
  user: {
    alignItems: 'center',
    flexDirection: 'row',
    marginBottom: theme.spacing[1000],
  },
})
