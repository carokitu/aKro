import { Image, StyleSheet, Text, View } from 'react-native'

import { useRecentTracks } from '../../../hooks'

export const RecentTracks = () => {
  const { tracks } = useRecentTracks(5)

  if (!tracks) {
    return null
  }

  return (
    <>
      <Text style={styles.sectionTitle}>Écoutés récemment</Text>
      {tracks.map((item) => (
        <View key={`${item.track.id}-${item.played_at}`} style={styles.trackContainer}>
          <Image source={{ uri: item.track.album.images[0].url }} style={styles.albumCover} />
          <View>
            <Text style={styles.trackName}>{item.track.name}</Text>
            <Text>{item.track.artists.map((artist) => artist.name).join(', ')}</Text>
          </View>
        </View>
      ))}
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
