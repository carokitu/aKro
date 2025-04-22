import { User } from 'lucide-react-native'
import { Image, type StyleProp, StyleSheet, View, type ViewStyle } from 'react-native'

import { theme } from '../theme'

type Props = {
  avatar?: null | string
  style?: StyleProp<ViewStyle>
}

export const Avatar = ({ avatar, style }: Props) => {
  if (!avatar) {
    return (
      <View style={[styles.iconContainer, style]}>
        <User color={theme.colors.neutral['50']} style={styles.icon} />
      </View>
    )
  }

  return (
    <View style={style}>
      <Image source={{ uri: avatar }} style={styles.avatar} />
    </View>
  )
}

const styles = StyleSheet.create({
  avatar: {
    borderRadius: theme.radius.full,
    height: theme.fontSize['4xl'],
    width: theme.fontSize['4xl'],
  },
  icon: {
    height: theme.fontSize.xl,
    width: theme.fontSize.xl,
  },
  iconContainer: {
    alignItems: 'center',
    backgroundColor: theme.colors.neutral['500'],
    borderRadius: theme.radius.full,
    height: theme.fontSize['4xl'],
    justifyContent: 'center',
    width: theme.fontSize['4xl'],
  },
})
