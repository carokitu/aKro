import { ArrowRight, ChevronLeft } from 'lucide-react-native'
import { useEffect, useState } from 'react'
import { StyleSheet, View } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'

import { FlashList } from '@shopify/flash-list'
import { router, useLocalSearchParams } from 'expo-router'

import { useUser } from '../../../hooks'
import { type User } from '../../../models'
import { FollowButton } from '../../../src/components/ActionButtons/FollowButton'
import { Avatar, H1, IconButton, Text, Title } from '../../../src/system'
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

const Header = ({ username }: { username: string }) => (
  <View style={styles.title}>
    <IconButton
      Icon={ChevronLeft}
      onPress={() => router.back()}
      size="md"
      style={styles.backButton}
      variant="tertiary"
    />
    <H1>{username}</H1>
  </View>
)

const FollowedByUsers = ({ user }: { user: EnhancedUser }) => {
  const displayedFollowers = user.followers?.slice(0, 4) || []
  const count = user.followers_count - displayedFollowers.length
  const hiddenCount = count > 99 ? '99+' : `+${count}`

  return (
    <View style={styles.followedBy}>
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
        <Text style={styles.followText}>
          {user.followers_count} abonné{user.followers_count > 1 ? 's' : ''}
        </Text>
        <ArrowRight color={theme.text.base.default} />
      </View>
    </View>
  )
}

const FollowsUsers = ({ user }: { user: EnhancedUser }) => {
  const displayedFollowers = user.following?.slice(0, 4) || []

  return (
    <View style={styles.followedBy}>
      <View style={styles.avatarRow}>
        {displayedFollowers.map((follower, index) => (
          <View key={follower.id} style={[styles.avatarWrapper, index > 0 && styles.notFirstAvatar]}>
            <Avatar avatar={follower.avatar_url} size="md" />
          </View>
        ))}
        <View style={[styles.avatarWrapper, styles.moreCircle, user.following && styles.notFirstAvatar]}>
          <Text style={styles.moreText}>•••</Text>
        </View>
      </View>
      <View style={styles.followLabel}>
        <Text style={styles.followText}>abonnements</Text>
        <ArrowRight color={theme.text.base.default} />
      </View>
    </View>
  )
}

const Inspirations = ({ user }: { user: EnhancedUser }) => {
  return (
    <>
      <Title style={styles.inspirationsTitle}>Inspirations</Title>
      <View style={styles.inspirations}>
        <FollowedByUsers user={user} />
        <FollowsUsers user={user} />
      </View>
    </>
  )
}

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
      <Text>Publications</Text>
    </View>
  )
}

const UserProfile = () => {
  const { username } = useLocalSearchParams()
  const { user: currentUser } = useUser()
  const [user, setUser] = useState<EnhancedUser | null>(null)

  // useEffect(() => {
  //   if (username === currentUser?.username) {
  //     router.replace('/profile/me')
  //   }
  // }, [currentUser, username])

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

  if (!user) {
    return (
      <SafeAreaView>
        <Text>Loading...</Text>
      </SafeAreaView>
    )
  }

  return (
    <SafeAreaView>
      <Header username={user.username} />
      <UserInfos user={user} />
      <FlashList
        data={['yo', 'yo']}
        ListEmptyComponent={<Text>No posts</Text>}
        ListHeaderComponent={<UserInfos user={user} />}
        renderItem={() => <Text>yo</Text>}
      />
    </SafeAreaView>
  )
}

export default UserProfile

const styles = StyleSheet.create({
  avatarRow: {
    alignItems: 'center',
    flexDirection: 'row',
  },
  avatarWrapper: {
    borderColor: theme.surface.base.secondary,
    borderRadius: theme.radius.full,
    borderWidth: 2,
    height: 34,
    overflow: 'hidden',
    width: 34,
  },
  backButton: {
    left: 10,
    position: 'absolute',
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
    color: theme.text.base.default,
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
  publicationsTitle: {
    marginBottom: theme.spacing['200'],
    marginTop: theme.spacing['600'],
  },
  title: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: theme.spacing['200'],
  },
  userInfos: {
    paddingHorizontal: theme.spacing['400'],
  },
})
