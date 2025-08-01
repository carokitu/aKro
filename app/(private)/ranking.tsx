import { useActionSheet } from '@expo/react-native-action-sheet'
import { CalendarRange } from 'lucide-react-native'
import { useCallback, useEffect, useState } from 'react'
import { StyleSheet, View } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'

import { FlashList } from '@shopify/flash-list'
import { LinearGradient } from 'expo-linear-gradient'

import { useUser } from '../../hooks'
import { type Rank } from '../../models'
import { NavBar } from '../../src'
import { Podium, RankingItem, UserRanking } from '../../src/components'
import { Button } from '../../src/system'
import { theme } from '../../src/theme'
import { client } from '../../supabase'
import { mergeUnique } from '../../src/utils'

const LIMIT = 30

const List = () => {
  const { user } = useUser()
  const [users, setUsers] = useState<Rank[]>([])
  const [offset, setOffset] = useState(0)
  const [period, setPeriod] = useState<'all' | 'week'>('week')
  const { showActionSheetWithOptions } = useActionSheet()

  const handlePeriodPress = () => {
    showActionSheetWithOptions(
      {
        message: 'Choisi entre voir le score sur les 7 derniers jours ou depuis toujours',
        options: ['Classement 7 derniers jours', 'Classement depuis toujours'],
        title: 'Temporalité du classement',
      },
      (index) => {
        if (index === 0) {
          setPeriod('week')
        } else {
          setPeriod('all')
        }
      },
    )
  }

  const fetchUsers = useCallback(
    async (reset = false) => {
      try {
        const { data, error } = await client.rpc('get_user_like_global_ranking', {
          p_limit: LIMIT,
          p_offset: reset ? 0 : offset,
          p_period: period,
        })

        if (error) {
          console.error(error)
        } else {
          setUsers(reset ? data : mergeUnique(users, data, 'user_id'))
          setOffset(reset ? 0 : offset + LIMIT)
        }
      } catch (error) {
        console.error(error)
      }
    },
    [offset, period, users],
  )

  useEffect(() => {
    fetchUsers(true)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [period])

  if (!user) {
    return null
  }

  return (
    <FlashList
      data={users}
      decelerationRate="fast"
      estimatedItemSize={50}
      keyExtractor={(item) => item.user_id}
      ListHeaderComponent={
        <View style={styles.container}>
          <Button
            afterElement={<CalendarRange color={theme.text.base.invert} size={16} />}
            onPress={handlePeriodPress}
            size="sm"
            style={styles.button}
            title={period === 'week' ? '7 derniers jours' : 'depuis toujours'}
          />
          <Podium period={period} />
          <View style={styles.list}>
            <UserRanking isCurrentUser period={period} style={styles.userRanking} username={user.username} />
          </View>
        </View>
      }
      onEndReached={() => fetchUsers()}
      renderItem={({ index, item }) => {
        const isCurrentUser = item.user_id === user.id
        if (index < 3) {
          return null
        }

        return <RankingItem isCurrentUser={isCurrentUser} style={styles.item} user={item} />
      }}
      showsVerticalScrollIndicator={false}
    />
  )
}

const Ranking = () => (
  <LinearGradient
    colors={['#D0D9EC', '#E6EAF2', '#EDECE7', '#FBFAF4']}
    locations={[0, 0.2, 0.8, 0.9]}
    style={styles.container}
  >
    <SafeAreaView edges={['top']} style={styles.container}>
      <NavBar title="Top contributeurs" />
      <List />
    </SafeAreaView>
  </LinearGradient>
)

const styles = StyleSheet.create({
  button: { alignSelf: 'center', marginTop: theme.spacing[200] },
  container: {
    flex: 1,
  },
  item: {
    paddingHorizontal: theme.spacing[400],
  },
  list: {
    backgroundColor: theme.surface.base.default,
    borderTopLeftRadius: theme.radius.medium,
    borderTopRightRadius: theme.radius.medium,
  },
  userRanking: {
    padding: theme.spacing[400],
  },
})

export default Ranking
