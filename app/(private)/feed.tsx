/* eslint-disable @typescript-eslint/no-explicit-any */
import { CircleCheck, CirclePlus, Heart, UserPlus, VolumeOff } from 'lucide-react-native'
import { useCallback, useEffect, useRef, useState } from 'react'
import { StyleSheet, TouchableOpacity, View } from 'react-native'
import { GestureHandlerRootView } from 'react-native-gesture-handler'
import { SafeAreaView } from 'react-native-safe-area-context'

import { FlashList } from '@shopify/flash-list'
import { router } from 'expo-router'

import { useFeed, useSpotifyApi, useUser } from '../../hooks'
import { type Post as TPost, type User } from '../../models'
import { Drawer } from '../../src'
import { Post } from '../../src/components'
import { Avatar, Button, IconButton, Label, Text } from '../../src/system'
import { theme } from '../../src/theme'
import { formatRelativeDate } from '../../src/utils'
import { client } from '../../supabase'

type EnhancedFeedPost = TPost & {
  isOnSpotifyLibrary: boolean
}

const PostHeader = ({ item }: { item: EnhancedFeedPost }) => (
  <TouchableOpacity activeOpacity={0.6} onPress={() => router.push(`/profile/${item.username}`)} style={styles.user}>
    <Avatar avatar={item.avatar_url} />
    <View style={styles.info}>
      <Label color="invert">{item.username}</Label>
      <Text color="invert">{formatRelativeDate(item.created_at)}</Text>
    </View>
  </TouchableOpacity>
)

const PostActionButtons = ({ item }: { item: EnhancedFeedPost }) => {
  const [isOnSpotifyLibrary, setIsOnSpotifyLibrary] = useState(false)
  const [isLikedByCurrentUser, setIsLikedByCurrentUser] = useState(false)
  const [likesCount, setLikesCount] = useState(0)

  const { user } = useUser()
  const { spotifyApi } = useSpotifyApi()

  useEffect(() => {
    setLikesCount(item.likes_count)
    setIsLikedByCurrentUser(item.is_liked_by_current_user)
    setIsOnSpotifyLibrary(item.isOnSpotifyLibrary)
  }, [item])

  if (!user) {
    return null
  }

  const handleLike = async () => {
    try {
      if (isLikedByCurrentUser) {
        await client.from('post_likes').delete().eq('post_id', item.id).eq('user_id', user.id)
        setLikesCount((prev) => prev - 1)
      } else {
        await client.from('post_likes').insert({ post_id: item.id, user_id: user.id })
        setLikesCount((prev) => prev + 1)
      }

      setIsLikedByCurrentUser((prev) => !prev)
    } catch (error) {
      console.error('Error toggling like:', error)
    }
  }

  const handleAddToSpotifyLibrary = async () => {
    if (!spotifyApi) {
      return
    }

    try {
      const trackId = item.spotify_track_id
      if (isOnSpotifyLibrary) {
        await (spotifyApi.currentUser.tracks.removeSavedTracks as any)({ ids: [trackId] })
      } else {
        await (spotifyApi.currentUser.tracks.saveTracks as any)({ ids: [trackId] })
      }

      setIsOnSpotifyLibrary((prev) => !prev)
    } catch (error) {
      console.error('Error adding/removing track from Spotify library:', error)
    }
  }

  return (
    <View style={styles.actions}>
      <VolumeOff color={theme.surface.base.default} size={30} />
      {isOnSpotifyLibrary ? (
        <CircleCheck color={theme.surface.success.default} onPress={handleAddToSpotifyLibrary} size={30} />
      ) : (
        <CirclePlus color={theme.surface.base.default} onPress={handleAddToSpotifyLibrary} size={30} />
      )}
      <View style={styles.likes}>
        <Heart
          color={isLikedByCurrentUser ? theme.surface.danger.default : theme.surface.base.default}
          onPress={handleLike}
          size={30}
        />
        <Text color="invert">{likesCount}</Text>
      </View>
    </View>
  )
}

const FeedHeader = ({ user }: { user: User }) => (
  <View style={styles.header}>
    <Avatar avatar={user.avatar_url} />
    <IconButton Icon={UserPlus} onPress={() => router.push('/search-users')} size="sm" variant="tertiary" />
  </View>
)

