import { ChevronLeft, type LucideIcon } from 'lucide-react-native'
import { StyleSheet, View } from 'react-native'

import { router } from 'expo-router'

import { IconButton, Title } from '../system'
import { theme } from '../theme'

type RightIconProps = {
  handlePress: () => void
  Icon: LucideIcon
}

export const NavBar = ({ rightIcon, title }: { rightIcon?: RightIconProps; title?: string }) => (
  <View style={styles.title}>
    <IconButton Icon={ChevronLeft} onPress={() => router.back()} size="md" variant="tertiary" />
    {title && <Title size="large">{title}</Title>}
    {rightIcon ? (
      <IconButton Icon={rightIcon.Icon} onPress={rightIcon.handlePress} size="md" variant="tertiary" />
    ) : (
      <View style={styles.emptyView} />
    )}
  </View>
)

const styles = StyleSheet.create({
  emptyView: {
    width: theme.spacing['1000'],
  },
  title: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: theme.spacing['400'],
    paddingVertical: theme.spacing['200'],
    width: '100%',
  },
})
