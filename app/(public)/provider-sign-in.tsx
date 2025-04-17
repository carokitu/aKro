/* eslint-disable @typescript-eslint/no-require-imports */
import { Image, SafeAreaView, StyleSheet, View } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'

import { useSpotifyAuth } from '../../hooks'
import { Button, Label } from '../../src/system'
import { theme } from '../../src/theme'

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

const ProviderSignIn = () => {
  const insets = useSafeAreaInsets()
  const { login } = useSpotifyAuth()

  return (
    <SafeAreaView style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.logoContainer}>
        <Image source={require('../../assets/images/logo/inline-dark.png')} style={styles.logo} />
        <Label color="secondary" size="large">
          Réoffrir la musique
        </Label>
      </View>
      <View style={styles.buttonSection}>
        <Button
          iconPath={require('../../assets/images/icons/spotify.png')}
          onPress={login}
          size="lg"
          style={styles.button}
          title="Se connecter a Spotify"
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
    marginTop: 40,
    padding: 20,
  },
  logo: {
    height: 100,
    resizeMode: 'contain',
    width: 200,
  },
  logoContainer: {
    alignItems: 'center',
    flex: 1,
    justifyContent: 'center',
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
})
