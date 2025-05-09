import { CirclePlus, Heart, UserPlus, VolumeOff } from 'lucide-react-native'
import { useCallback, useEffect, useState } from 'react'
import { Image, StyleSheet, View } from 'react-native'
import { GestureHandlerRootView } from 'react-native-gesture-handler'
import { SafeAreaView } from 'react-native-safe-area-context'

import { FlashList } from '@shopify/flash-list'
import { router } from 'expo-router'

import { useSpotifyApi, useUser } from '../../hooks'
import { type User } from '../../models'
import { Drawer } from '../../src'
import { Avatar, Button, IconButton, Label, Text } from '../../src/system'
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
  is_liked_by_current_user: boolean
  likes_count: number
  preview_url?: string
  spotify_track_id: string
  track_name: string
  user_id: string
  username: string
}

const Post = ({ item }: { item: FeedPost }) => {
  const { user } = useUser()
  const [isLikedByCurrentUser, setIsLikedByCurrentUser] = useState(item.is_liked_by_current_user)
  const [likesCount, setLikesCount] = useState(item.likes_count)

  if (!user) {
    return null
  }

  const handleLike = async () => {
    if (isLikedByCurrentUser) {
      await client.from('post_likes').delete().eq('post_id', item.id).eq('user_id', user.id)
      setLikesCount(likesCount - 1)
    } else {
      await client.from('post_likes').insert({ post_id: item.id, user_id: user.id })
      setLikesCount(likesCount + 1)
    }

    setIsLikedByCurrentUser(!isLikedByCurrentUser)
  }

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
          <VolumeOff color={theme.surface.base.default} size="30" />
          <CirclePlus color={theme.surface.base.default} size="30" />
          <View style={styles.likes}>
            <Heart
              color={isLikedByCurrentUser ? theme.surface.danger.default : theme.surface.base.default}
              onPress={handleLike}
              size="30"
            />
            <Text color="invert">{likesCount}</Text>
          </View>
        </View>
      </View>
      <View>
        <Label color="invert" size="large">
          {item.track_name}
        </Label>
        <Text color="invert">{item.artist_name}</Text>
      </View>
      <View>
        <Text color="invert">Ecouter sur Spotify</Text>
      </View>
    </View>
  )
}

const Feed = () => {
  const { loading: spotifyLoading } = useSpotifyApi()
  const { user } = useUser()
  const [closeDrawer, setCloseDrawer] = useState(false)
  const [latestPostTimestamp, setLatestPostTimestamp] = useState<null | string>(null)
  const [hasNewPosts, setHasNewPosts] = useState(false)
  const { user: currentUser } = useUser()
  const [posts, setPosts] = useState<FeedPost[]>([])
  const [loading, setLoading] = useState(spotifyLoading)
  const [offset, setOffset] = useState(0)
  const LIMIT = 20

  useEffect(() => {
    if (!latestPostTimestamp || !user) {
      return
    }

    const interval = setInterval(async () => {
      const { data, error } = await client.rpc('get_user_feed', {
        p_limit: 1,
        p_offset: 0,
        p_user_id: user.id,
      })

      if (error) {
        return
      }

      if (data?.[0]?.created_at > latestPostTimestamp) {
        setHasNewPosts(true)
      } else {
        setHasNewPosts(false)
      }
    }, 15_000)

    return () => clearInterval(interval)
  }, [latestPostTimestamp, user])

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
      } else if (data.length > 0) {
        setPosts((prev) => (reset ? data : [...prev, ...data]))

        if (reset) {
          setLatestPostTimestamp(data[0].created_at)
          setHasNewPosts(false)
        } else {
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

  const onViewableItemsChanged = useCallback(
    async ({ viewableItems }: { viewableItems: Array<{ item: FeedPost }> }) => {
      const focusedPost = viewableItems[0]?.item

      if (!focusedPost) {
        return
      }

      console.log('centeredPost', focusedPost)
      // const currentTrack = await spotifyApi.tracks.get(centeredPost.spotify_track_id)
    },
    [],
  )

  // const onViewRef = useRef(async ({ viewableItems }: { viewableItems: Array<{ item: FeedPost }> }) => {
  //   const centeredPost = viewableItems[0]?.item
  //   if (!centeredPost) {
  //     return
  //   }

  //   const currentTrack = await spotifyApi?.tracks.get(centeredPost.spotify_track_id)
  //   console.log('spotifyApi', spotifyLoading, spotifyApi, currentTrack)
  //   console.log('centeredPost', centeredPost.preview_url)
  // })

  // const onViewableItemsChanged = onViewRef.current

  if (!user) {
    return null
  }

  const handleShowNewPosts = () => {
    fetchPosts(true) // reload feed from scratch
    setHasNewPosts(false)
  }

  const renderItem = ({ item }: { item: FeedPost }) => <Post item={item} />

  return (
    <SafeAreaView edges={['top']} style={styles.container}>
      <Header user={user} />
      <GestureHandlerRootView>
        {hasNewPosts && (
          // style a revoir
          <Button
            onPress={handleShowNewPosts}
            style={styles.newPostsButton}
            title="New posts available"
            variant="secondary"
          />
        )}
        <FlashList
          data={posts}
          decelerationRate="fast"
          estimatedItemSize={400}
          keyExtractor={(item) => item.id}
          onEndReached={() => fetchPosts()}
          onEndReachedThreshold={0.8}
          onRefresh={() => fetchPosts(true)}
          onScrollBeginDrag={() => setCloseDrawer(true)}
          onViewableItemsChanged={onViewableItemsChanged}
          // pagingEnabled
          refreshing={loading}
          renderItem={renderItem}
          showsVerticalScrollIndicator={false}
          snapToAlignment="center"
          viewabilityConfig={{ itemVisiblePercentThreshold: 50 }}
        />
        <Drawer closeDrawer={closeDrawer} setCloseDrawer={setCloseDrawer} />
      </GestureHandlerRootView>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  actions: {
    flexDirection: 'column',
    gap: theme.spacing[1200],
    justifyContent: 'space-between',
    paddingRight: theme.spacing[400],
    paddingVertical: theme.spacing[800],
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
  likes: {
    alignItems: 'center',
  },
  newPostsButton: {
    backgroundColor: theme.surface.base.default,
    padding: theme.spacing[400],
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
    marginBottom: theme.spacing[600],
    marginTop: theme.spacing[1000],
  },
  user: {
    alignItems: 'center',
    flexDirection: 'row',
  },
})

export default Feed