const Feed = () => {
  const { user } = useUser()
  const { loading: spotifyLoading, spotifyApi } = useSpotifyApi()
  const { newPostKey } = useFeed()

  const [posts, setPosts] = useState<EnhancedFeedPost[]>([])
  const [loading, setLoading] = useState(false)
  const [offset, setOffset] = useState(0)
  const [latestPostTimestamp, setLatestPostTimestamp] = useState<null | string>(null)
  const [hasNewPosts, setHasNewPosts] = useState(false)
  const [closeDrawer, setCloseDrawer] = useState(false)
  const [hasNewPostsKey, setHasNewPostsKey] = useState(0)
  const [resetPending, setResetPending] = useState(false)

  const LIMIT = 20
  const hasMounted = useRef(false)
  const listRef = useRef<FlashList<EnhancedFeedPost>>(null)

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
        console.error('Error polling new posts:', error)
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
    if (spotifyLoading && !hasMounted.current) {
      setLoading(true)
    } else {
      setLoading(false)
      hasMounted.current = true
    }
  }, [spotifyLoading])

  const checkLikedTracks = useCallback(
    async (trackIds: string[]): Promise<boolean[]> => {
      if (!spotifyApi) {
        return []
      }

      try {
        return await spotifyApi.currentUser.tracks.hasSavedTracks(trackIds)
      } catch (error) {
        console.error('Error checking liked tracks:', error)
        return []
      }
    },
    [spotifyApi],
  )

  const fetchPosts = useCallback(
    async (reset = false) => {
      if (!user) {
        return
      }

      setLoading(true)

      const { data, error } = await client.rpc('get_user_feed', {
        p_limit: LIMIT,
        p_offset: reset ? 0 : offset,
        p_user_id: user.id,
      })

      if (error) {
        console.error('Error fetching feed:', error)
        setLoading(false)
        return
      }

      const feedPosts = data as TPost[]
      const trackIds = feedPosts.map((post) => post.spotify_track_id)
      const likedTracks = await checkLikedTracks(trackIds)

      const postsWithStatus: EnhancedFeedPost[] = feedPosts.map((post, index) => ({
        ...post,
        isOnSpotifyLibrary: likedTracks[index] || false,
      }))

      setPosts((prev) => (reset ? postsWithStatus : [...prev, ...postsWithStatus]))

      if (reset) {
        setOffset(LIMIT)
        setLatestPostTimestamp(feedPosts[0]?.created_at ?? null)
        setHasNewPosts(false)
        setResetPending(true)
      } else {
        setOffset((prev) => prev + LIMIT)
      }

      setLoading(false)
    },
    [checkLikedTracks, offset, user],
  )

  const onViewableItemsChanged = useCallback(
    ({ viewableItems }: { viewableItems: Array<{ item: EnhancedFeedPost }> }) => {
      const focusedPost = viewableItems?.[0]?.item
      if (focusedPost) {
        console.log('Centered post:', focusedPost.track_name)
      }
    },
    [],
  )

  useEffect(() => {
    if (newPostKey > 0 && newPostKey !== hasNewPostsKey) {
      setCloseDrawer(true)
      setHasNewPosts(true)
      setHasNewPostsKey(newPostKey)
    }
  }, [hasNewPostsKey, newPostKey, setHasNewPosts])

  useEffect(() => {
    if (resetPending && posts.length > 0) {
      // Timeout léger pour s'assurer que FlashList a tout rendu
      setTimeout(() => {
        listRef.current?.scrollToOffset({ animated: true, offset: 0 })
      }, 100)

      setResetPending(false)
    }
  }, [posts, resetPending])

  if (!user) {
    return null
  }

  const handleShowNewPosts = () => {
    fetchPosts(true)
  }

  const renderItem = ({ item }: { item: EnhancedFeedPost }) => (
    <Post
      ActionButtons={<PostActionButtons item={item} />}
      Header={<PostHeader item={item} />}
      item={item}
      style={styles.post}
    />
  )

  return (
    <SafeAreaView edges={['top']} style={styles.container}>
      <GestureHandlerRootView>
        <FeedHeader user={user} />
        {hasNewPosts && (
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
          keyExtractor={(item) => item.id ?? Math.random().toString()}
          onEndReached={() => fetchPosts()}
          onEndReachedThreshold={0.8}
          onRefresh={() => fetchPosts(true)}
          onScrollBeginDrag={() => setCloseDrawer(true)}
          onViewableItemsChanged={onViewableItemsChanged}
          ref={listRef}
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
    margin: theme.spacing[200],
  },
  user: {
    alignItems: 'center',
    flexDirection: 'row',
    marginBottom: theme.spacing[1000],
  },
})

export default Feed
