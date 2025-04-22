import { useMemo, useRef } from 'react'
import { StyleSheet } from 'react-native'
import { GestureHandlerRootView } from 'react-native-gesture-handler'

import BottomSheet, { BottomSheetView } from '@gorhom/bottom-sheet'

import { Title } from '../../system'
import { padding } from '../../theme/spacing'
import { AllTracks } from './AllTracks'

export const Drawer = () => {
  const snapPoints = useMemo(() => ['10%', '40%', '100%'], [])
  const bottomSheetRef = useRef<BottomSheet>(null)

  return (
    <GestureHandlerRootView style={styles.container}>
      <BottomSheet
        backgroundStyle={styles.background}
        enableDynamicSizing={false}
        handleIndicatorStyle={styles.onHandleIndicator}
        index={1}
        ref={bottomSheetRef}
        snapPoints={snapPoints}
      >
        <BottomSheetView style={styles.bottomSheetContainer}>
          <Title style={styles.sectionTitle} size="large">
            Faire découvrir un son
          </Title>
          <AllTracks />
        </BottomSheetView>
      </BottomSheet>
    </GestureHandlerRootView>
  )
}

const styles = StyleSheet.create({
  // eslint-disable-next-line react-native/no-color-literals
  background: {
    backgroundColor: '#EDECE7',
    borderRadius: '6%',
  },
  bottomSheetContainer: {
    flex: 1,
  },
  container: {
    flex: 1,
  },
  // eslint-disable-next-line react-native/no-color-literals
  onHandleIndicator: {
    backgroundColor: '#DEDED8',
    height: 7,
    width: 40,
  },
  sectionTitle: {
    marginBottom: padding['400'],
    marginLeft: padding['400'],
  },
})
