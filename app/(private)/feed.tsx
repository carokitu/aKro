/* eslint-disable @typescript-eslint/no-explicit-any */

import { CircleCheck, CirclePlus, Heart, UserPlus, VolumeOff } from 'lucide-react-native'
import { useCallback, useEffect, useState } from 'react'
import { StyleSheet, View } from 'react-native'
import { GestureHandlerRootView } from 'react-native-gesture-handler'
import { SafeAreaView } from 'react-native-safe-area-context'

import { FlashList } from '@shopify/flash-list'
import { router } from 'expo-router'

import { useSpotifyApi, useUser } from '../../hooks'
import { type Post as TPost, type User } from '../../models'
import { Drawer } from '../../src'
import { Post as CPost } from '../../src/components'
import { Avatar, Button, IconButton, Label, Text } from '../../src/system'
import { theme } from '../../src/theme'
import { formatRelativeDate } from '../../src/utils'
import { client } from '../../supabase'

type EnhancedFeedPost = TPost & {
  isOnSpotifyLibrary: boolean
}

const PostHeader = ({ item }: { item: EnhancedFeedPost }) => (
  <View style={styles.user}>
    <Avatar avatar={item.avatar_url} />
    <View style={styles.info}>
      <Label color="invert">{item.username}</Label>
      <Text color="invert">{formatRelativeDate(item.created_at)}</Text>
    </View>
  </View>
)

const PostActionButtons = ({ item }: { item: EnhancedFeedPost }) => {
  const [isOnSpotifyLibrary, setIsOnSpotifyLibrary] = useState(false)
  const [isLikedByCurrentUser, setIsLikedByCurrentUser] = useState(false)
  const [likesCount, setLikesCount] = useState(item.likes_count)

  const { user } = useUser()
  const { spotifyApi } = useSpotifyApi()

  useEffect(() => {
    setIsOnSpotifyLibrary(item.isOnSpotifyLibrary)
  }, [item.isOnSpotifyLibrary])

  useEffect(() => {
    setIsLikedByCurrentUser(item.is_liked_by_current_user)
  }, [item.is_liked_by_current_user])

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

  const handleAddToSpotifyLibrary = async () => {
    if (!spotifyApi) {
      return
    }

    try {
      if (isOnSpotifyLibrary) {
        await (spotifyApi.currentUser.tracks.removeSavedTracks as any)({ ids: [item.spotify_track_id] })
      } else {
        await (spotifyApi.currentUser.tracks.saveTracks as any)({ ids: [item.spotify_track_id] })
      }
    } catch (error) {
      console.error('Error adding to Spotify library:', error)
      return
    } finally {
      setIsOnSpotifyLibrary(!isOnSpotifyLibrary)
    }
  }

  return (
    <View style={styles.actions}>
      <VolumeOff color={theme.surface.base.default} size="30" />
      {isOnSpotifyLibrary ? (
        <CircleCheck color={theme.surface.success.default} onPress={handleAddToSpotifyLibrary} size="30" />
      ) : (
        <CirclePlus color={theme.surface.base.default} onPress={handleAddToSpotifyLibrary} size="30" />
      )}
      <View style={styles.likes}>
        <Heart
          color={isLikedByCurrentUser ? theme.surface.danger.default : theme.surface.base.default}
          onPress={handleLike}
          size="30"
        />
        <Text color="invert">{likesCount}</Text>
      </View>
    </View>
  )
}

const Post = ({ item }: { item: EnhancedFeedPost }) => {
  return <CPost ActionButtons={<PostActionButtons item={item} />} Header={<PostHeader item={item} />} item={item} />
}

const FeedHeader = ({ user }: { user: User }) => (
  <View style={styles.header}>
    <Avatar avatar={user.avatar_url} />
    <IconButton Icon={UserPlus} onPress={() => router.push('/search-users')} size="sm" variant="tertiary" />
  </View>
)

const Feed = () => {
  const { loading: spotifyLoading, spotifyApi } = useSpotifyApi()
  const { user } = useUser()
  const [closeDrawer, setCloseDrawer] = useState(false)
  const [latestPostTimestamp, setLatestPostTimestamp] = useState<null | string>(null)
  const [hasNewPosts, setHasNewPosts] = useState(false)
  const { user: currentUser } = useUser()
  const [posts, setPosts] = useState<EnhancedFeedPost[]>([])
  const [loading, setLoading] = useState(spotifyLoading)
  const [offset, setOffset] = useState(0)

  // Make sure this limit to does not exceed 50 for the liked tracks check
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

  const checkLikedTracks = useCallback(
    async (trackIds: string[]) => {
      if (!spotifyApi) {
        return []
      }

      try {
        const results: boolean[] = []
        const likedTracks = await spotifyApi.currentUser.tracks.hasSavedTracks(trackIds)
        results.push(...likedTracks)

        return results
      } catch (error) {
        console.error('Error checking liked tracks:', error)
        return []
      }
    },
    [spotifyApi],
  )

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
        const feedPosts = data as TPost[]
        const trackIds = feedPosts.map((post) => post.spotify_track_id)
        // Check which tracks are liked
        const likedTracks = await checkLikedTracks(trackIds)

        // Add liked status to each post
        const postsWithLikedStatus = feedPosts.map((post, index) => ({
          ...post,
          isOnSpotifyLibrary: likedTracks[index] || false,
        }))
        setPosts((prev) => (reset ? postsWithLikedStatus : [...prev, ...postsWithLikedStatus]))

        if (reset) {
          setLatestPostTimestamp(data[0].created_at)
          setHasNewPosts(false)
        } else {
          setOffset((prev) => prev + LIMIT)
        }
      }

      setLoading(false)
    },
    [checkLikedTracks, currentUser, offset],
  )

  const onViewableItemsChanged = useCallback(async ({ viewableItems }: { viewableItems: Array<{ item: TPost }> }) => {
    const focusedPost = viewableItems[0]?.item

    if (!focusedPost) {
      return
    }

    console.log('centeredPost', focusedPost.track_name)
    // const currentTrack = await spotifyApi.tracks.get(centeredPost.spotify_track_id)
  }, [])

  if (!user) {
    return null
  }

  const handleShowNewPosts = () => {
    fetchPosts(true) // reload feed from scratch
    setHasNewPosts(false)
  }

  const renderItem = ({ item }: { item: EnhancedFeedPost }) => <Post item={item} />

  return (
    <SafeAreaView edges={['top']} style={styles.container}>
      <GestureHandlerRootView>
        <FeedHeader user={user} />
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
  user: {
    alignItems: 'center',
    flexDirection: 'row',
    marginBottom: theme.spacing[1000],
  },
})

export default Feed
