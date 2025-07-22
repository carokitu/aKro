import React, { useState } from 'react'
import {
  Image,
  type ImageSourcePropType,
  Pressable,
  type PressableProps,
  SafeAreaView,
  type StyleProp,
  StyleSheet,
  View,
  type ViewStyle,
} from 'react-native'

import { theme } from '../../theme'
import { Label } from '../Text'

type ButtonProps = PressableProps & {
  afterElement?: React.ReactNode
  beforeElement?: React.ReactNode
  disabled?: boolean
  fullWidth?: boolean
  iconPath?: ImageSourcePropType
  size?: 'lg' | 'md' | 'sm'
  style?: StyleProp<ViewStyle>
  title: string
  variant?: 'primary' | 'secondary' | 'tertiary'
}

const VARIANT_STYLES = {
  primary: {
    container: { backgroundColor: theme.surface.brand.default },
    disabled: { backgroundColor: theme.surface.disabled },
    label: { color: theme.text.brand.invert },
    pressed: { backgroundColor: theme.surface.brand.defaultPressed },
  },
  secondary: {
    container: { backgroundColor: theme.surface.base.secondary },
    disabled: { backgroundColor: theme.surface.disabled },
    label: { color: theme.text.brand.default },
    pressed: { backgroundColor: theme.surface.base.secondaryPressed },
  },
  tertiary: {
    container: { backgroundColor: theme.surface.transparent },
    disabled: { backgroundColor: theme.surface.transparent },
    label: { color: theme.text.base.default },
    pressed: { backgroundColor: theme.surface.disabled },
  },
}

const SIZE_STYLES = {
  lg: {
    paddingHorizontal: theme.padding['600'],
    paddingVertical: theme.padding['400'],
  },
  md: {
    paddingHorizontal: theme.padding['600'],
    paddingVertical: theme.padding['300'],
  },
  sm: {
    paddingHorizontal: theme.padding['400'],
    paddingVertical: theme.padding['200'],
  },
}

export const Button = ({
  afterElement,
  beforeElement,
  disabled,
  fullWidth = false,
  iconPath,
  size = 'md',
  style,
  title,
  variant = 'primary',
  ...props
}: ButtonProps) => {
  const [isPressed, setIsPressed] = useState(false)

  const variantStyles = VARIANT_STYLES[variant]
  const sizeStyles = SIZE_STYLES[size]

  const isPressedStyle = isPressed ? variantStyles.pressed : variantStyles.container
  const backgroundStyle = disabled ? variantStyles.disabled : isPressedStyle

  return (
    <SafeAreaView>
      <Pressable
        disabled={disabled}
        onPressIn={() => setIsPressed(true)}
        onPressOut={() => setIsPressed(false)}
        style={[styles.base, sizeStyles, backgroundStyle, fullWidth && styles.fullWidth, style]}
        {...props}
      >
        <View style={styles.content}>
          {beforeElement}
          {iconPath && <Image source={iconPath} style={styles.icon} />}
          <Label style={[styles.label, variantStyles.label, disabled && styles.disabledLabel]}>{title}</Label>
          {afterElement}
        </View>
      </Pressable>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  base: {
    alignSelf: 'flex-start',
    borderRadius: theme.radius.base,
    justifyContent: 'center',
  },
  content: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: theme.padding['200'],
    justifyContent: 'center',
  },
  disabledLabel: {
    color: theme.text.disabled,
  },
  fullWidth: {
    width: '100%',
  },
  icon: {
    height: theme.fontSize.xl,
    marginRight: theme.padding['200'],
    resizeMode: 'contain',
    width: theme.fontSize.xl,
  },
  label: {
    color: theme.text.base.default,
  },
})
