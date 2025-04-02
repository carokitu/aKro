import { StyleSheet, Text } from 'react-native'

import { CurrentTrack } from './CurrentTrack'
import { RecentTracks } from './RecentTracks'

export const Header = () => {
  return (
    <>
      <CurrentTrack />
      <RecentTracks />
      <Text style={styles.sectionTitle}>Titres likés</Text>
    </>
  )
}

const styles = StyleSheet.create({
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 10,
    marginLeft: 10,
  },
})
