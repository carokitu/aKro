import { ActivityIndicator, StyleSheet, View } from 'react-native'

import { BottomSheetFlatList } from '@gorhom/bottom-sheet'
import { type SavedTrack } from '@spotify/web-api-ts-sdk'

import { useSavedTracks } from '../../../hooks'
import { Text } from '../../system'
import { Header } from './Header'
import { Track } from './Header/Track'

const ITEMS_PER_PAGE = 50

const LoadingFooter = () => <ActivityIndicator size="large" />

const EmptyComponent = () => (
  <View style={styles.emptyContainer}>
    <Text color="tertiary">Aucune piste disponible</Text>
  </View>
)

export const AllTracks = () => {
  const { loading, loadMore, refresh, refreshing, tracks } = useSavedTracks(ITEMS_PER_PAGE)

  const renderItem = ({ index, item }: { index: number; item: SavedTrack }) => {
    const isFirst = index === 0
    const isLast = index === tracks.length - 1

    return <Track isFirst={isFirst} isLast={isLast} track={item.track} />
  }

  return (
    <BottomSheetFlatList
      data={tracks}
      keyExtractor={(item) => item.track.id}
      ListEmptyComponent={loading ? null : EmptyComponent}
      ListFooterComponent={loading ? <LoadingFooter /> : null}
      ListHeaderComponent={<Header />}
      onEndReached={loadMore}
      onEndReachedThreshold={0.8}
      onRefresh={refresh}
      refreshing={refreshing}
      renderItem={renderItem}
    />
  )
}

const styles = StyleSheet.create({
  emptyContainer: {
    alignItems: 'center',
  },
})
