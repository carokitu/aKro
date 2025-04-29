import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { StyleSheet } from 'react-native'

import BottomSheet, { BottomSheetView } from '@gorhom/bottom-sheet'

import { useSavedTracks } from '../../../hooks'
import { Title } from '../../system'
import { theme } from '../../theme'
import { padding } from '../../theme/spacing'
import { AllTracks } from './AllTracks'

const INDEX_ON_INIT = 1

export const Drawer = ({
  closeDrawer,
  setCloseDrawer,
}: {
  closeDrawer: boolean
  setCloseDrawer: (value: boolean) => void
}) => {
  const [currentSnapIndex, setCurrentSnapIndex] = useState(INDEX_ON_INIT)
  const snapPoints = useMemo(() => ['10%', '40%', '100%'], [])
  const bottomSheetRef = useRef<BottomSheet>(null)
  const { refresh } = useSavedTracks()

  const handleChange = useCallback(
    (index: number) => {
      console.log('moooving', currentSnapIndex, index)
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
        <AllTracks />
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
