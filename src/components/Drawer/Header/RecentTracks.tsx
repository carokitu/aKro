import { StyleSheet } from 'react-native'

import { useRecentTracks } from '../../../../hooks'
import { Label } from '../../../system'
import { theme } from '../../../theme'
import { Track } from './Track'

export const RecentTracks = () => {
  const { tracks } = useRecentTracks(5)

  if (!tracks) {
    return null
  }

  return (
    <>
      <Label color="tertiary" style={styles.sectionTitle} variant="large">
        Écoutés récemment
      </Label>
      {tracks.map((item) => (
        <Track key={item.track.id} {...item.track} />
      ))}
    </>
  )
}

const styles = StyleSheet.create({
  sectionTitle: {
    marginBottom: theme.padding['400'],
    marginLeft: theme.padding['400'],
  },
})
