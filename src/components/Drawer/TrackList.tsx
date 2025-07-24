import { SearchX } from 'lucide-react-native'
import React, { useRef } from 'react'
import { ActivityIndicator, Keyboard, StyleSheet, Text, View } from 'react-native'

import { FlashList } from '@shopify/flash-list'

import { type DeezerTrack } from '../../../models'
import { Error, Title } from '../../system'
import { theme } from '../../theme'
import { Track } from './Track'

type Props = {
  error: null | string
  fetchMore: () => void
  loading: boolean
  searchQuery: string
  tracks: DeezerTrack[]
}

const EmptyList = () => (
  <View style={styles.emptyList}>
    <SearchX color={theme.text.base.secondary} size={33} style={styles.emptyIcon} />
    <Title color="secondary">Aucun résultat</Title>
    <Text>Essaye avec un autre titre</Text>
  </View>
)

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
        ListEmptyComponent={loading ? <ActivityIndicator size="large" style={styles.loader} /> : <EmptyList />}
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
    minHeight: 200,
  },
  emptyIcon: {
    marginBottom: theme.spacing[200],
  },
  emptyList: {
    alignItems: 'center',
    gap: theme.spacing[200],
    justifyContent: 'center',
    paddingVertical: theme.spacing[400],
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
