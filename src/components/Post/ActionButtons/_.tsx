/* eslint-disable @typescript-eslint/no-require-imports */
import { Heart, MessageSquareMore, Volume2, VolumeOff } from 'lucide-react-native'
import { memo, useEffect, useState } from 'react'
import { Image, StyleSheet, TouchableOpacity, View } from 'react-native'

import { router } from 'expo-router'

import { useFeed, useMute, usePost } from '../../../../hooks'
import { type Post as TPost, type User } from '../../../../models'
import { Text } from '../../../system'
import { theme } from '../../../theme'

type Props = {
  isLikedByCurrentUser: boolean
  item: TPost
  likesCount: number
  onLikePress: () => void
  user: User
}

export const ActionButtons = memo(({ isLikedByCurrentUser, item, likesCount, onLikePress, user }: Props) => {
  const { setExpendedLikesPostId } = usePost()
  const { mute, setMute } = useMute()
  const { commentUpdates } = useFeed()
  const [commentsCount, setCommentsCount] = useState(0)

  useEffect(() => {
    setCommentsCount(item.comments_count)
  }, [item])

  useEffect(() => {
    const updatedCount = commentUpdates.get(item.id)
    if (updatedCount !== undefined) {
      setCommentsCount(updatedCount)
    }
  }, [commentUpdates, item.id])

  return (
    <View style={styles.actions}>
      <View style={styles.composed}>
        <TouchableOpacity onPress={() => setMute(!mute)}>
          {mute ? (
            <VolumeOff color={theme.surface.base.default} size={30} />
          ) : (
            <Volume2 color={theme.surface.base.default} size={30} />
          )}
        </TouchableOpacity>
        <Text> </Text>
      </View>
      <TouchableOpacity onPress={() => router.push(`/post/${item.id}`)} style={styles.composed}>
        <MessageSquareMore color={theme.surface.base.default} size={32} />
        <Text color="invert">{commentsCount ?? 0}</Text>
      </TouchableOpacity>
      <View style={styles.composed}>
        <TouchableOpacity onPress={onLikePress}>
          {isLikedByCurrentUser ? (
            <Image source={require('../../../../assets/images/icons/heart-filled.png')} style={styles.customIcon} />
          ) : (
            <Heart color={theme.surface.base.default} size={30} />
          )}
        </TouchableOpacity>
        <TouchableOpacity onPress={() => likesCount > 0 && setExpendedLikesPostId(item.id)}>
          <Text color="invert">{likesCount}</Text>
        </TouchableOpacity>
      </View>
    </View>
  )
})

const styles = StyleSheet.create({
  actions: {
    flexDirection: 'column',
    gap: theme.spacing[1200],
    justifyContent: 'space-between',
    marginBottom: theme.spacing[800],
    paddingTop: theme.spacing[100],
  },
  composed: {
    alignItems: 'center',
  },
  customIcon: {
    height: 30,
    width: 30,
  },
})
