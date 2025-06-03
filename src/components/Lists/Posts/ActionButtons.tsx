/* eslint-disable @typescript-eslint/no-explicit-any */
import { CircleCheck, CirclePlus, Heart, VolumeOff } from 'lucide-react-native'
import { useEffect, useState } from 'react'
import { StyleSheet, View } from 'react-native'

import { useSpotifyApi } from '../../../../hooks'
import { type User } from '../../../../models'
import { client } from '../../../../supabase'
import { Text } from '../../../system'
import { theme } from '../../../theme'
import { type EnhancedFeedPost } from './types'

export const ActionButtons = ({ item, user }: { item: EnhancedFeedPost; user: User }) => {
  const [isOnSpotifyLibrary, setIsOnSpotifyLibrary] = useState(false)
  const [isLikedByCurrentUser, setIsLikedByCurrentUser] = useState(false)
  const [likesCount, setLikesCount] = useState(0)

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

const styles = StyleSheet.create({
  actions: {
    flexDirection: 'column',
    gap: theme.spacing[1200],
    justifyContent: 'space-between',
    paddingRight: theme.spacing[400],
    paddingVertical: theme.spacing[800],
  },
  likes: {
    alignItems: 'center',
  },
})
