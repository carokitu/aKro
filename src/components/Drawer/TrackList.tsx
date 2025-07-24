import { ActivityIndicator, StyleSheet, Text, View } from 'react-native'

import { FlashList } from '@shopify/flash-list'

import { type DeezerTrack } from '../../../models'
import { Error } from '../../system'
import { theme } from '../../theme'
import { Track } from './Track'

type Props = {
  error: null | string
  loading: boolean
  tracks: DeezerTrack[]
}

export const TrackList = ({ error, loading, tracks }: Props) => {
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
        estimatedItemSize={60}
        keyExtractor={(item) => item.id.toString()}
        ListEmptyComponent={
          loading ? (
            <ActivityIndicator size="large" style={styles.loader} />
          ) : (
            <Text style={styles.message}>Aucun résultat</Text>
          )
        }
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
  loader: {
    paddingVertical: 24,
  },
  message: {
    color: theme.text.base.secondary,
    paddingVertical: 24,
    textAlign: 'center',
  },
})
