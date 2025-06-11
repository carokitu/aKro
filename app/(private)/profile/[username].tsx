import { ArrowRight, CircleOff, Settings } from 'lucide-react-native'
import { useCallback, useEffect, useState } from 'react'
import { StyleSheet, TouchableOpacity, View } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'

import { router, useLocalSearchParams } from 'expo-router'

import { useUser } from '../../../hooks'
import { type Post, type User } from '../../../models'
import { PostsList } from '../../../src'
import { FollowButton, NavBar } from '../../../src/components'
import { Avatar, Error as ErrorScreen, Text, Title } from '../../../src/system'
import { theme } from '../../../src/theme'
import { client } from '../../../supabase'

// Follower       Followed
// currentUser    user          is_followed
// user           currentUser   is_following

type EnhancedUser = User & {
  followers: User[]
  followers_count: number
  following: User[]
  follows_me: boolean
  is_followed: boolean
}

const FollowedByUsers = ({ user }: { user: EnhancedUser }) => {
  const displayedFollowers = user.followers?.slice(0, 4) || []
  const count = user.followers_count - displayedFollowers.length
  const hiddenCount = count > 99 ? '99+' : `+${count}`
  const isDisabled = user.followers_count === 0
  const [isPressed, setIsPressed] = useState(false)

  const handlePress = () => {
    router.push(`./followers/${user.username}`)
  }

  return (
    <TouchableOpacity
      activeOpacity={1}
      disabled={isDisabled}
      onPress={handlePress}
      onPressIn={() => setIsPressed(true)}
      onPressOut={() => setIsPressed(false)}
      style={[styles.followedBy, isPressed && styles.pressed]}
    >
      <View style={styles.avatarRow}>
        {displayedFollowers.map((follower, index) => (
          <View key={follower.id} style={[styles.avatarWrapper, index > 0 && styles.notFirstAvatar]}>
            <Avatar avatar={follower.avatar_url} size="md" />
          </View>
        ))}
        {count > 0 && (
          <View style={[styles.avatarWrapper, styles.moreCircle, styles.notFirstAvatar]}>
            <Text style={styles.moreText}>{hiddenCount}</Text>
          </View>
        )}
      </View>
      <View style={styles.followLabel}>
        <Text color={isDisabled ? 'disabled' : 'default'} style={styles.followText}>
          {user.followers_count} abonné{user.followers_count > 1 ? 's' : ''}
        </Text>
        <ArrowRight color={isDisabled ? theme.text.disabled : theme.text.base.default} />
      </View>
    </TouchableOpacity>
  )
}

const FollowsUsers = ({ user }: { user: EnhancedUser }) => {
  const displayedFollowers = user.following?.slice(0, 4) || []
  const isDisabled = !user.following
  const [isPressed, setIsPressed] = useState(false)

  const handlePress = () => {
    router.push(`./following/${user.username}`)
  }

  return (
    <TouchableOpacity
      activeOpacity={1}
      disabled={isDisabled}
      onPress={handlePress}
      onPressIn={() => setIsPressed(true)}
      onPressOut={() => setIsPressed(false)}
      style={[styles.followedBy, isPressed && styles.pressed]}
    >
      <View style={styles.avatarRow}>
        {displayedFollowers.map((follower, index) => (
          <View key={follower.id} style={[styles.avatarWrapper, index > 0 && styles.notFirstAvatar]}>
            <Avatar avatar={follower.avatar_url} size="md" />
          </View>
        ))}
        {!isDisabled && (
          <View style={[styles.avatarWrapper, styles.moreCircle, user.following && styles.notFirstAvatar]}>
            <Text style={styles.moreText}>•••</Text>
          </View>
        )}
      </View>
      <View style={styles.followLabel}>
        <Text color={isDisabled ? 'disabled' : 'default'} style={styles.followText}>
          abonnements
        </Text>
        <ArrowRight color={isDisabled ? theme.text.disabled : theme.text.base.default} />
      </View>
    </TouchableOpacity>
  )
}

const Inspirations = ({ user }: { user: EnhancedUser }) => (
  <>
    <Title style={styles.inspirationsTitle}>Inspirations</Title>
    <View style={styles.inspirations}>
      <FollowedByUsers user={user} />
      <FollowsUsers user={user} />
    </View>
  </>
)

