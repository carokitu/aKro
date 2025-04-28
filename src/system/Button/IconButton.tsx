import { type LucideIcon } from 'lucide-react-native'
import React, { useState } from 'react'
import { Pressable, type PressableProps, type StyleProp, StyleSheet, type ViewStyle } from 'react-native'

import { theme } from '../../theme'

type IconButtonProps = PressableProps & {
  disabled?: boolean
  Icon: LucideIcon
  size?: 'lg' | 'md' | 'sm'
  style?: StyleProp<ViewStyle>
  variant?: 'primary' | 'secondary' | 'tertiary'
}

const VARIANT_STYLES = {
  primary: {
    container: { backgroundColor: theme.surface.brand.default },
    disabled: { backgroundColor: theme.surface.disabled },
    icon: { color: theme.text.brand.invert },
    pressed: { backgroundColor: theme.surface.brand.defaultPressed },
  },
  secondary: {
    container: { backgroundColor: theme.surface.base.secondary },
    disabled: { backgroundColor: theme.surface.disabled },
    icon: { color: theme.text.brand.default },
    pressed: { backgroundColor: theme.surface.base.secondaryPressed },
  },
  tertiary: {
    container: { backgroundColor: theme.surface.transparent },
    disabled: { backgroundColor: theme.surface.transparent },
    icon: { color: theme.text.base.default },
    pressed: { backgroundColor: theme.surface.disabled },
  },
}

const SIZE_STYLES: Record<string, StyleProp<ViewStyle>> = {
  lg: {
    borderRadius: theme.radius.base,
    height: theme.spacing[1200],
    width: theme.spacing[1200],
  },
  md: {
    borderRadius: theme.radius.base,
    height: theme.spacing[1000],
    width: theme.spacing[1000],
  },
  sm: {
    borderRadius: theme.radius.full,
    height: theme.fontSize['4xl'],
    width: theme.fontSize['4xl'],
  },
}

export const IconButton = ({ disabled, Icon, size = 'md', style, variant = 'primary', ...props }: IconButtonProps) => {
  const [isPressed, setIsPressed] = useState(false)

  const variantStyles = VARIANT_STYLES[variant]
  const sizeStyles = SIZE_STYLES[size]

  const isPressedStyle = isPressed ? variantStyles.pressed : variantStyles.container
  const backgroundStyle = disabled ? variantStyles.disabled : isPressedStyle
  const color = disabled ? theme.text.disabled : variantStyles.icon.color

  return (
    <Pressable
      disabled={disabled}
      onPressIn={() => setIsPressed(true)}
      onPressOut={() => setIsPressed(false)}
      style={[styles.base, sizeStyles, backgroundStyle, style]}
      {...props}
    >
      <Icon color={color} style={styles.icon} />
    </Pressable>
  )
}

const styles = StyleSheet.create({
  base: {
    alignItems: 'center',
    gap: theme.padding['200'],
    justifyContent: 'center',
  },
  icon: {
    height: theme.fontSize.xl,
    resizeMode: 'contain',
    width: theme.fontSize.xl,
  },
})
