import { useCallback, useRef } from 'react'
import { ScrollView, StyleSheet, Text } from 'react-native'
import { GestureHandlerRootView } from 'react-native-gesture-handler'

import BottomSheet, { BottomSheetView } from '@gorhom/bottom-sheet'

import { CurrentTrack } from './CurrentTrack'
import { RecentTracks } from './RecentTracks'

export const Drawer = () => {
  // ref
  const bottomSheetRef = useRef<BottomSheet>(null)

  // callbacks
  const handleSheetChanges = useCallback((index: number) => {
    console.log('handleSheetChanges', index)
  }, [])

  // renders
  return (
    <GestureHandlerRootView style={styles.container}>
      <BottomSheet
        enableDynamicSizing={false}
        enablePanDownToClose={false}
        index={1}
        onChange={handleSheetChanges}
        ref={bottomSheetRef}
        snapPoints={['10%', '40%', '95%']}
      >
        <BottomSheetView style={styles.bottomSheetContainer}>
          <Text style={styles.sectionTitle}>Partager un son</Text>
          <ScrollView>
            <CurrentTrack />
            <RecentTracks />
          </ScrollView>
        </BottomSheetView>
      </BottomSheet>
    </GestureHandlerRootView>
  )
}

const styles = StyleSheet.create({
  bottomSheetContainer: {
    flex: 1,
  },
  container: {
    flex: 1,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 10,
    marginLeft: 10,
  },
})
