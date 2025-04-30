import { CirclePlus, Heart, UserPlus, VolumeOff } from 'lucide-react-native'
import { useCallback, useEffect, useState } from 'react'
import { Image, StyleSheet, View } from 'react-native'
import { GestureHandlerRootView, ScrollView } from 'react-native-gesture-handler'
import { SafeAreaView } from 'react-native-safe-area-context'

import { FlashList } from '@shopify/flash-list'
import { router } from 'expo-router'

import { useSpotifyApi, useUser } from '../../hooks'
import { type User } from '../../models'
import { Drawer } from '../../src'
import { Avatar, IconButton, Label, Text } from '../../src/system'
import { theme } from '../../src/theme'
import { formatRelativeDate } from '../../src/utils'
import { client } from '../../supabase'

const Header = ({ user }: { user: User }) => (
  <View style={styles.header}>
    <Avatar avatar={user.avatar_url} />
    <IconButton Icon={UserPlus} onPress={() => router.push('/search-users')} size="sm" variant="tertiary" />
  </View>
)

type FeedPost = {
  album_cover_url: string
  artist_name: string
  avatar_url: string
  created_at: string
  description?: string
  id: string
  spotify_track_id: string
  track_name: string
  user_id: string
  username: string
}

const Feed = () => {
  const { loading: spotifyLoading } = useSpotifyApi()
  const { user } = useUser()
  const [closeDrawer, setCloseDrawer] = useState(false)

  const { user: currentUser } = useUser()
  const [posts, setPosts] = useState<FeedPost[]>([])
  const [loading, setLoading] = useState(spotifyLoading)
  const [offset, setOffset] = useState(0)
  const LIMIT = 20

  useEffect(() => {
    setLoading(spotifyLoading)
  }, [spotifyLoading])

  const fetchPosts = useCallback(
    async (reset = false) => {
      if (!currentUser) {
        return
      }

      setLoading(true)

      const { data, error } = await client.rpc('get_user_feed', {
        p_limit: LIMIT,
        p_offset: reset ? 0 : offset,
        p_user_id: currentUser.id,
      })

      if (error) {
        console.error('Error fetching feed:', error)
      } else if (data) {
        setPosts((prev) => (reset ? data : [...prev, ...data]))
        if (!reset) {
          setOffset((prev) => prev + LIMIT)
        }
      }

      setLoading(false)
    },
    [currentUser, offset],
  )

  useEffect(() => {
    fetchPosts(true)
  }, [fetchPosts])

  if (!user) {
    return null
  }

  const renderItem = ({ item }: { item: FeedPost }) => {
    return (
      <View style={styles.post}>
        <View style={styles.user}>
          <Avatar avatar={item.avatar_url} />
          <View style={styles.info}>
            <Label color="invert">{item.username}</Label>
            <Text color="invert">{formatRelativeDate(item.created_at)}</Text>
          </View>
        </View>
        <View style={styles.track}>
          <View>
            <View style={styles.disk} />
            <Image source={{ uri: item.album_cover_url }} style={styles.cover} />
          </View>
          <View style={styles.actions}>
            <IconButton Icon={VolumeOff} size="lg" variant="primary" />
            <IconButton Icon={CirclePlus} size="lg" variant="primary" />
            <IconButton Icon={Heart} size="lg" variant="primary" />
          </View>
        </View>
        <Label color="invert" size="large">
          {item.track_name}
        </Label>
        <Text color="invert">{item.artist_name}</Text>
      </View>
    )
  }

  return (
    <SafeAreaView edges={['top']} style={styles.container}>
      <Header user={user} />
      <GestureHandlerRootView>
        <ScrollView onScrollBeginDrag={() => setCloseDrawer(true)} style={styles.listContainer}>
          <FlashList
            data={posts}
            decelerationRate="fast"
            estimatedItemSize={400}
            keyExtractor={(item) => item.id}
            // ListHeaderComponent={<Header user={user} />}
            onEndReached={() => fetchPosts()}
            onEndReachedThreshold={0.8}
            onScrollBeginDrag={() => setCloseDrawer(true)}
            renderItem={renderItem}
            showsVerticalScrollIndicator={false}
            // snapToAlignment="center"
            // snapToInterval={200}
            // stickyHeaderIndices={[0]}
          />
        </ScrollView>
        <Drawer closeDrawer={closeDrawer} setCloseDrawer={setCloseDrawer} />
      </GestureHandlerRootView>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  actions: {
    flexDirection: 'column',
    gap: theme.spacing[400],
    justifyContent: 'center',
  },
  container: {
    backgroundColor: theme.surface.base.default,
    flex: 1,
  },
  cover: {
    borderRadius: theme.radius.small,
    height: 250,
    left: 0,
    position: 'absolute',
    top: 0,
    width: 250,
  },
  disk: {
    backgroundColor: theme.surface.danger.default,
    borderRadius: theme.radius.full,
    height: 250,
    marginLeft: 40,
    width: 250,
  },
  header: {
    backgroundColor: theme.surface.base.default,
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: theme.spacing[400],
    paddingVertical: theme.spacing[100],
  },
  info: {
    marginLeft: theme.spacing[200],
  },
  listContainer: {
    flex: 1,
  },
  post: {
    backgroundColor: theme.surface.brand.default,
    borderRadius: theme.radius.medium,
    margin: theme.spacing[200],
    paddingHorizontal: theme.spacing[300],
    paddingVertical: theme.spacing[400],
  },
  track: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginVertical: theme.spacing[600],
  },
  user: {
    alignItems: 'center',
    flexDirection: 'row',
  },
})

export default Feed
