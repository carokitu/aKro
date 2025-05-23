import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { ActivityIndicator, StyleSheet, View } from 'react-native'

import BottomSheet, { BottomSheetFlatList, BottomSheetView } from '@gorhom/bottom-sheet'
import { type SavedTrack } from '@spotify/web-api-ts-sdk'

import { useSavedTracks } from '../../../hooks'
import { Text, Title } from '../../system'
import { theme } from '../../theme'
import { padding } from '../../theme/spacing'
import { Header } from './Header'
import { Track } from './Track'

const INDEX_ON_INIT = 1
const ITEMS_PER_PAGE = 50

const LoadingFooter = () => <ActivityIndicator size="large" />

const EmptyComponent = () => (
  <View style={styles.emptyContainer}>
    <Text color="tertiary">Aucune piste disponible</Text>
  </View>
)

export const Drawer = ({
  closeDrawer,
  setCloseDrawer,
}: {
  closeDrawer: boolean
  setCloseDrawer: (value: boolean) => void
}) => {
  const [currentSnapIndex, setCurrentSnapIndex] = useState(INDEX_ON_INIT)
  const { loading, loadMore, refresh, refreshing, tracks } = useSavedTracks(ITEMS_PER_PAGE)
  const snapPoints = useMemo(() => ['10%', '40%', '100%'], [])
  const bottomSheetRef = useRef<BottomSheet>(null)

  const handleChange = useCallback(
    (index: number) => {
      if (currentSnapIndex === 0 && index > 0) {
        refresh()
      }

      setCurrentSnapIndex(index)
    },
    [currentSnapIndex, refresh],
  )

  useEffect(() => {
    if (closeDrawer) {
      bottomSheetRef.current?.snapToIndex(0)
      setCloseDrawer(false)
    }
  }, [closeDrawer, setCloseDrawer])

  const renderItem = ({ index, item }: { index: number; item: SavedTrack }) => {
    const isFirst = index === 0
    const isLast = index === tracks.length - 1

    return <Track isFirst={isFirst} isLast={isLast} track={item.track} />
  }

  return (
    <BottomSheet
      backgroundStyle={styles.background}
      enableDynamicSizing={false}
      handleIndicatorStyle={styles.onHandleIndicator}
      index={INDEX_ON_INIT}
      onChange={handleChange}
      ref={bottomSheetRef}
      snapPoints={snapPoints}
    >
      <BottomSheetView style={styles.bottomSheetContainer}>
        <Title size="large" style={styles.sectionTitle}>
          Faire découvrir un son
        </Title>
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
      </BottomSheetView>
    </BottomSheet>
  )
}

const styles = StyleSheet.create({
  background: {
    backgroundColor: theme.surface.base.secondary,
    borderRadius: theme.radius.large,
  },
  bottomSheetContainer: {
    flex: 1,
  },
  emptyContainer: {
    alignItems: 'center',
  },
  onHandleIndicator: {
    backgroundColor: theme.surface.base.secondaryPressed,
    height: 7,
    width: 40,
  },
  sectionTitle: {
    marginBottom: padding['400'],
    marginLeft: padding['400'],
  },
})
