import { StyleSheet, TouchableOpacity, View } from 'react-native'

import { router } from 'expo-router'

import { Avatar, Label, Text } from '../../../system'
import { theme } from '../../../theme'
import { formatRelativeDate } from '../../../utils'
import { type EnhancedFeedPost } from './types'

export const Header = ({ item }: { item: EnhancedFeedPost }) => {
  return (
    <TouchableOpacity activeOpacity={0.6} onPress={() => router.push(`/profile/${item.username}`)} style={styles.user}>
      <Avatar avatar={item.avatar_url} />
      <View style={styles.info}>
        <Label color="invert">{item.username}</Label>
        <Text color="invert">{formatRelativeDate(item.created_at)}</Text>
      </View>
    </TouchableOpacity>
  )
}

const styles = StyleSheet.create({
  info: {
    marginLeft: theme.spacing[200],
  },
  user: {
    alignItems: 'center',
    flexDirection: 'row',
    marginBottom: theme.spacing[1000],
  },
})
