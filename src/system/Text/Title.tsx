import { StyleSheet, Text, type TextProps } from 'react-native'

import { theme } from '../../theme'
import { colorStyles } from './styles'
import { type TextColor } from './types'

type Props = TextProps & {
  color?: TextColor
  variant?: 'large' | 'medium' | 'small'
}

export const Title = ({ children, color = 'default', style, variant = 'medium', ...props }: Props) => {
  const titleStyles = [
    colorStyles[color],
    style,
    styles.text,
    variant === 'large' && styles.large,
    variant === 'medium' && styles.medium,
    variant === 'small' && styles.small,
  ]

  return (
    <Text {...props} style={titleStyles}>
      {children}
    </Text>
  )
}

const styles = StyleSheet.create({
  large: {
    fontSize: theme.fontSize['xl'],
    lineHeight: theme.lineHeight['xl'],
  },
  medium: {
    fontSize: theme.fontSize['lg'],
    lineHeight: theme.lineHeight['lg'],
  },
  small: {
    fontSize: theme.fontSize['md'],
    lineHeight: theme.lineHeight['md'],
  },
  text: {
    fontFamily: theme.fontFamily.title,
    fontWeight: theme.weight.bold,
  },
})
