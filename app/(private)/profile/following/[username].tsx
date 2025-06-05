import { ChevronLeft } from 'lucide-react-native'
import { useState } from 'react'
import { StyleSheet, View } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'

import { router, useLocalSearchParams } from 'expo-router'

import { useUser } from '../../../../hooks'
import { type UserWithStats } from '../../../../models/custom'
import { UserList } from '../../../../src/components/Lists'
import { H1, IconButton } from '../../../../src/system'
import { theme } from '../../../../src/theme'
import { client } from '../../../../supabase'

const Header = () => (
  <View style={styles.title}>
    <IconButton
      Icon={ChevronLeft}
      onPress={() => router.back()}
      size="md"
      style={styles.backButton}
      variant="tertiary"
    />
    <H1>abonnements</H1>
  </View>
)

const Followers = () => {
  const { username } = useLocalSearchParams()
  const { user: currentUser } = useUser()
  const [followers, setFollowers] = useState<UserWithStats[]>([])

  const fetchUsers = async ({ limit, offset }: { limit: number; offset: number }) => {
    if (!currentUser) {
      return { error: new Error('Current user not found') }
    }

    const { data, error: fetchError } = await client.rpc('get_user_following_with_stats', {
      p_limit: limit,
      p_offset: offset,
      p_username: username,
      p_viewer_id: currentUser.id,
    })

    if (fetchError) {
      return { error: fetchError }
    }

    if (offset === 0) {
      setFollowers(data as UserWithStats[])
    } else {
      setFollowers((prev) => [...prev, ...(data as UserWithStats[])])
    }

    return { error: null }
  }

  if (!currentUser) {
    return null
  }

  return (
    <SafeAreaView style={styles.container}>
      <Header />
      <UserList currentUser={currentUser} fetch={fetchUsers} loading={false} users={followers} />
    </SafeAreaView>
  )
}

export default Followers

const styles = StyleSheet.create({
  backButton: {
    left: 0,
    position: 'absolute',
  },
  container: {
    flex: 1,
    paddingHorizontal: theme.spacing['400'],
  },
  title: {
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: theme.spacing['300'],
    paddingVertical: theme.spacing['200'],
  },
})
