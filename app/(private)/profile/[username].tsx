import { ChevronLeft } from 'lucide-react-native'
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

const UserInfos = ({ user }: { user: EnhancedUser }) => {
  const { user: currentUser } = useUser()

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
        otherUser={user.id}
        size="md"
        style={styles.followButton}
        withIcon
      />
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

      const { data, error } = await client.rpc('get_user_profile', {
        p_username: username,
        p_viewer_id: currentUser.id,
      })
      console.log(error, data?.user)

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
  backButton: {
    left: 0,
    position: 'absolute',
  },
  followButton: {
    marginVertical: theme.spacing['400'],
    width: '100%',
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
  title: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: theme.spacing['200'],
  },
  userInfos: {
    paddingHorizontal: theme.spacing['400'],
  },
})
