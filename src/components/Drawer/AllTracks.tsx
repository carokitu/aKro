import { useCallback, useEffect, useState } from 'react'
import { ActivityIndicator, FlatList } from 'react-native'

import { type SavedTrack } from '@spotify/web-api-ts-sdk'

import { useSavedTracks } from '../../../hooks'
import { Header } from './Header'
import { Track } from './Header/Track'

const ITEMS_PER_PAGE = 50

const LoadingFooter = () => <ActivityIndicator size="small" />

export const AllTracks = () => {
  const [offset, setOffset] = useState(0)
  const { fetchSavedTracks, loading, refreshSavedTracks, tracks: fetchedTracks } = useSavedTracks(ITEMS_PER_PAGE)
  const [allTracks, setAllTracks] = useState<SavedTrack[]>([])
  const [refreshing, setRefreshing] = useState(false)

  const onRefresh = useCallback(async () => {
    setRefreshing(true)

    setAllTracks([])
    setOffset(0)

    await refreshSavedTracks()

    setRefreshing(false)
  }, [refreshSavedTracks])

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

  const renderItem = ({ item }: { item: SavedTrack }) => <Track {...item.track} />

  return (
    <FlatList
      data={allTracks}
      keyExtractor={(item) => item.track.id}
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
