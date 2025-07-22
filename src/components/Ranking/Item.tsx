import { Crown } from 'lucide-react-native'
import { Image, Pressable, StyleSheet, View } from 'react-native'

import { router } from 'expo-router'

import { type Rank } from '../../../models'
import { Avatar, Label, Text } from '../../system'
import { theme } from '../../theme'

export const Item = ({ user }: { user: Rank }) => {
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
        {user.rank < 4 && <Crown color={crownColor[user.rank - 1]} size={20} />}
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

const styles = StyleSheet.create({
  customIcon: {
    height: 20,
    width: 20,
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
  rank: {
    paddingRight: theme.spacing[100],
  },
})
