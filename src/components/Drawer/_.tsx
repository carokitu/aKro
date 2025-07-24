import { useEffect, useMemo, useRef, useState } from 'react'
import { Keyboard, KeyboardAvoidingView, Platform, StyleSheet } from 'react-native'

import BottomSheet, { BottomSheetView } from '@gorhom/bottom-sheet'

import { useDeezerSearch } from '../../../hooks/useDeezerSearch'
import { Title } from '../../system'
import { theme } from '../../theme'
import { colors } from '../../theme/colors'
import { padding } from '../../theme/spacing'
import { SearchInput } from './SearchInput'
import { TrackList } from './TrackList'

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
  const [query, setQuery] = useState('')
  const { error, fetchMore, loading, tracks } = useDeezerSearch(query)
  const snapPoints = useMemo(() => ['10%', '40%', '95%'], [])
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

  // Listen for keyboard events to expand drawer when keyboard opens
  useEffect(() => {
    const keyboardDidShowListener = Keyboard.addListener('keyboardDidShow', () => {
      bottomSheetRef.current?.snapToIndex(2)
    })

    return () => {
      keyboardDidShowListener?.remove()
    }
  }, [])

  return (
    <BottomSheet
      backgroundStyle={styles.background}
      enableDynamicSizing={false}
      handleIndicatorStyle={styles.onHandleIndicator}
      index={INDEX_ON_INIT}
      onAnimate={(toIndex) => {
        if (toIndex !== 2 && toIndex !== -1) {
          Keyboard.dismiss()
        }
      }}
      onChange={(index) => {
        if (index !== 2) {
          Keyboard.dismiss()
        }
      }}
      ref={bottomSheetRef}
      snapPoints={snapPoints}
      style={styles.container}
    >
      <KeyboardAvoidingView
        behavior="padding"
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 0}
        style={styles.bottomSheetView}
      >
        <BottomSheetView style={styles.bottomSheetView}>
          <Title size="large" style={styles.sectionTitle}>
            Faire découvrir un son
          </Title>
          <SearchInput bottomSheetRef={bottomSheetRef} query={query} setQuery={setQuery} />
          <TrackList error={error} fetchMore={fetchMore} loading={loading} searchQuery={query} tracks={tracks} />
        </BottomSheetView>
      </KeyboardAvoidingView>
    </BottomSheet>
  )
}

const styles = StyleSheet.create({
  background: {
    backgroundColor: theme.surface.base.default,
    borderColor: theme.border.base.default,
    borderRadius: theme.radius.large,
    borderWidth: 1,
    elevation: 10,
    shadowColor: colors.neutral[500],
    shadowOffset: {
      height: -1,
      width: 0,
    },
    shadowOpacity: 0.3,
    shadowRadius: 27,
  },
  bottomSheetView: {
    flex: 1,
  },
  container: {
    flex: 1,
    paddingHorizontal: padding['400'],
    width: 'auto',
  },
  onHandleIndicator: {
    backgroundColor: theme.surface.base.secondaryPressed,
    height: 7,
    marginTop: theme.spacing['200'],
    width: 40,
  },
  sectionTitle: {
    marginBottom: padding['400'],
  },
})
