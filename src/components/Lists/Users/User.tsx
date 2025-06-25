import { memo, useState } from 'react'
import { StyleSheet, TouchableOpacity, View } from 'react-native'

import { router } from 'expo-router'
import pluralize from 'pluralize'

import { type User as TUser } from '../../../../models'
import { type UserWithStats } from '../../../../models/custom'
import { Avatar, Label, Text } from '../../../../src/system'
import { theme } from '../../../../src/theme'
import { FollowButton } from '../../ActionButtons'

export const User = memo(({ currentUser, item }: { currentUser: TUser; item: UserWithStats }) => {
  const [isPressed, setIsPressed] = useState(false)
  const { avatar_url, follows_me, id, is_followed, mutual_count, name, username } = item

  const handlePress = () => {
    router.push(`/profile/${username}`)
  }

  const isCurrentUser = currentUser.id === id

  const info =
    mutual_count && !isCurrentUser ? `${name} • ${mutual_count} ${pluralize('ami', mutual_count)} en commun` : name

  return (
    <TouchableOpacity
      activeOpacity={1}
      onPress={handlePress}
      onPressIn={() => setIsPressed(true)}
      onPressOut={() => setIsPressed(false)}
      style={[styles.userCard, isPressed && styles.pressed]}
    >
      <View style={styles.userCardContent}>
        <Avatar avatar={avatar_url} size="lg" />
        <View style={styles.info}>
          <Label ellipsizeMode="tail" numberOfLines={1} style={styles.username}>
            {username}
          </Label>
          <Text color="secondary" ellipsizeMode="tail" numberOfLines={1} size="small" style={styles.name}>
            {info}
          </Text>
        </View>
      </View>
      {!isCurrentUser && (
        <FollowButton
          currentUserId={currentUser.id}
          follows_me={follows_me}
          is_followed={is_followed}
          otherUser={id}
          size="sm"
        />
      )}
    </TouchableOpacity>
  )
})

const styles = StyleSheet.create({
  info: {
    flex: 1,
    marginHorizontal: theme.spacing[300],
    overflow: 'hidden',
  },
  name: {
    flexShrink: 1,
  },
  pressed: {
    backgroundColor: theme.surface.base.defaultPressed,
  },
  userCard: {
    alignItems: 'center',
    borderRadius: theme.radius.small,
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: theme.spacing[300],
    overflow: 'hidden',
    padding: theme.spacing[100],
  },
  userCardContent: {
    alignItems: 'center',
    flex: 1,
    flexDirection: 'row',
  },
  username: {
    flexShrink: 1,
  },
})
