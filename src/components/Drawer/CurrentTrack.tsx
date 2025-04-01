import { Image, StyleSheet, Text, View } from 'react-native'

import { useCurrentTrack } from '../../../hooks'

export const CurrentTrack = () => {
  const { currentTrack } = useCurrentTrack()

  if (!currentTrack) {
    return null
  }

  return (
    <>
      <Text style={styles.sectionTitle}>Écoute en cours</Text>
      <View style={styles.section}>
        <View style={styles.trackContainer}>
          <Image source={{ uri: currentTrack.album.images[0].url }} style={styles.albumCover} />
          <View>
            <Text style={styles.trackName}>{currentTrack.name}</Text>
            <Text>{currentTrack.artists.map((artist) => artist.name).join(', ')}</Text>
          </View>
        </View>
      </View>
    </>
  )
}

const styles = StyleSheet.create({
  albumCover: {
    borderRadius: 5,
    height: 50,
    marginRight: 10,
    width: 50,
  },
  section: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 10,
    marginLeft: 10,
  },
  trackContainer: {
    alignItems: 'center',
    flexDirection: 'row',
    marginBottom: 10,
    marginLeft: 10,
  },
  trackName: {
    fontWeight: 'bold',
  },
})
