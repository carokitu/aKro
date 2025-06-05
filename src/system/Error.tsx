/* eslint-disable @typescript-eslint/no-require-imports */
import { Image, StyleSheet, View } from 'react-native'

import { theme } from '../theme'
import { Text, Title } from './Text'

export const Error = () => (
  <View style={styles.container}>
    <Image source={require('../../assets/images/logo/error-logo.png')} style={styles.logo} />
    <Title size="large">La chanson s'est arrêtée...</Title>
    <Text style={styles.text}>Impossible de charger le contenu. Veuillez réessayer dans quelques instants.</Text>
  </View>
)

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    flex: 1,
    gap: theme.spacing[200],
    justifyContent: 'center',
    paddingHorizontal: theme.padding[400],
  },
  logo: {
    height: 100,
    marginBottom: theme.spacing[200],
    resizeMode: 'contain',
    width: 100,
  },
  text: {
    textAlign: 'center',
  },
})
