import { StyleSheet, View } from 'react-native'

import { useCurrentTrack } from '../../../../hooks'
import { padding, spacing } from '../../../theme/spacing'
import { Track } from './Track'

export const CurrentTrack = () => {
  const { currentTrack } = useCurrentTrack()

  if (!currentTrack) {
    return null
  }

  return (
    <View style={styles.section}>
      <Track {...currentTrack} />
    </View>
  )
}

const styles = StyleSheet.create({
  section: {
    marginBottom: spacing['50'],
  },
})
