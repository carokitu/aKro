import { StyleSheet, Text, type TextProps } from 'react-native'

import { theme } from '../../theme'
import { colorStyles } from './styles'
import { type TextColor } from './types'

type Props = TextProps & {
  color?: TextColor
  size?: 'large' | 'medium' | 'small'
}

export const Label = ({ children, color = 'default', size = 'medium', style, ...props }: Props) => {
  const labelStyles = [
    colorStyles[color],
    style,
    styles.text,
    size === 'large' && styles.large,
    size === 'medium' && styles.medium,
    size === 'small' && styles.small,
  ]

  return (
    <Text {...props} style={labelStyles}>
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
  text: {
    fontFamily: theme.fontFamily.body,
    fontWeight: theme.weight.medium,
  },
})
