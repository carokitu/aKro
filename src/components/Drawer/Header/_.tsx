import { Heart } from 'lucide-react-native'
import { StyleSheet, View } from 'react-native'

import { Label } from '../../../system'
import { theme } from '../../../theme'
import { CurrentTrack } from './CurrentTrack'
import { RecentTracks } from './RecentTracks'

export const Header = () => (
  <>
    <CurrentTrack />
    <RecentTracks />
    <View style={styles.sectionTitle}>
      <Heart color={theme.text.base.tertiary} size={theme.fontSize.xl} style={styles.icon} />
      <Label color="tertiary" size="large">
        TITRES LIKÉS
      </Label>
    </View>
  </>
)

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
