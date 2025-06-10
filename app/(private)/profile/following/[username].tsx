import { useState } from 'react'
import { StyleSheet, View } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'

import { useLocalSearchParams } from 'expo-router'

import { useUser } from '../../../../hooks'
import { type UserWithStats } from '../../../../models/custom'
import { NavBar } from '../../../../src/components'
import { UserList } from '../../../../src/components/Lists'
import { theme } from '../../../../src/theme'
import { client } from '../../../../supabase'

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
      <NavBar title="abonnements" />
      <View style={styles.list}>
        <UserList currentUser={currentUser} fetch={fetchUsers} loading={false} users={followers} />
      </View>
    </SafeAreaView>
  )
}

export default Followers

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  list: {
    flex: 1,
    paddingHorizontal: theme.spacing['400'],
  },
})
