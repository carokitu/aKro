import { SearchX } from 'lucide-react-native'
import React from 'react'
import { ActivityIndicator, Keyboard, StyleSheet, Text, View } from 'react-native'

import { BottomSheetFlashList } from '@gorhom/bottom-sheet'

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

  if (error) {
    return (
      <View style={styles.errorContainer}>
        <Error />
      </View>
    )
  }

  return (
      <BottomSheetFlashList<DeezerTrack>
        data={tracks}
        estimatedItemSize={60}
        keyExtractor={(item) => item.id.toString()}
        ListEmptyComponent={loading ? <ActivityIndicator size="large" style={styles.loader} /> : <EmptyList />}
        ListFooterComponent={<View style={styles.last} />}
        keyboardShouldPersistTaps="handled"
        onEndReached={fetchMore}
        onEndReachedThreshold={0.5}
        onScrollBeginDrag={() => {
          Keyboard.dismiss()
        }}
        renderItem={({ item }) => <Track track={item} />}
        showsVerticalScrollIndicator={false}
      />
  )
}

const styles = StyleSheet.create({
  errorContainer: {
    flex: 1,
    minHeight: 200,
  },
  container: {
    flex: 1,
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
  list: {
    flex: 1,
  },
  last: {
    paddingVertical: theme.spacing[400],
  },
})
