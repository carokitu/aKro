import { Text as RNText, StyleSheet, type TextProps } from 'react-native'

import { theme } from '../../theme'
import { colorStyles } from './styles'
import { type TextColor } from './types'

type Props = TextProps & {
  color?: TextColor
  size?: 'extraSmall' | 'large' | 'medium' | 'small'
}

export const Text = ({ children, color = 'default', size = 'medium', style, ...props }: Props) => {
  const textStyles = [
    colorStyles[color],
    styles.text,
    size === 'extraSmall' && styles.extraSmall,
    size === 'large' && styles.large,
    size === 'medium' && styles.medium,
    size === 'small' && styles.small,
    style,
  ]

  return (
    <RNText style={textStyles} {...props}>
      {children}
    </RNText>
  )
}

const styles = StyleSheet.create({
  extraSmall: {
    fontSize: theme.fontSize['xs'],
    lineHeight: theme.lineHeight['xs'],
  },
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
    fontWeight: theme.weight.regular,
  },
})
