import { StyleSheet } from 'react-native'

import { Label } from '../../../system'
import { theme } from '../../../theme'
import { CurrentTrack } from './CurrentTrack'
import { RecentTracks } from './RecentTracks'

export const Header = () => {
  return (
    <>
      <CurrentTrack />
      <RecentTracks />
      <Label color="tertiary" style={styles.sectionTitle} size="large">
        Titres likés
      </Label>
    </>
  )
}

const styles = StyleSheet.create({
  sectionTitle: {
    marginBottom: theme.padding['400'],
    marginLeft: theme.padding['400'],
  },
})
