import { StyleSheet, View } from 'react-native'

import { useCurrentTrack } from '../../../../hooks'
import { theme } from '../../../theme'
import { Track } from '../Track'

export const CurrentTrack = () => {
  const { currentTrack } = useCurrentTrack()

  if (!currentTrack) {
    return null
  }

  return (
    <View style={styles.currentTrack}>
      <Track isFirst isLast track={currentTrack} />
    </View>
  )
}

const styles = StyleSheet.create({
  currentTrack: {
    marginBottom: theme.spacing['600'],
  },
})
