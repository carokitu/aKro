import { UserPlus } from 'lucide-react-native'
import { ActivityIndicator, FlatList, StyleSheet, View } from 'react-native'
import { GestureHandlerRootView } from 'react-native-gesture-handler'
import { SafeAreaView } from 'react-native-safe-area-context'

import { useRecentTracks, useSpotifyApi, useUser } from '../../hooks'
import { Drawer } from '../../src'
import { Track } from '../../src/components/Drawer/Header/Track'
import { Avatar, IconButton } from '../../src/system'
import { theme } from '../../src/theme'

const Header = () => {
  const { user } = useUser()

  if (!user) {
    return null
  }

  return (
    <View style={styles.header}>
      <Avatar avatar={user?.avatar_url} />
      <IconButton Icon={UserPlus} size="sm" variant="tertiary" />
    </View>
  )
}

const Feed = () => {
  const { loading } = useSpotifyApi()
  const { tracks } = useRecentTracks(50)

  if (loading) {
    return <ActivityIndicator size="large" />
  }

  return (
    <SafeAreaView edges={['top']} style={styles.container}>
      <GestureHandlerRootView>
        <View style={styles.listContainer}>
          <FlatList
            data={tracks}
            keyExtractor={(item) => item.track.id}
            ListHeaderComponent={<Header />}
            renderItem={({ item }) => <Track {...item.track} />}
            stickyHeaderIndices={[0]}
          />
        </View>
        <Drawer />
      </GestureHandlerRootView>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    backgroundColor: theme.surface.base.default,
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: theme.spacing[400],
    paddingVertical: theme.spacing[100],
  },
  listContainer: {
    flex: 1,
  },
})

export default Feed
