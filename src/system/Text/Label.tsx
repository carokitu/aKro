import { StyleSheet, Text, type TextProps } from 'react-native'

import { theme } from '../../theme'
import { colorStyles } from './styles'
import { type TextColor } from './types'

type Props = TextProps & {
  color?: TextColor
  variant?: 'large' | 'medium' | 'small'
}

export const Label = ({ children, color = 'default', style, variant = 'medium', ...props }: Props) => {
  const labelStyles = [
    styles.text,
    variant === 'large' && styles.large,
    variant === 'medium' && styles.medium,
    variant === 'small' && styles.small,
    colorStyles[color],
    style,
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
