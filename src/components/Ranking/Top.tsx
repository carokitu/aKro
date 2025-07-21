import { ChevronRight, Crown } from 'lucide-react-native'
import { useEffect, useState } from 'react'
import { Image, Pressable, StyleSheet, View } from 'react-native'

import { router } from 'expo-router'

import { client } from '../../../supabase'
import { Avatar, Label, Text, Title } from '../../system'
import { theme } from '../../theme'

type Rank = {
  avatar_url: string
  rank: number
  total_likes: number
  user_id: string
  username: string
}

const Item = ({ user }: { user: Rank }) => {
  const crownColor = ['#B49247', '#878787', '#A36927']

  return (
    <Pressable
      onPress={() => router.push(`/profile/${user.username}`)}
      style={({ pressed }) => [
        styles.itemContainer,
        { backgroundColor: pressed ? theme.surface.base.secondary : theme.surface.base.default },
      ]}
    >
      <View style={styles.item}>
        <Label style={styles.rank}>{user.rank}</Label>
        <Avatar avatar={user.avatar_url} size="lg" />
        <Label>{user.username}</Label>
        <Crown color={crownColor[user.rank - 1]} size={20} />
      </View>
      <View style={styles.likes}>
        <Text color="secondary">{user.total_likes}</Text>
        <Image
          // eslint-disable-next-line @typescript-eslint/no-require-imports
          source={require('../../../assets/images/icons/heart-filled.png')}
          style={styles.customIcon}
          tintColor={theme.text.base.secondary}
        />
      </View>
    </Pressable>
  )
}

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
        <View style={styles.seeMore}>
          <Label>Tout voir</Label>
          <ChevronRight color={theme.text.base.default} size={18} />
        </View>
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
  customIcon: {
    height: 20,
    width: 20,
  },
  feedTitle: {
    paddingBottom: theme.spacing[200],
    paddingHorizontal: theme.spacing[400],
    paddingTop: theme.spacing[400],
  },
  item: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: theme.spacing[300],
  },
  itemContainer: {
    borderRadius: theme.radius.small,
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: theme.spacing[200],
  },
  likes: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: theme.spacing[100],
  },
  list: {
    gap: theme.spacing[200],
    paddingHorizontal: theme.spacing[400],
  },
  rank: {
    paddingRight: theme.spacing[100],
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
