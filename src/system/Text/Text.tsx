import { Text as RNText, StyleSheet, type TextProps } from 'react-native'

import { theme } from '../../theme'
import { colorStyles } from './styles'
import { type TextColor } from './types'

type Props = TextProps & {
  color?: TextColor
  variant?: 'extraSmall' | 'large' | 'medium' | 'small'
}

export const Text = ({ children, color = 'default', variant = 'medium', ...props }: Props) => {
  const textStyles = [
    styles.text,
    variant === 'extraSmall' && styles.extraSmall,
    variant === 'large' && styles.large,
    variant === 'medium' && styles.medium,
    variant === 'small' && styles.small,
    colorStyles[color],
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
