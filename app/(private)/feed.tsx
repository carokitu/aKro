import { UserPlus } from 'lucide-react-native'
import { useState } from 'react'
import { ActivityIndicator, FlatList, StyleSheet, View } from 'react-native'
import { GestureHandlerRootView } from 'react-native-gesture-handler'
import { SafeAreaView } from 'react-native-safe-area-context'

import { router } from 'expo-router'

import { useRecentTracks, useSpotifyApi, useUser } from '../../hooks'
import { type User } from '../../models'
import { Drawer } from '../../src'
import { Track } from '../../src/components/Drawer/Header/Track'
import { Avatar, IconButton } from '../../src/system'
import { theme } from '../../src/theme'

const Header = ({ user }: { user: User }) => (
  <View style={styles.header}>
    <Avatar avatar={user.avatar_url} />
    <IconButton Icon={UserPlus} onPress={() => router.push('/search-users')} size="sm" variant="tertiary" />
  </View>
)

const Feed = () => {
  const { loading } = useSpotifyApi()
  const { tracks } = useRecentTracks(50)
  const { user } = useUser()
  const [closeDrawer, setCloseDrawer] = useState(false)

  if (!user) {
    return null
  }

  if (loading) {
    return <ActivityIndicator size="large" />
  }

  return (
    <SafeAreaView edges={['top']} style={styles.container}>
      <GestureHandlerRootView>
        <View style={styles.listContainer}>
          <FlatList
            data={tracks}
            keyExtractor={(item) => `${item.track.id}-${item.played_at}`}
            ListHeaderComponent={<Header user={user} />}
            onScrollBeginDrag={() => setCloseDrawer(true)}
            renderItem={({ item }) => <Track track={item.track} />}
            stickyHeaderIndices={[0]}
          />
        </View>
        <Drawer closeDrawer={closeDrawer} setCloseDrawer={setCloseDrawer} />
      </GestureHandlerRootView>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: theme.surface.base.default,
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
