import React from 'react'
import { ActivityIndicator, FlatList, Image, Text, View } from 'react-native'

import { useSpotifyApi } from '../hooks'

const RecentTracks = () => {
  const { loading, tracks } = useSpotifyApi()

  if (loading) {
    return <ActivityIndicator size="large" />
  }

  return (
    <View>
      <Text style={{ fontSize: 20, fontWeight: 'bold' }}>Recently Played Tracks</Text>
      <FlatList
        data={tracks}
        keyExtractor={(item) => item.track.id}
        renderItem={({ item }) => (
          <View style={{ alignItems: 'center', flexDirection: 'row', marginBottom: 10 }}>
            <Image
              source={{ uri: item.track.album.images[0].url }}
              style={{ borderRadius: 5, height: 50, marginRight: 10, width: 50 }}
            />
            <View>
              <Text style={{ fontWeight: 'bold' }}>{item.track.name}</Text>
              <Text>{item.track.artists.map((artist) => artist.name).join(', ')}</Text>
            </View>
          </View>
        )}
      />
    </View>
  )
}

export default RecentTracks
