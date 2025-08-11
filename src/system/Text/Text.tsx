import { Platform, Text as RNText, StyleSheet, type TextProps } from 'react-native'

import { theme } from '../../theme'
import { colorStyles } from './styles'
import { type TextColor } from './types'

type Props = TextProps & {
  color?: TextColor
  size?: 'extraSmall' | 'large' | 'medium' | 'small'
  weight?: 'bold' | 'regular'
}

export const Text = ({ children, color = 'default', size = 'medium', style, weight = 'regular', ...props }: Props) => {
  const textStyles = [
    colorStyles[color],
    styles.text,
    size === 'extraSmall' && styles.extraSmall,
    size === 'large' && styles.large,
    size === 'medium' && styles.medium,
    size === 'small' && styles.small,
    weight === 'bold' && styles.bold,
    style,
  ]

  return (
    <RNText style={textStyles} {...props}>
      {children}
    </RNText>
  )
}

const styles = StyleSheet.create({
  bold: {
    ...Platform.select({
      android: {
        fontFamily: theme.fontFamily.bold,
        fontWeight: 'normal',
      },
      ios: {
        fontFamily: theme.fontFamily.body,
        fontWeight: theme.weight.bold,
      },
    }),
  },
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
    ...Platform.select({
      android: {
        fontFamily: theme.fontFamily.body,
      },
      ios: {
        fontFamily: theme.fontFamily.body,
        fontWeight: theme.weight.regular,
      },
    }),
  },
})
