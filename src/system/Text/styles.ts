import { text } from '../../theme/colors'
import { type TextColor } from './types'

export const colorStyles: Record<TextColor, { color: string }> = {
  danger: {
    color: text.danger.default,
  },
  default: {
    color: text.base.default,
  },
  disabled: {
    color: text.disabled,
  },
  informal: {
    color: text.informal.default,
  },
  invert: {
    color: text.base.invert,
  },
  secondary: {
    color: text.base.secondary,
  },
  success: {
    color: text.success.default,
  },
  tertiary: {
    color: text.base.tertiary,
  },
}
