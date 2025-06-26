import { useFocusEffect } from '@react-navigation/native'
import { ArrowUp } from 'lucide-react-native'
import { useCallback, useEffect, useRef, useState } from 'react'
import { type NativeScrollEvent, type NativeSyntheticEvent, StyleSheet } from 'react-native'

import { FlashList, type FlashListProps } from '@shopify/flash-list'
import { Audio } from 'expo-av'

import { PostProvider, useMute, usePost, useSpotifyApi } from '../../../../hooks'
import { type Post as TPost, type User } from '../../../../models'
import { client } from '../../../../supabase'
import { Error } from '../../../system'
import { theme } from '../../../theme'
import { Post } from '../../Post'
import { ActionButtons } from './ActionButtons'
import ExpendedDescription from './ExpendedDescription'
import { Header } from './Header'
import { Toast, type ToastProps } from './Toast'
import { type EnhancedFeedPost } from './types'

type Props = Omit<FlashListProps<EnhancedFeedPost>, 'data' | 'renderItem'> & {
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
  const { loading: spotifyLoading, spotifyApi } = useSpotifyApi()
  const { expendedDescription, setExpendedDescription } = usePost()
  const { mute } = useMute()

  const [posts, setPosts] = useState<EnhancedFeedPost[]>([])
  const [loading, setLoading] = useState(false)
  const [offset, setOffset] = useState(0)
  const [latestPostTimestamp, setLatestPostTimestamp] = useState<null | string>(null)
  const [hasNewPosts, setHasNewPosts] = useState(false)
  const [resetPending, setResetPending] = useState(false)
  const [error, setError] = useState<Error | null>(null)
  const [triggerRefresh, setTriggerRefresh] = useState(false)
  const [sound, setSound] = useState<Audio.Sound | null>(null)

  const LIMIT = 20
  const hasMounted = useRef(false)
  const listRef = useRef<FlashList<EnhancedFeedPost>>(null)

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
          await sound.unloadAsync()
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
    [mute, sound],
  )

  useFocusEffect(
    useCallback(() => {
      // Quand l'écran redevient actif
      const resumeAudio = async () => {
        try {
          if (sound && !mute) {
            await sound.setPositionAsync(0)
            await sound.playAsync()
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

  useEffect(() => {
    const applyMute = async () => {
      if (!sound) {
        return
      }

      try {
        if (mute) {
          await sound.pauseAsync()
        } else {
          await sound.playAsync()
        }
      } catch (err) {
        console.error('Error applying mute:', err)
      }
    }

    applyMute()
  }, [mute, sound])

  useEffect(() => {
    return () => {
      if (sound) {
        sound.unloadAsync()
      }
    }
  }, [sound])

  useEffect(() => {
    if (expendedDescription) {
      setShowFeedDrawer?.(false)
    } else {
      setShowFeedDrawer?.(true)
    }
  }, [expendedDescription, setShowFeedDrawer])

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

  useEffect(() => {
    if (spotifyLoading && !hasMounted.current) {
      setLoading(true)
    } else {
      setLoading(false)
      hasMounted.current = true
    }
  }, [spotifyLoading])

  const checkLikedTracks = useCallback(
    async (trackIds: string[]) => {
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
      const { data, error: err } = await fetchPostFromProps({ limit: LIMIT, offset: reset ? 0 : offset })

      if (err) {
        setError(err)
        setLoading(false)
        return
      } else {
        setError(null)
      }

      const feedPosts = data as TPost[]
      const trackIds = feedPosts.map((p) => p.spotify_track_id)
      const likedTracks = await checkLikedTracks(trackIds)

      const postsWithStatus: EnhancedFeedPost[] = feedPosts.map((p, i) => ({
        ...p,
        isOnSpotifyLibrary: likedTracks[i] || false,
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

  useEffect(() => {
    if (resetPending && posts.length > 0) {
      setTimeout(() => {
        listRef.current?.scrollToOffset({ animated: true, offset: 0 })
      }, 300)
      setResetPending(false)
    }
  }, [posts, resetPending])

  useEffect(() => {
    if (posts.length === 0 && !spotifyLoading && spotifyApi && user) {
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

  const handleScrollBeginDrag = useCallback(
    (event: NativeSyntheticEvent<NativeScrollEvent>) => {
      if (expendedDescription) {
        setExpendedDescription(undefined)
      }

      onScrollBeginDrag?.(event)
    },
    [expendedDescription, onScrollBeginDrag, setExpendedDescription],
  )

  const handleToast = () => fetchPosts(true)

  const viewabilityCallback = useCallback(
    ({ viewableItems }: { viewableItems: Array<{ item: EnhancedFeedPost }> }) => {
      const focusedPost = viewableItems?.[0]?.item
      console.log('Focused post:', focusedPost?.track_name)

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

  const renderItem = ({ item }: { item: EnhancedFeedPost }) => (
    <Post
      ActionButtons={<ActionButtons item={item} user={user} />}
      Header={<Header item={item} triggerRefresh={() => setTriggerRefresh(true)} user={user} />}
      item={item}
      style={styles.post}
    />
  )

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
      <ExpendedDescription />
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
