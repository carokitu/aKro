import { type LucideIcon } from 'lucide-react-native'
import { StyleSheet, TouchableOpacity } from 'react-native'

import { Label } from '../../../system'
import { theme } from '../../../theme'

export type ToastProps = {
  Icon?: LucideIcon
  message: string
  onPress: () => void
  variant?: 'default' | 'error' | 'success'
}

export const Toast = ({ Icon, message, onPress, variant = 'default' }: ToastProps) => {
  const textColor = variant === 'default' ? 'default' : 'invert'

  return (
    <TouchableOpacity
      activeOpacity={0.8}
      onPress={onPress}
      style={[
        styles.toast,
        variant === 'default' && styles.default,
        variant === 'error' && styles.error,
        variant === 'success' && styles.success,
      ]}
    >
      {Icon && <Icon color={theme.text.base[textColor]} size={15} style={styles.icon} />}
      <Label color={textColor}>{message}</Label>
    </TouchableOpacity>
  )
}

const styles = StyleSheet.create({
  default: {
    backgroundColor: theme.surface.base.secondary,
  },
  error: {
    backgroundColor: theme.surface.danger.default,
  },
  icon: {
    alignSelf: 'center',
  },
  success: {
    backgroundColor: theme.surface.success.default,
  },
  toast: {
    alignSelf: 'center',
    borderRadius: theme.radius.full,
    boxShadow: '0px 0px 8px 0px rgba(109, 104, 91, 0.5)',
    display: 'flex',
    flexDirection: 'row',
    gap: theme.padding['200'],
    paddingHorizontal: theme.padding['400'],
    paddingVertical: theme.padding['200'],
    position: 'absolute',
    top: 55,
  },
})
