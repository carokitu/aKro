import { ChevronLeft } from 'lucide-react-native'
import { useEffect, useState } from 'react'
import { StyleSheet, View } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'

import { router, useLocalSearchParams } from 'expo-router'

import { useUser } from '../../../../hooks'
import { type UserWithStats } from '../../../../models/custom'
import { UserList } from '../../../../src/components/Lists'
import { H1, IconButton } from '../../../../src/system'
import { theme } from '../../../../src/theme'
import { client } from '../../../../supabase'

const Header = ({ nbFollowers }: { nbFollowers: number }) => (
  <View style={styles.title}>
    <IconButton
      Icon={ChevronLeft}
      onPress={() => router.back()}
      size="md"
      style={styles.backButton}
      variant="tertiary"
    />
    <H1>
      {nbFollowers} abonné{nbFollowers > 1 ? 's' : ''}
    </H1>
  </View>
)

const Followers = () => {
  const { username } = useLocalSearchParams()
  const { user: currentUser } = useUser()
  const [nbFollowers, setNbFollowers] = useState(0)
  const [error, setError] = useState<Error | null>(null)
  const [followers, setFollowers] = useState<UserWithStats[]>([])

  useEffect(() => {
    const fetchProfile = async () => {
      const { data, error: fetchError } = await client.rpc('get_user_followers_count', {
        p_username: username,
      })

      if (fetchError) {
        setError(fetchError)
      }

      setNbFollowers(data as number)
    }

    if (username) {
      fetchProfile()
    }
  }, [username])

  console.log('fetchError', error)

  const fetchFollowers = async ({ limit, offset }: { limit: number; offset: number }) => {
    if (!currentUser) {
      return { error: new Error('Current user not found') }
    }

    const { data, error: fetchError } = await client.rpc('get_user_followers_with_stats', {
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
      <Header nbFollowers={nbFollowers} />
      <UserList currentUser={currentUser} fetch={fetchFollowers} loading={false} users={followers} />
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
