import { type StyleProp, StyleSheet, View, type ViewStyle } from 'react-native'

import { theme } from '../../theme'

export const Container = ({ children, style }: { children: React.ReactNode; style?: StyleProp<ViewStyle> }) => {
  return <View style={[styles.container, style]}>{children}</View>
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: theme.surface.brand.default,
    borderRadius: theme.radius.medium,
    padding: theme.spacing[400],
  },
})
