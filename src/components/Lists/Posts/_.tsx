import { ArrowUp } from 'lucide-react-native'
import { useCallback, useEffect, useRef, useState } from 'react'
import { StyleSheet } from 'react-native'

import { FlashList, type FlashListProps } from '@shopify/flash-list'

import { useSpotifyApi } from '../../../../hooks'
import { type Post as TPost, type User } from '../../../../models'
import { client } from '../../../../supabase'
import { Error } from '../../../system'
import { theme } from '../../../theme'
import { Post } from '../../Post'
import { ActionButtons } from './ActionButtons'
import { Header } from './Header'
import { Toast, type ToastProps } from './Toast'
import { type EnhancedFeedPost } from './types'

type Props = Omit<FlashListProps<EnhancedFeedPost>, 'data' | 'renderItem'> & {
  fetchPosts: ({ limit, offset }: { limit: number; offset: number }) => Promise<{ data: TPost[]; error: Error | null }>
  loadNewPost?: boolean
  onReset?: () => void
  toast?: ToastProps
  user: User
}

export const PostsList = ({
  fetchPosts: fetchPostFromProps,
  loadNewPost = false,
  onReset,
  toast,
  user,
  ...flashListProps
}: Props) => {
  const { loading: spotifyLoading, spotifyApi } = useSpotifyApi()

  const [posts, setPosts] = useState<EnhancedFeedPost[]>([])
  const [loading, setLoading] = useState(false)
  const [offset, setOffset] = useState(0)
  const [latestPostTimestamp, setLatestPostTimestamp] = useState<null | string>(null)
  const [hasNewPosts, setHasNewPosts] = useState(false)
  const [resetPending, setResetPending] = useState(false)
  const [error, setError] = useState<Error | null>(null)
  const [triggerRefresh, setTriggerRefresh] = useState(false)

  const LIMIT = 20
  const hasMounted = useRef(false)
  const listRef = useRef<FlashList<EnhancedFeedPost>>(null)

  useEffect(() => {
    if (!latestPostTimestamp || !user || !loadNewPost) {
      return
    }

    const interval = setInterval(async () => {
      const { data } = await client.rpc('get_user_feed', {
        p_limit: 1,
        p_offset: 0,
        p_user_id: user.id,
      })

      const latestPost = data?.[0] ? (data?.[0] as TPost) : undefined

      if (latestPost && latestPost.created_at > latestPostTimestamp && latestPost.user_id !== user.id) {
        setHasNewPosts(true)
      } else {
        setHasNewPosts(false)
      }
    }, 15_000)

    return () => clearInterval(interval)
  }, [latestPostTimestamp, loadNewPost, user])

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
      if (!spotifyApi || trackIds.length === 0) {
        return []
      }

      return await spotifyApi.currentUser.tracks.hasSavedTracks(trackIds)
    },
    [spotifyApi],
  )

  const fetchPosts = useCallback(
    async (reset = false) => {
      if (!user) {
        return
      }

      setLoading(true)

      const props = {
        limit: LIMIT,
        offset: reset ? 0 : offset,
      }

      const { data, error: err } = await fetchPostFromProps(props)

      if (err) {
        setError(err)
        setLoading(false)
        return
      } else {
        setError(null)
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
        setLatestPostTimestamp(feedPosts[0]?.created_at)
        setHasNewPosts(false)
        onReset?.()
        setResetPending(true)
      } else {
        setOffset((prev) => prev + LIMIT)
      }

      setLoading(false)
    },
    [checkLikedTracks, fetchPostFromProps, offset, onReset, user],
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
    if (resetPending && posts.length > 0) {
      // Timeout léger pour s'assurer que FlashList a tout rendu
      setTimeout(() => {
        listRef.current?.scrollToOffset({ animated: true, offset: 0 })
      }, 300)

      setResetPending(false)
    }
  }, [posts, resetPending])

  useEffect(() => {
    if (posts.length !== 0) {
      return
    }

    if (!spotifyLoading && spotifyApi && user) {
      fetchPosts(true)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [spotifyApi, spotifyLoading, user])

  useEffect(() => {
    if (triggerRefresh) {
      fetchPosts(true)
      setTriggerRefresh(false)
    }
  }, [fetchPosts, triggerRefresh])

  if (!user) {
    return null
  }

  const handleToast = () => {
    fetchPosts(true)
  }

  const renderItem = ({ item }: { item: EnhancedFeedPost }) => (
    <Post
      ActionButtons={<ActionButtons item={item} user={user} />}
      Header={<Header item={item} triggerRefresh={() => setTriggerRefresh(true)} user={user} />}
      item={item}
      style={styles.post}
    />
  )

  if (error) {
    return <Error />
  }

  return (
    <>
      <FlashList
        data={posts}
        decelerationRate="fast"
        estimatedItemSize={400}
        keyExtractor={(item) => item.id}
        onEndReached={() => fetchPosts()}
        onEndReachedThreshold={0.8}
        onRefresh={() => fetchPosts(true)}
        onViewableItemsChanged={onViewableItemsChanged}
        ref={listRef}
        refreshing={loading}
        renderItem={renderItem}
        showsVerticalScrollIndicator={false}
        snapToAlignment="center"
        viewabilityConfig={{ itemVisiblePercentThreshold: 50 }}
        {...flashListProps}
      />
      {toast && (
        <Toast
          {...toast}
          onPress={() => {
            handleToast()
            toast.onPress()
          }}
        />
      )}
      {!toast && hasNewPosts && (
        <Toast Icon={ArrowUp} message="Nouveaux posts" onPress={handleToast} variant="default" />
      )}
    </>
  )
}

const styles = StyleSheet.create({
  post: {
    margin: theme.spacing[200],
  },
})