const UserInfos = ({ user: userFromProps }: { user: EnhancedUser }) => {
  const { user: currentUser } = useUser()
  const [user, setUser] = useState<EnhancedUser>(userFromProps)

  const onFollow = () => {
    setUser((prev) => ({ ...prev, followers_count: prev.followers_count + 1, is_followed: true }))
  }

  const onUnfollow = () => {
    setUser((prev) => ({ ...prev, followers_count: prev.followers_count - 1, is_followed: false }))
  }

  if (!currentUser) {
    return null
  }

  return (
    <View style={styles.userInfos}>
      <View style={styles.infos}>
        <Avatar avatar={user.avatar_url} size="xl" />
        <View style={styles.infosContent}>
          <Title>{user.name}</Title>
          {user.bio && (
            <Text numberOfLines={4} size="small">
              {user.bio}
            </Text>
          )}
        </View>
      </View>
      <FollowButton
        currentUserId={currentUser.id}
        follows_me={user.follows_me}
        is_followed={user.is_followed}
        onFollow={onFollow}
        onUnfollow={onUnfollow}
        otherUser={user.id}
        size="md"
        style={styles.followButton}
        withIcon
      />
      <Inspirations user={user} />
      <Title style={styles.publicationsTitle}>Publications</Title>
    </View>
  )
}

const EmptyState = () => (
  <View style={styles.emptyState}>
    <CircleOff color={theme.text.base.secondary} size={40} />
    <Title color="secondary">Aucune publication</Title>
  </View>
)

const UserProfile = () => {
  const { username } = useLocalSearchParams()
  const { user: currentUser } = useUser()
  const [user, setUser] = useState<EnhancedUser | null>(null)
  const isCurrentUserProfile = username === currentUser?.username
  console.log('username param:', username)

  useEffect(() => {
    const fetchProfile = async () => {
      if (!currentUser) {
        return
      }

      const { data } = await client.rpc('get_user_profile', {
        p_username: username,
        p_viewer_id: currentUser.id,
      })

      setUser(data as EnhancedUser)
    }

    if (username) {
      fetchProfile()
    }
  }, [currentUser, username])

  const fetchPosts = useCallback(
    async ({ limit, offset }: { limit: number; offset: number }): Promise<{ data: Post[]; error: Error | null }> => {
      if (!user) {
        return { data: [], error: new Error('User not found') }
      }

      const { data, error } = await client.rpc('get_user_posts', {
        p_limit: limit,
        p_offset: offset,
        p_username: username,
        p_viewer_id: user.id,
      })

      return { data: data as Post[], error }
    },
    [user, username],
  )

  if (!user || !currentUser) {
    console.log('UserProfile mounted', user, currentUser)
    return <ErrorScreen />
  }

  return (
    <SafeAreaView edges={['top']} style={styles.container}>
      <NavBar
        rightIcon={isCurrentUserProfile ? { handlePress: () => router.push('./settings'), Icon: Settings } : undefined}
        title={user.username}
      />
      <PostsList
        fetchPosts={fetchPosts}
        ListEmptyComponent={<EmptyState />}
        ListHeaderComponent={<UserInfos user={user} />}
        user={currentUser}
      />
    </SafeAreaView>
  )
}

export default UserProfile

const styles = StyleSheet.create({
  avatarRow: {
    alignItems: 'center',
    flexDirection: 'row',
    height: 34,
  },
  avatarWrapper: {
    borderColor: theme.surface.base.secondary,
    borderRadius: theme.radius.full,
    borderWidth: 2,
    height: 34,
    overflow: 'hidden',
    width: 34,
  },
  container: {
    flex: 1,
  },
  emptyState: {
    alignItems: 'center',
    gap: theme.spacing['400'],
    justifyContent: 'center',
    marginTop: theme.spacing['800'],
  },
  followButton: {
    marginVertical: theme.spacing['400'],
    width: '100%',
  },
  followedBy: {
    backgroundColor: theme.surface.base.secondary,
    borderRadius: theme.radius.medium,
    gap: theme.spacing['200'],
    padding: theme.spacing['400'],
    width: '49%',
  },
  followLabel: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  followText: {
    fontSize: 14,
    fontWeight: '500',
  },
  infos: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: theme.spacing[400],
  },
  infosContent: {
    flex: 1,
    gap: theme.spacing[100],
    maxHeight: 100,
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
  inspirations: {
    flexDirection: 'row',
    gap: theme.spacing['200'],
    marginBottom: theme.spacing['200'],
  },
  inspirationsTitle: {
    marginVertical: theme.spacing['200'],
  },
  moreCircle: {
    alignItems: 'center',
    backgroundColor: theme.text.base.tertiary,
    justifyContent: 'center',
  },
  moreText: {
    color: theme.text.base.invert,
    fontSize: 14,
    fontWeight: '600',
  },
  notFirstAvatar: {
    marginLeft: -12,
  },
  pressed: {
    backgroundColor: theme.surface.base.secondaryPressed,
  },
  publicationsTitle: {
    marginBottom: theme.spacing['200'],
    marginTop: theme.spacing['600'],
  },
  userInfos: {
    paddingHorizontal: theme.spacing['400'],
  },
})
