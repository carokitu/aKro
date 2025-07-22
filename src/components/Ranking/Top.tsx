import { ChevronRight } from 'lucide-react-native'
import { useEffect, useState } from 'react'
import { StyleSheet, TouchableOpacity, View } from 'react-native'

import { router } from 'expo-router'

import { type Rank } from '../../../models'
import { client } from '../../../supabase'
import { Label, Title } from '../../system'
import { theme } from '../../theme'
import { Item } from './Item'

export const Top = () => {
  const [ranking, setRanking] = useState<Rank[]>([])

  useEffect(() => {
    const fetchRanking = async () => {
      try {
        const { data, error } = await client.rpc('get_user_like_global_ranking', {
          p_limit: 3,
          p_offset: 0,
          p_period: 'week',
        })

        if (error) {
          console.error(error)
        } else {
          setRanking(data)
        }
      } catch (error) {
        console.error(error)
      }
    }

    fetchRanking()
  }, [])

  if (!ranking.length) {
    return null
  }

  return (
    <View>
      <View style={styles.title}>
        <Title size="large">Top contributeurs</Title>
        <TouchableOpacity onPress={() => router.push('/ranking')} style={styles.seeMore}>
          <Label>Tout voir</Label>
          <ChevronRight color={theme.text.base.default} size={18} />
        </TouchableOpacity>
      </View>
      <View style={styles.list}>
        {ranking.map((user) => (
          <Item key={user.user_id} user={user} />
        ))}
      </View>
      <View style={styles.feedTitle}>
        <Title size="large">Feed</Title>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  feedTitle: {
    paddingBottom: theme.spacing[200],
    paddingHorizontal: theme.spacing[400],
    paddingTop: theme.spacing[400],
  },
  list: {
    gap: theme.spacing[200],
    paddingHorizontal: theme.spacing[400],
  },
  seeMore: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: theme.spacing[100],
  },
  title: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: theme.spacing[400],
    paddingVertical: theme.spacing[400],
  },
})
