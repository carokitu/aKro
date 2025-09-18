import { useEffect, useState } from 'react'
import { Image, Pressable, StyleSheet, View } from 'react-native'

import { LinearGradient } from 'expo-linear-gradient'
import { router } from 'expo-router'
import * as Sentry from '@sentry/react-native'

import { type Rank } from '../../../models'
import { client } from '../../../supabase'
import { Avatar, Text, Title } from '../../system'
import { theme } from '../../theme'

const getCrownImage = (rank: number) => {
  switch (rank) {
    case 1:
      // eslint-disable-next-line @typescript-eslint/no-require-imports
      return require('../../../assets/images/icons/crown-gold.png') // Utilisez une image de couronne dorée si disponible
    case 2:
      // eslint-disable-next-line @typescript-eslint/no-require-imports
      return require('../../../assets/images/icons/crown-silver.png') // Utilisez une image de couronne argentée si disponible
    case 3:
      // eslint-disable-next-line @typescript-eslint/no-require-imports
      return require('../../../assets/images/icons/crown-bronze.png') // Utilisez une image de couronne bronze si disponible
    default:
      // eslint-disable-next-line @typescript-eslint/no-require-imports
      return require('../../../assets/images/icons/crown-gold.png')
  }
}

const Item = ({ rank, user }: { rank: number; user: Rank }) => {
  const avatarGradients = [
    // 1ère place - Or
    ['#F3D583', '#EECC7C', '#B39449', '#F3DE8F', '#CDB475', '#9A792E'],
    // 2ème place - Argent
    ['#D9D9D8', '#BEBDBC', '#999998', '#D8D7D6', '#ABABA9', '#9A9A99'],
    // 3ème place - Bronze
    ['#F7CD9F', '#E1B686', '#B98A55', '#F1C79A', '#CD9F6C', '#B38550'],
  ]

  const isFirst = rank === 1

  return (
    <Pressable
      onPress={() => router.push(`/profile/${user.username}`)}
      style={({ pressed }) => [
        styles.itemContainer,
        { backgroundColor: pressed ? theme.surface.base.secondaryPressed : 'transparent' },
      ]}
    >
      <Image
        source={getCrownImage(rank)}
        style={[styles.customIcon, isFirst ? styles.crownLarge : styles.crownSmall]}
      />
      <View style={styles.avatarContainer}>
        <LinearGradient
          colors={avatarGradients[rank - 1] as [string, string, ...string[]]}
          end={{ x: 1, y: 1 }}
          start={{ x: 0, y: 0 }}
          style={styles.gradientBorder}
        >
          <View style={isFirst ? styles.avatarInner : styles.avatarInnerSmall}>
            <Avatar avatar={user.avatar_url} size={isFirst ? 'xl' : 'lg'} />
          </View>
        </LinearGradient>
      </View>
      <Title size={isFirst ? 'large' : 'medium'}>{rank}</Title>
      <View style={styles.userInfo}>
        <Title ellipsizeMode="tail" numberOfLines={1}>
          {user.username}
        </Title>
        <View style={styles.likes}>
          <Text color="secondary">{user.total_likes}</Text>
          <Image
            // eslint-disable-next-line @typescript-eslint/no-require-imports
            source={require('../../../assets/images/icons/heart-filled.png')}
            style={styles.customIcon}
            tintColor={theme.text.base.secondary}
          />
        </View>
      </View>
    </Pressable>
  )
}

export const Podium = ({ period }: { period: 'all' | 'week' }) => {
  const [ranking, setRanking] = useState<Rank[]>([])

  useEffect(() => {
    const fetchRanking = async () => {
      try {
        const { data, error } = await client.rpc('get_user_like_global_ranking', {
          p_limit: 3,
          p_offset: 0,
          p_period: period,
        })

        if (error) {
          Sentry.captureException(error)
        } else {
          setRanking(data)
        }
      } catch (error) {
        Sentry.captureException(error)
      }
    }

    fetchRanking()
  }, [period])

  return (
    <View style={styles.podium}>
      {ranking[1] && <Item rank={2} user={ranking[1]} />}
      {ranking[0] && <Item rank={1} user={ranking[0]} />}
      {ranking[2] && <Item rank={3} user={ranking[2]} />}
    </View>
  )
}

const styles = StyleSheet.create({
  avatarContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarInner: {
    backgroundColor: theme.surface.base.default,
    borderRadius: theme.radius.full,
    margin: 14,
  },
  avatarInnerSmall: {
    backgroundColor: theme.surface.base.default,
    borderRadius: theme.radius.full,
    margin: 10,
  },
  crownLarge: {
    height: 28,
    width: 28,
  },
  crownSmall: {
    height: 20,
    width: 20,
  },
  customIcon: {
    height: 15,
    width: 15,
  },
  gradientBorder: {
    borderRadius: theme.radius.full,
    padding: 2,
  },
  itemContainer: {
    alignItems: 'center',
    alignSelf: 'flex-end',
    borderRadius: theme.radius.small,
    gap: theme.spacing[300],
    justifyContent: 'flex-end',
    maxWidth: '33%',
    padding: theme.spacing[400],
  },
  likes: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: theme.spacing[100],
  },
  podium: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    padding: theme.spacing[400],
  },
  userInfo: {
    alignItems: 'center',
    gap: theme.spacing[100],
  },
})
