import { useCallback, useEffect, useState } from 'react'
import { ActivityIndicator, FlatList, StyleSheet, Text, View } from 'react-native'

import { type SavedTrack } from '@spotify/web-api-ts-sdk'

import { useSavedTracks } from '../../../hooks'
import { Header } from './Header'
import { Track } from './Header/Track'

const ITEMS_PER_PAGE = 50

const LoadingFooter = () => <ActivityIndicator size="small" />

const EmptyComponent = () => (
  <View style={styles.emptyContainer}>
    <Text>Aucune piste disponible</Text>
  </View>
)

export const AllTracks = () => {
  const [offset, setOffset] = useState(0)
  const { fetchSavedTracks, loading, tracks: fetchedTracks } = useSavedTracks(ITEMS_PER_PAGE)
  const [allTracks, setAllTracks] = useState<SavedTrack[]>([])
  const [refreshing, setRefreshing] = useState(false)

  useEffect(() => {
    if (fetchedTracks.length > 0) {
      setAllTracks((prev) => [...prev, ...fetchedTracks])
    }
  }, [fetchedTracks])

  useEffect(() => {
    const fetch = async () => await fetchSavedTracks(ITEMS_PER_PAGE, 0)

    fetch()
  }, [fetchSavedTracks])

  const onRefresh = useCallback(async () => {
    setRefreshing(true)

    setAllTracks([])
    setOffset(0)

    await fetchSavedTracks()

    setRefreshing(false)
  }, [fetchSavedTracks])

  const handleLoadMore = async () => {
    const nextOffset = offset + ITEMS_PER_PAGE
    setOffset(nextOffset)
    await fetchSavedTracks(ITEMS_PER_PAGE, nextOffset)
  }

  const renderItem = ({ index, item }: { index: number; item: SavedTrack }) => {
    const isFirst = index === 0
    const isLast = index === allTracks.length - 1

    return <Track isFirst={isFirst} isLast={isLast} track={item.track} />
  }

  return (
    <FlatList
      data={allTracks}
      keyExtractor={() => Math.random().toString()}
      ListEmptyComponent={EmptyComponent}
      ListFooterComponent={loading ? <LoadingFooter /> : null}
      ListHeaderComponent={<Header />}
      onEndReached={handleLoadMore}
      onEndReachedThreshold={0.5}
      onRefresh={onRefresh}
      refreshing={refreshing}
      renderItem={renderItem}
    />
  )
}

const styles = StyleSheet.create({
  emptyContainer: {
    alignItems: 'center',
    padding: 20,
  },
})
