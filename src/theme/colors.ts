export const colors = {
  blue: {
    '50': '#E9E8FF',
    '800': '#0006DB',
  },
  brand: {
    '50': '#E5EAF4',
    '100': '#C2CDD9',
    '600': '#3F576F',
    '700': '#30455A',
    '900': '#0D1A26',
  },
  green: {
    '50': '#E6F4E9',
    '800': '#197C2E',
  },
  neutral: {
    '50': '#FBFAF4',
    '200': '#EDECE7',
    '300': '#DEDED8',
    '500': '#9C9B96',
  },
  red: {
    '50': '#FFEBEF',
    '800': '#CB2B2B',
  },
  yellow: {
    '50': '#FFFDE8',
    '800': '#F6A731',
  },
} as const

export const surface = {
  base: {
    default: colors.neutral[50],
    defaultPressed: colors.neutral[200],
    secondary: colors.neutral[200],
    secondaryPressed: colors.neutral[300],
  },
  brand: {
    default: colors.brand[900],
    defaultPressed: colors.brand[700],
    secondary: colors.brand[50],
    secondaryPressed: colors.brand[100],
  },
  danger: {
    default: colors.red[800],
    secondary: colors.red[50],
  },
  disabled: colors.neutral[200],
  informal: {
    default: colors.blue[800],
    secondary: colors.blue[50],
  },
  success: {
    default: colors.green[800],
    secondary: colors.green[50],
  },
  transparent: 'transparent',
  warning: {
    default: colors.yellow[800],
    secondary: colors.yellow[50],
  },
}

export const text = {
  base: {
    default: colors.brand[900],
    invert: colors.neutral[50],
    secondary: colors.brand[600],
    tertiary: colors.neutral[500],
  },
  brand: {
    default: colors.brand[900],
    invert: colors.brand[50],
    secondary: colors.brand[700],
  },
  danger: {
    default: colors.red[800],
    secondary: colors.red[50],
  },
  disabled: colors.neutral[500],
  informal: {
    default: colors.blue[800],
    secondary: colors.blue[50],
  },
  success: {
    default: colors.green[800],
    secondary: colors.green[50],
  },
  warning: {
    default: colors.yellow[800],
    secondary: colors.yellow[50],
  },
}

export const icon = text

export const border = {
  base: {
    default: colors.neutral[300],
    invert: colors.neutral[50],
    neutral: colors.neutral[500],
  },
  brand: {
    default: colors.brand[900],
    invert: colors.brand[50],
    neutral: colors.brand[700],
  },
  danger: {
    default: colors.red[800],
    secondary: colors.red[50],
  },
  disabled: colors.neutral[500],
  informal: {
    default: colors.blue[800],
    secondary: colors.blue[50],
  },
  success: {
    default: colors.green[800],
    secondary: colors.green[50],
  },
  warning: {
    default: colors.yellow[800],
    secondary: colors.yellow[50],
  },
}
