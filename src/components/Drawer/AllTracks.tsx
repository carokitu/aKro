import { useEffect, useState } from 'react'
import { ActivityIndicator, FlatList, Image, StyleSheet, Text, View } from 'react-native'

import { type SavedTrack } from '@spotify/web-api-ts-sdk'

import { useSavedTracks } from '../../../hooks'
import { Header } from './Header'

const ITEMS_PER_PAGE = 50

const LoadingFooter = () => <ActivityIndicator size="small" />

export const AllTracks = () => {
  const [offset, setOffset] = useState(0)
  const { fetchSavedTracks, loading, tracks: fetchedTracks } = useSavedTracks(ITEMS_PER_PAGE)
  const [allTracks, setAllTracks] = useState<SavedTrack[]>([])

  useEffect(() => {
    if (fetchedTracks) {
      setAllTracks((prev) => [...prev, ...fetchedTracks])
    }
  }, [fetchedTracks])

  const handleLoadMore = () => {
    if (!loading && fetchedTracks?.length) {
      const nextOffset = offset + ITEMS_PER_PAGE
      setOffset(nextOffset)
      fetchSavedTracks(ITEMS_PER_PAGE, nextOffset)
    }
  }

  if (!fetchedTracks) {
    return null
  }

  const renderItem = ({ item }: { item: SavedTrack }) => (
    <View style={styles.trackContainer}>
      <Image source={{ uri: item.track.album.images[0].url }} style={styles.albumCover} />
      <View>
        <Text style={styles.trackName}>{item.track.name}</Text>
        <Text>{item.track.artists.map((artist) => artist.name).join(', ')}</Text>
      </View>
    </View>
  )

  return (
    <FlatList
      data={allTracks}
      keyExtractor={(item) => item.track.id}
      ListFooterComponent={loading ? <LoadingFooter /> : null}
      ListHeaderComponent={<Header />}
      onEndReached={handleLoadMore}
      onEndReachedThreshold={0.5}
      renderItem={renderItem}
    />
  )
}

const styles = StyleSheet.create({
  albumCover: {
    borderRadius: 5,
    height: 50,
    marginRight: 10,
    width: 50,
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
