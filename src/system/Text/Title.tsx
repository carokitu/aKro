import { StyleSheet, type TextProps } from 'react-native'

import { theme } from '../../theme'
import { colorStyles } from './styles'
import { Text } from './Text'
import { type TextColor } from './types'

type Props = TextProps & {
  color?: TextColor
  size?: 'large' | 'medium' | 'small'
}

export const Title = ({ children, color = 'default', size = 'medium', style, ...props }: Props) => {
  const titleStyles = [
    colorStyles[color],
    style,
    styles.text,
    size === 'large' && styles.large,
    size === 'medium' && styles.medium,
    size === 'small' && styles.small,
  ]

  return (
    <Text {...props} style={titleStyles} weight="bold">
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
  text: {},
})
