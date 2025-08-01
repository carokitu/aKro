/* eslint-disable @typescript-eslint/no-require-imports */
import { Image, StyleSheet } from 'react-native'

import { SafeAreaView } from 'react-native-safe-area-context'

export const SplashScreen = () => {
  return (
    <SafeAreaView style={styles.container}>
      <Image source={require('../../assets/images/logo/icon.png')} style={styles.logo} />
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    flex: 1,
    justifyContent: 'center',
  },
  logo: {
    height: 100,
    resizeMode: 'contain',
    width: 120,
  },
})
