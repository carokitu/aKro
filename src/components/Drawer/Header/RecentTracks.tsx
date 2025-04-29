import { History } from 'lucide-react-native'
import { StyleSheet, View } from 'react-native'

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
      <View style={styles.sectionTitle}>
        <History color={theme.text.base.tertiary} size={theme.fontSize.xl} style={styles.icon} />
        <Label color="tertiary" size="large">
          ÉCOUTÉS RÉCEMMENT
        </Label>
      </View>
      {tracks.map((item, index) => {
        const isFirst = index === 0
        const isLast = index === tracks.length - 1

        return <Track isFirst={isFirst} isLast={isLast} key={`${item.track.id}-${item.played_at}`} track={item.track} />
      })}
    </>
  )
}

const styles = StyleSheet.create({
  icon: {
    paddingRight: theme.spacing[200],
  },
  sectionTitle: {
    flexDirection: 'row',
    gap: theme.spacing[100],
    marginBottom: theme.padding['400'],
    marginLeft: theme.padding['400'],
    marginTop: theme.padding['600'],
    verticalAlign: 'middle',
  },
})
