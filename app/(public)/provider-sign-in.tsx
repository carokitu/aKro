/* eslint-disable @typescript-eslint/no-require-imports */
import { Dimensions, Image, StyleSheet, View } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'

import { LinearGradient } from 'expo-linear-gradient'
import { router } from 'expo-router'

import { Button, H1, Title } from '../../src/system'
import { theme } from '../../src/theme'

const { height, width } = Dimensions.get('window')

const Logo = () => (
  <View style={styles.logoContainer}>
    <Image source={require('../../assets/images/logo/white-square.png')} style={styles.logo} />
  </View>
)

const Background = () => (
  <>
    <Image source={require('../../assets/images/welcomeScreen.png')} style={styles.headerBackground} />
    <LinearGradient
      colors={['rgba(13, 26, 38, 0)', 'rgba(0, 255, 102, 0)', 'rgba(48, 155, 255, 0.12)', 'rgba(13, 26, 38, 0.6)']}
      locations={[0, 0.726, 0.8221, 1]}
      style={styles.headerBackground}
    />
  </>
)

const ProviderSignIn = () => {
  return (
    <SafeAreaView style={styles.container}>
      <Background />
      <Logo />
      <Title size='large' style={styles.title}>Bienvenue sur akro</Title>
      <View style={styles.buttonSection}>
        <Button onPress={() => router.push('./sign-in')} size="lg" style={styles.button} title="Démarrer" />
      </View>
    </SafeAreaView>
  )
}

export default ProviderSignIn

const styles = StyleSheet.create({
  button: {
    alignSelf: 'center',
    width: '100%',
  },
  buttonSection: {
    gap: theme.spacing[300],
    marginHorizontal: theme.spacing[600],
    paddingBottom: 20,
  },
  container: {
    flex: 1,
    justifyContent: 'space-between',
  },
  headerBackground: {
    height: height * 0.65,
    left: -180,
    position: 'absolute',
    top: -10,
    width: width * 2,
    zIndex: -1,
  },
  logo: {
    borderRadius: theme.radius.large,
    boxShadow: '0px 4px 14px rgba(109, 104, 91, 0.25)',
    height: 160,
    resizeMode: 'contain',
    width: 160,
  },
  logoContainer: {
    alignItems: 'center',
    height: height * 0.66,
    justifyContent: 'flex-end',
  },
  title: {
    alignSelf: 'center',
    marginBottom: theme.spacing[300],
  },
})
