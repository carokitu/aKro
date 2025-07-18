import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { ActivityIndicator, StyleSheet } from 'react-native'

import BottomSheet, { BottomSheetFlatList, BottomSheetView } from '@gorhom/bottom-sheet'
import { type SavedTrack } from '@spotify/web-api-ts-sdk'

import { useMute, useSavedTracks } from '../../../hooks'
import { Error, Title } from '../../system'
import { theme } from '../../theme'
import { padding } from '../../theme/spacing'
import { Header } from './Header'
import { Track } from './Track'

const INDEX_ON_INIT = 1
const ITEMS_PER_PAGE = 50

const LoadingFooter = () => <ActivityIndicator size="large" style={styles.loader} />

export const Drawer = ({
  close,
  minimize,
  setMinimize,
}: {
  close: boolean
  minimize: boolean
  setMinimize: (value: boolean) => void
}) => {
  const { setTemporaryMute } = useMute()
  const [currentSnapIndex, setCurrentSnapIndex] = useState(INDEX_ON_INIT)
  const { loading, loadMore, refresh, refreshing, tracks } = useSavedTracks(ITEMS_PER_PAGE)
  const snapPoints = useMemo(() => ['10%', '40%', '100%'], [])
  const bottomSheetRef = useRef<BottomSheet>(null)

  const handleChange = useCallback(
    (index: number) => {
      if (currentSnapIndex === 0 && index > 0) {
        refresh()
      }

      if (index === 2) {
        setTemporaryMute(true)
      } else {
        setTemporaryMute(false)
      }

      setCurrentSnapIndex(index)
    },
    [currentSnapIndex, refresh, setTemporaryMute],
  )

  useEffect(() => {
    if (close) {
      bottomSheetRef.current?.close()
    } else {
      bottomSheetRef.current?.snapToIndex(0)
    }
  }, [close])

  useEffect(() => {
    if (minimize) {
      bottomSheetRef.current?.snapToIndex(0)
      setMinimize(false)
    }
  }, [minimize, setMinimize])

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
          keyExtractor={(item, index) => `${item.track.id}-${index}`}
          ListEmptyComponent={loading ? null : Error}
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
  loader: {
    marginVertical: padding['400'],
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
