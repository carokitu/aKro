import { StyleSheet, type TextProps, TouchableOpacity } from 'react-native'

import { theme } from '../../theme'
import { colorStyles } from './styles'
import { Text } from './Text'
import { type TextColor } from './types'

type Props = TextProps & {
  color?: TextColor
  size?: 'large' | 'medium' | 'small'
}

export const Label = ({ children, color = 'default', onPress, size = 'medium', style, ...props }: Props) => {
  const labelStyles = [
    colorStyles[color],
    style,
    size === 'large' && styles.large,
    size === 'medium' && styles.medium,
    size === 'small' && styles.small,
  ]

  if (onPress) {
    return (
      <TouchableOpacity activeOpacity={0.5} onPress={onPress}>
        <Text {...props} style={labelStyles} weight="bold">
          {children}
        </Text>
      </TouchableOpacity>
    )
  }

  return (
    <Text {...props} style={labelStyles} weight="bold">
      {children}
    </Text>
  )
}

const styles = StyleSheet.create({
  large: {
    fontSize: theme.fontSize['lg'],
    lineHeight: theme.lineHeight['lg'],
  },
  medium: {
    fontSize: theme.fontSize['md'],
    lineHeight: theme.lineHeight['md'],
  },
  small: {
    fontSize: theme.fontSize['sm'],
    lineHeight: theme.lineHeight['sm'],
  },
})
