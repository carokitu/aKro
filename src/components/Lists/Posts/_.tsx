import { useFocusEffect } from '@react-navigation/native'
import { ArrowUp } from 'lucide-react-native'
import { useCallback, useEffect, useRef, useState } from 'react'
import { type NativeScrollEvent, type NativeSyntheticEvent, StyleSheet } from 'react-native'

import { FlashList, type FlashListProps } from '@shopify/flash-list'
import { Audio } from 'expo-av'

import { PostProvider, useMute, usePost } from '../../../../hooks'
import { type Post as TPost, type User } from '../../../../models'
import { client } from '../../../../supabase'
import { Error } from '../../../system'
import { theme } from '../../../theme'
import { Post } from '../../Post'
import { type InteractiveContainerRef } from '../../Post/InteractiveContainer'
import { Toast, type ToastProps } from './Toast'

type Props = Omit<FlashListProps<TPost>, 'data' | 'renderItem'> & {
  fetchPosts: ({ limit, offset }: { limit: number; offset: number }) => Promise<{ data: TPost[]; error: Error | null }>
  loadNewPost?: boolean
  onReset?: () => void
  setShowFeedDrawer?: (option: boolean) => void
  toast?: ToastProps
  user: User
}

const List = ({
  fetchPosts: fetchPostFromProps,
  loadNewPost = false,
  onReset,
  onScrollBeginDrag,
  setShowFeedDrawer,
  toast,
  user,
  ...flashListProps
}: Props) => {
  const { expendedDescription, expendedLikesPostId, setExpendedDescription, setExpendedLikesPostId } = usePost()
  const { mute, temporaryMute } = useMute()

  const [error, setError] = useState<Error | null>(null)
  const [hasNewPosts, setHasNewPosts] = useState(false)
  const [latestPostTimestamp, setLatestPostTimestamp] = useState<null | string>(null)
  const [loading, setLoading] = useState(false)
  const [offset, setOffset] = useState(0)
  const [posts, setPosts] = useState<TPost[]>([])
  const [resetPending, setResetPending] = useState(false)
  const [sound, setSound] = useState<Audio.Sound | null>(null)
  const [triggerRefresh, setTriggerRefresh] = useState(false)

  const LIMIT = 20
  const listRef = useRef<FlashList<TPost>>(null)
  const interactiveRefs = useRef<Map<string, InteractiveContainerRef | null>>(new Map())

  const stopPreview = useCallback(async () => {
    if (sound) {
      try {
        await sound.stopAsync()
        await sound.unloadAsync()
        setSound(null)
      } catch (err) {
        console.error('Error stopping preview:', err)
      }
    }
  }, [sound])

  const playPreviewFromISRC = useCallback(
    async (isrc: string) => {
      try {
        const response = await fetch(`https://api.deezer.com/track/isrc:${isrc}`)
        const data = await response.json()

        if (!data.preview) {
          console.warn('No preview available for ISRC:', isrc)
          return
        }

        if (sound) {
          await stopPreview()
        }

        const { sound: newSound } = await Audio.Sound.createAsync(
          { uri: data.preview },
          { isLooping: true, shouldPlay: !mute },
        )

        setSound(newSound)
      } catch (err) {
        console.error('Error playing Deezer preview:', err)
      }
    },
    [mute, sound, stopPreview],
  )

  useFocusEffect(
    useCallback(() => {
      // Quand l'écran redevient actif
      const resumeAudio = async () => {
        try {
          if (sound && !mute) {
            const status = await sound.getStatusAsync()
            if (status.isLoaded) {
              await sound.setPositionAsync(0)
              await sound.playAsync()
            }
          }
        } catch (err) {
          console.error('Erreur reprise son :', err)
        }
      }

      resumeAudio()

      // Quand l’écran perd le focus
      return () => {
        if (sound) {
          sound.pauseAsync()
        }
      }
    }, [mute, sound]),
  )

  useEffect(() => {
    const applyMute = async () => {
      if (!sound) {
        return
      }

      try {
        if (mute || temporaryMute) {
          await sound.pauseAsync()
        } else {
          await sound.playAsync()
        }
      } catch (err) {
        console.error('Error applying mute:', err)
      }
    }

    applyMute()
  }, [mute, sound, temporaryMute])

  useEffect(() => {
    return () => {
      if (sound) {
        sound.unloadAsync()
      }
    }
  }, [sound])

  useEffect(() => {
    if (expendedDescription || expendedLikesPostId) {
      setShowFeedDrawer?.(false)
    } else {
      setShowFeedDrawer?.(true)
    }
  }, [expendedDescription, expendedLikesPostId, setShowFeedDrawer])

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

      const latestPost = data?.[0] as TPost | undefined
      setHasNewPosts(!!(latestPost && latestPost.created_at > latestPostTimestamp && latestPost.user_id !== user.id))
    }, 15_000)

    return () => clearInterval(interval)
  }, [latestPostTimestamp, loadNewPost, user])

  const fetchPosts = useCallback(
    async (reset = false) => {
      if (!user) {
        return
      }

      setLoading(true)
      const { data, error: err } = await fetchPostFromProps({ limit: LIMIT, offset: reset ? 0 : offset })

      if (err) {
        setError(err)
        setLoading(false)
        return
      } else {
        setError(null)
      }

      const feedPosts = data as TPost[]
      setPosts((prev) => (reset ? feedPosts : [...prev, ...feedPosts]))

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
    [fetchPostFromProps, offset, onReset, user],
  )

  useEffect(() => {
    if (resetPending && posts.length > 0) {
      setTimeout(() => {
        listRef.current?.scrollToOffset({ animated: true, offset: 0 })
      }, 300)
      setResetPending(false)
    }
  }, [posts, resetPending])

  useEffect(() => {
    if (posts.length === 0 && user) {
      fetchPosts(true)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user])

  useEffect(() => {
    if (triggerRefresh) {
      fetchPosts(true)
      setTriggerRefresh(false)
    }
  }, [fetchPosts, triggerRefresh])

  const handleScrollBeginDrag = useCallback(
    (event: NativeSyntheticEvent<NativeScrollEvent>) => {
      if (expendedDescription) {
        setExpendedDescription(undefined)
      } else if (expendedLikesPostId) {
        setExpendedLikesPostId(undefined)
      }

      onScrollBeginDrag?.(event)
    },
    [expendedDescription, expendedLikesPostId, onScrollBeginDrag, setExpendedDescription, setExpendedLikesPostId],
  )

  const handleToast = () => fetchPosts(true)

  const viewabilityCallback = useCallback(
    ({ viewableItems }: { viewableItems: Array<{ item: TPost }> }) => {
      const focusedPost = viewableItems?.[0]?.item

      if (focusedPost?.isrc) {
        playPreviewFromISRC(focusedPost.isrc)
      } else {
        stopPreview()
      }
    },
    [playPreviewFromISRC, stopPreview],
  )

  const viewabilityConfigCallbackPairs = useRef([
    {
      onViewableItemsChanged: viewabilityCallback,
      viewabilityConfig: {
        itemVisiblePercentThreshold: 80,
        minimumViewTime: 200,
      },
    },
  ])

  const handleLike = useCallback(
    async (post: TPost) => {
      if (!user) {
        return
      }

      try {
        if (post.is_liked_by_current_user) {
          await client.from('post_likes').delete().eq('post_id', post.id).eq('user_id', user.id)
          setPosts((prev) =>
            prev.map((p) =>
              p.id === post.id
                ? {
                    ...p,
                    is_liked_by_current_user: false,
                    likes_count: p.likes_count - 1,
                  }
                : p,
            ),
          )
        } else {
          await client.from('post_likes').insert({ post_id: post.id, user_id: user.id })
          setPosts((prev) =>
            prev.map((p) =>
              p.id === post.id
                ? {
                    ...p,
                    is_liked_by_current_user: true,
                    likes_count: p.likes_count + 1,
                  }
                : p,
            ),
          )
        }
      } catch (err) {
        console.error('Failed to toggle like:', err)
      }
    },
    [user],
  )

  const renderItem = ({ item }: { item: TPost }) => {
    const handleDoubleTap = () => {
      if (!item.is_liked_by_current_user) {
        handleLike(item)
      }
    }

    const handleLikePress = () => {
      handleLike(item)
      if (!item.is_liked_by_current_user) {
        interactiveRefs.current.get(item.id)?.triggerOverlay()
      }
    }

    return (
      <Post.InteractiveContainer
        handleLike={handleDoubleTap}
        ref={(ref) => interactiveRefs.current.set(item.id, ref)}
        style={styles.post}
      >
        <Post.Header item={item} triggerRefresh={() => setTriggerRefresh(true)} user={user} />
        <Post.Track item={item} size="medium">
          <Post.ActionButtons
            isLikedByCurrentUser={item.is_liked_by_current_user}
            item={item}
            likesCount={item.likes_count}
            onLikePress={handleLikePress}
            user={user}
          />
        </Post.Track>
        <Post.Footer item={item} />
      </Post.InteractiveContainer>
    )
  }

  if (!user) {
    return null
  }

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
        onScrollBeginDrag={handleScrollBeginDrag}
        ref={listRef}
        refreshing={loading}
        renderItem={renderItem}
        showsVerticalScrollIndicator={false}
        snapToAlignment="center"
        viewabilityConfigCallbackPairs={viewabilityConfigCallbackPairs.current}
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
      <Post.ExpendedDescription />
      <Post.ExpendedLikes />
    </>
  )
}

export const PostsList = (props: Props) => (
  <PostProvider>
    <List {...props} />
  </PostProvider>
)

const styles = StyleSheet.create({
  post: {
    margin: theme.spacing[200],
  },
})
