/* eslint-disable @typescript-eslint/no-require-imports */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { CirclePlus, Heart, MessageSquareMore, Volume2, VolumeOff } from 'lucide-react-native'
import { memo, useEffect, useState } from 'react'
import { Image, StyleSheet, TouchableOpacity, View } from 'react-native'

import { router } from 'expo-router'

import { useFeed, useMute, usePost, useSpotifyApi } from '../../../../../hooks'
import { type User } from '../../../../../models'
import { client } from '../../../../../supabase'
import { Text } from '../../../../system'
import { theme } from '../../../../theme'
import { type EnhancedFeedPost } from '../types'

export const ActionButtons = memo(({ item, user }: { item: EnhancedFeedPost; user: User }) => {
  const { setExpendedLikesPostId } = usePost()
  const { mute, setMute } = useMute()
  const { commentUpdates } = useFeed()
  const [isOnSpotifyLibrary, setIsOnSpotifyLibrary] = useState(false)
  const [isLikedByCurrentUser, setIsLikedByCurrentUser] = useState(false)
  const [likesCount, setLikesCount] = useState(0)
  const [commentsCount, setCommentsCount] = useState(0)
  const { spotifyApi } = useSpotifyApi()

  useEffect(() => {
    setLikesCount(item.likes_count)
    setIsLikedByCurrentUser(item.is_liked_by_current_user)
    setIsOnSpotifyLibrary(item.isOnSpotifyLibrary)
    setCommentsCount(item.comments_count)
  }, [item])

  useEffect(() => {
    const updatedCount = commentUpdates.get(item.id)
    if (updatedCount !== undefined) {
      setCommentsCount(updatedCount)
    }
  }, [commentUpdates, item.id])

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
        const { error } = await client
          .from('user_saved_tracks')
          .insert({ isrc: item.isrc, post_id: item.id, user_id: user.id })

        console.log(error)
      }

      setIsOnSpotifyLibrary((prev) => !prev)
    } catch (error) {
      console.error('Error adding/removing track from Spotify library:', error)
    }
  }

  return (
    <View style={styles.actions}>
      <TouchableOpacity onPress={() => setMute(!mute)}>
        {mute ? (
          <VolumeOff color={theme.surface.base.default} size={30} />
        ) : (
          <Volume2 color={theme.surface.base.default} size={30} />
        )}
      </TouchableOpacity>
      <TouchableOpacity onPress={handleAddToSpotifyLibrary}>
        {isOnSpotifyLibrary ? (
          <Image source={require('../../../../../assets/images/icons/liked-spotify.png')} style={styles.customIcon} />
        ) : (
          <CirclePlus color={theme.surface.base.default} size={30} />
        )}
      </TouchableOpacity>
      <TouchableOpacity onPress={() => router.push(`/post/${item.id}`)} style={styles.composed}>
        <MessageSquareMore color={theme.surface.base.default} size={32} />
        <Text color="invert">{commentsCount}</Text>
      </TouchableOpacity>
      <View style={styles.composed}>
        <TouchableOpacity onPress={handleLike}>
          {isLikedByCurrentUser ? (
            <Image
              source={require('../../../../../assets/images/icons/heart-filled.png')}
              style={styles.customIcon}
              tintColor={theme.text.base.invert}
            />
          ) : (
            <Heart color={theme.surface.base.default} size={30} />
          )}
        </TouchableOpacity>
        <TouchableOpacity onPress={() => likesCount > 0 && setExpendedLikesPostId(item.id)}>
          <Text color="invert">{likesCount}</Text>
        </TouchableOpacity>
      </View>
    </View>
  )
})

const styles = StyleSheet.create({
  actions: {
    flexDirection: 'column',
    gap: theme.spacing[1200],
    justifyContent: 'space-between',
    paddingVertical: theme.spacing[800],
  },
  composed: {
    alignItems: 'center',
  },
  customIcon: {
    height: 30,
    width: 30,
  },
})
