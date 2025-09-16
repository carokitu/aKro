import { useActionSheet } from '@expo/react-native-action-sheet'
import { EllipsisVertical } from 'lucide-react-native'
import { memo } from 'react'
import { StyleSheet, TouchableOpacity, View } from 'react-native'

import { router } from 'expo-router'

import { type Post as TPost, type User } from '../../../../models'
import { client } from '../../../../supabase'
import { Avatar, Label, Text } from '../../../system'
import { theme } from '../../../theme'
import { formatRelativeDate } from '../../../utils'
import Description from './Description'

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

export const reportPost = async ({
  postId,
  userId,
}: {
  postId: string
  userId: string
}): Promise<{ error?: string; success: boolean }> => {
  try {
    const { error } = await client.from('post_reports').insert({ post_id: postId, user_id: userId })

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

export const Header = memo(
  ({ item, triggerRefresh, user }: { item: TPost; triggerRefresh: () => void; user: User }) => {
    const isCurrentUserPost = user.id === item.user_id
    const { showActionSheetWithOptions } = useActionSheet()

    const ownPostOptions = () =>
      showActionSheetWithOptions(
        {
          cancelButtonIndex: 1,
          destructiveButtonIndex: 0,
          message: 'Cette action est irréversible. Êtes-vous sûr de vouloir continuer ?',
          options: ['Supprimer mon post', 'Conserver mon post'],
          title: 'Supprimer ce post ?',
        },
        async (index) => {
          if (index === 0) {
            const { success } = await deletePost(item.id)

            if (success) {
              triggerRefresh()
            }
          }
        },
      )

    const otherPostOptions = () =>
      showActionSheetWithOptions(
        {
          cancelButtonIndex: 1,
          destructiveButtonIndex: 0,
          message: 'Aidez-nous à maintenir une communauté sûre.',
          options: ['Signaler', 'Annuler'],
          title: 'Signaler ce post ?',
        },
        async (index) => {
          if (index === 0) {
            const { success } = await reportPost({ postId: item.id, userId: user.id })
            if (success) {
              console.log('Post signalé')
            }
          }
        },
      )

    const handleEllipsisPress = async () => {
      if (isCurrentUserPost) {
        ownPostOptions()
      } else {
        otherPostOptions()
      }
    }

    return (
      <>
        <TouchableOpacity
          activeOpacity={0.6}
          onPress={() => router.push(`/profile/${item.username}`)}
          style={styles.user}
        >
          <Avatar avatar={item.avatar_url} />
          <View style={styles.info}>
            <Label color="invert">{item.username}</Label>
            <Text color="invert">{formatRelativeDate(item.created_at)}</Text>
          </View>
          <EllipsisVertical color={theme.text.base.invert} onPress={handleEllipsisPress} style={styles.ellipsis} />
        </TouchableOpacity>
        <Description description={item.description} />
      </>
    )
  },
)

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
  },
})
