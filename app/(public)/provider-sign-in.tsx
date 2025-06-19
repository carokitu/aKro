/* eslint-disable @typescript-eslint/no-require-imports */
import { Dimensions, Image, StyleSheet, View } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'

import { LinearGradient } from 'expo-linear-gradient'

import { useSpotifyAuth } from '../../hooks'
import { Button, H1, Label } from '../../src/system'
import { theme } from '../../src/theme'

const { height, width } = Dimensions.get('window')

const disabledProviders = [
  {
    icon: require('../../assets/images/icons/deezer-disabled.png'),
    title: 'Se connecter à Deezer',
  },
  {
    icon: require('../../assets/images/icons/apple-disabled.png'),
    title: 'Se connecter à Apple Music',
  },
  {
    icon: require('../../assets/images/icons/youtube-disabled.png'),
    title: 'Se connecter à YouTube Music',
  },
]

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
      style={styles.gradient}
    />
  </>
)

const ProviderSignIn = () => {
  const { login } = useSpotifyAuth()

  return (
    <SafeAreaView style={styles.container}>
      <Background />
      <Logo />
      <H1 style={styles.title}>Bienvenue sur akro</H1>
      <View style={styles.buttonSection}>
        <Button
          iconPath={require('../../assets/images/icons/spotify.png')}
          onPress={login}
          size="lg"
          style={styles.button}
          title="Se connecter à Spotify"
        />
        <View style={styles.separator}>
          <View style={styles.separatorLine} />
          <Label color="tertiary" size="small" style={styles.separatorLabel}>
            Prochainement
          </Label>
          <View style={styles.separatorLine} />
        </View>
        {disabledProviders.map((provider) => (
          <Button
            disabled
            iconPath={provider.icon}
            key={provider.title}
            size="lg"
            style={styles.button}
            title={provider.title}
          />
        ))}
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
  gradient: {
    height: height * 0.46,
    left: -180,
    position: 'absolute',
    top: -10,
    width: width * 2,
    zIndex: 1,
  },
  headerBackground: {
    height: height * 0.46,
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
    zIndex: 2,
  },
  logoContainer: {
    alignItems: 'center',
    height: height * 0.45,
    justifyContent: 'flex-end',
  },
  separator: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
  },
  separatorLabel: {
    textAlign: 'center',
    width: 100,
  },
  separatorLine: {
    backgroundColor: theme.border.base.default,
    flex: 1,
    height: 1,
  },
  title: {
    alignSelf: 'center',
    marginBottom: theme.spacing[300],
  },
})
