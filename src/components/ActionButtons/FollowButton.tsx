import { useActionSheet } from '@expo/react-native-action-sheet'
import { UserCheck, UserPlus } from 'lucide-react-native'
import { useCallback, useEffect, useState } from 'react'
import { Keyboard, type StyleProp, StyleSheet, type ViewStyle } from 'react-native'

import { Button } from '../../../src/system'
import { theme } from '../../../src/theme'
import { client } from '../../../supabase'

type Props = {
  currentUserId: string
  follows_me: boolean
  is_followed: boolean
  onFollow: () => void
  onUnfollow: () => void
  otherUser: string
  size?: 'lg' | 'md' | 'sm'
  style?: StyleProp<ViewStyle>
  withIcon?: boolean
}

export const FollowButton = ({
  currentUserId,
  follows_me,
  is_followed,
  onFollow,
  onUnfollow,
  otherUser,
  size = 'md',
  style,
  withIcon = false,
}: Props) => {
  const { showActionSheetWithOptions } = useActionSheet()
  const [followsMe, setFollowsMe] = useState(false)
  const [isFollowed, setIsFollowed] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    setIsFollowed(is_followed)
    setFollowsMe(follows_me)
  }, [follows_me, is_followed])

  const handleFollow = useCallback(async () => {
    setIsLoading(true)

    const { error } = await client.from('follows').insert({
      created_at: new Date().toISOString(),
      followed_id: otherUser,
      follower_id: currentUserId,
    })

    if (!error) {
      setIsFollowed(true)
    }

    setIsLoading(false)
    onFollow()
  }, [currentUserId, onFollow, otherUser])

  const unfollow = useCallback(async () => {
    setIsLoading(true)

    const { error } = await client
      .from('follows')
      .delete()
      .match({ followed_id: otherUser, follower_id: currentUserId })

    if (!error) {
      setIsFollowed(false)
    }

    setIsLoading(false)
    onUnfollow()
  }, [currentUserId, onUnfollow, otherUser])

  const handleUnfollow = useCallback(() => {
    showActionSheetWithOptions(
      {
        cancelButtonIndex: 1,
        destructiveButtonIndex: 0,
        options: ['Se désabonner', 'Annuler'],
      },
      (index) => {
        if (index === 0) {
          unfollow()
        }
      },
    )
  }, [showActionSheetWithOptions, unfollow])

  const handlePress = () => (isFollowed ? handleUnfollow() : handleFollow())

  const isFollowingTitle = followsMe ? 'Suivre en retour' : 'Suivre'
  const followButtonTitle = isFollowed ? 'Suivi(e)' : isFollowingTitle

  const Icon = isFollowed ? <UserCheck color={theme.text.base.default} /> : <UserPlus color={theme.text.base.invert} />

  return (
    <Button
      beforeElement={withIcon && Icon}
      disabled={isLoading}
      onPress={() => {
        handlePress()
        Keyboard.dismiss()
      }}
      size={size}
      style={[styles.followButton, style]}
      title={followButtonTitle}
      variant={isFollowed ? 'secondary' : 'primary'}
    />
  )
}

const styles = StyleSheet.create({
  followButton: {
    // width: '100%',
  },
})
