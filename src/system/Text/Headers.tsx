import { StyleSheet, Text, type TextProps } from 'react-native'

import { theme } from '../../theme'
import { colorStyles } from './styles'
import { type TextColor } from './types'

type Props = TextProps & {
  color?: TextColor
  level: 1 | 2 | 3
}

const Heading = ({ children, color = 'default', level, style, ...props }: Props) => {
  const headingStyles = [
    styles.text,
    level === 1 && styles.h1,
    level === 2 && styles.h2,
    level === 3 && styles.h3,
    style,
    colorStyles[color],
  ]

  return (
    <Text {...props} style={headingStyles}>
      {children}
    </Text>
  )
}

export const H1 = (props: TextProps) => <Heading level={1} {...props} />
export const H2 = (props: TextProps) => <Heading level={2} {...props} />
export const H3 = (props: TextProps) => <Heading level={3} {...props} />

const styles = StyleSheet.create({
  h1: {
    fontSize: theme.fontSize['4xl'],
    lineHeight: theme.lineHeight['4xl'],
  },
  h2: {
    fontSize: theme.fontSize['3xl'],
    lineHeight: theme.lineHeight['3xl'],
  },
  h3: {
    fontSize: theme.fontSize['2xl'],
    lineHeight: theme.lineHeight['2xl'],
  },
  text: {
    fontFamily: theme.fontFamily.title,
    fontWeight: theme.weight.bold,
  },
})
