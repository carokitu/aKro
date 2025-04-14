import { SafeAreaView, StyleSheet } from 'react-native'

import { Text } from '../../../src/system'
import { theme } from '../../../src/theme'

const Name = () => {
  return (
    <SafeAreaView style={styles.container}>
      <Text>Create User</Text>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    flex: 1,
    justifyContent: 'center',
    marginHorizontal: theme.spacing['400'],
  },
})

export default Name
