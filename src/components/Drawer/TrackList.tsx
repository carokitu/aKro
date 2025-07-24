import React, { useRef } from 'react'
import { ActivityIndicator, Keyboard, StyleSheet, Text, View } from 'react-native'

import { FlashList } from '@shopify/flash-list'

import { type DeezerTrack } from '../../../models'
import { Error } from '../../system'
import { theme } from '../../theme'
import { Track } from './Track'

type Props = {
  error: null | string
  fetchMore: () => void
  loading: boolean
  searchQuery: string
  tracks: DeezerTrack[]
}

export const TrackList = ({ error, fetchMore, loading, searchQuery, tracks }: Props) => {
  const flashListRef = useRef<FlashList<DeezerTrack>>(null)

  React.useEffect(() => {
    if (searchQuery && flashListRef.current) {
      flashListRef.current.scrollToOffset({ animated: true, offset: 0 })
    }
  }, [searchQuery])

  if (error) {
    return (
      <View style={styles.container}>
        <Error />
      </View>
    )
  }

  return (
    <View style={styles.container}>
      <FlashList
        data={tracks}
        decelerationRate="fast"
        estimatedItemSize={60}
        keyExtractor={(item) => item.id.toString()}
        ListEmptyComponent={
          loading ? (
            <ActivityIndicator size="large" style={styles.loader} />
          ) : (
            <Text style={styles.message}>Aucun résultat</Text>
          )
        }
        onEndReached={fetchMore}
        onEndReachedThreshold={0.5}
        onScrollBeginDrag={() => {
          Keyboard.dismiss()
        }}
        ref={flashListRef}
        renderItem={({ item }) => <Track track={item} />}
        showsVerticalScrollIndicator={false}
      />
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loader: {
    paddingVertical: 24,
  },
  message: {
    color: theme.text.base.secondary,
    paddingVertical: 24,
    textAlign: 'center',
  },
})
