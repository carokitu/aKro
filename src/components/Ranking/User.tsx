import { useEffect, useState } from 'react'
import { StyleSheet } from 'react-native'

import { LinearGradient } from 'expo-linear-gradient'

import { client } from '../../../supabase'
import { Label } from '../../system'
import { theme } from '../../theme'

type Props = {
  isCurrentUser?: boolean
  period?: 'all' | 'week'
  username: string
}

type UserRank = {
  avatar_url: string
  rank_all: number
  rank_week: number
  total_likes_all: number
  total_likes_week: number
  user_id: string
  username: string
}

export const UserRanking = ({ isCurrentUser = false, period = 'week', username }: Props) => {
  const [rank, setRank] = useState<null | UserRank>(null)

  useEffect(() => {
    const getUserRank = async () => {
      const { data, error } = await client.rpc('get_user_like_rank', {
        p_username: username,
      })

      if (!error) {
        setRank(data[0])
      }
    }

    getUserRank()
  }, [username])

  if (!rank) {
    return null
  }

  return (
    <LinearGradient
      colors={['#D0D9EC', '#E6EAF2', '#EDECE7']}
      end={{ x: 1, y: 0 }}
      start={{ x: 0, y: 0 }}
      style={styles.container}
    >
      <Label size="small" style={styles.label}>
        🏆 {isCurrentUser ? 'Ton classement' : 'Classement'} contributeur : #
        {period === 'week' ? rank.rank_week : rank.rank_all}
      </Label>
    </LinearGradient>
  )
}

const styles = StyleSheet.create({
  container: {
    alignSelf: 'flex-start',
    borderRadius: theme.radius.full,
    paddingVertical: theme.spacing['100'],
  },
  label: {
    marginHorizontal: theme.spacing['200'],
  },
})
