import { text } from '../../theme/colors'
import { type TextColor } from './types'

export const colorStyles: Record<TextColor, { color: string }> = {
  danger: {
    color: text.danger.default,
  },
  default: {
    color: text.base.default,
  },
  invert: {
    color: text.base.invert,
  },
  secondary: {
    color: text.base.secondary,
  },
  tertiary: {
    color: text.base.tertiary,
  },
}
