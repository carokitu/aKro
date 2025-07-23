import { useEffect, useMemo, useRef } from 'react'
import { StyleSheet } from 'react-native'

import BottomSheet, { BottomSheetView } from '@gorhom/bottom-sheet'

import { Title } from '../../system'
import { theme } from '../../theme'
import { padding } from '../../theme/spacing'

const INDEX_ON_INIT = 1

export const Drawer = ({
  close,
  minimize,
  setMinimize,
}: {
  close: boolean
  minimize: boolean
  setMinimize: (value: boolean) => void
}) => {
  const snapPoints = useMemo(() => ['10%', '40%', '100%'], [])
  const bottomSheetRef = useRef<BottomSheet>(null)

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

  return (
    <BottomSheet
      backgroundStyle={styles.background}
      enableDynamicSizing={false}
      handleIndicatorStyle={styles.onHandleIndicator}
      index={INDEX_ON_INIT}
      ref={bottomSheetRef}
      snapPoints={snapPoints}
    >
      <BottomSheetView style={styles.bottomSheetContainer}>
        <Title size="large" style={styles.sectionTitle}>
          Faire découvrir un son
        </Title>
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
