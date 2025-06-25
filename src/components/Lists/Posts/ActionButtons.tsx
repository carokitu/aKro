/* eslint-disable @typescript-eslint/no-require-imports */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { CirclePlus, Heart, VolumeOff } from 'lucide-react-native'
import { memo, useEffect, useState } from 'react'
import { Image, StyleSheet, TouchableOpacity, View } from 'react-native'

import { useSpotifyApi } from '../../../../hooks'
import { type User } from '../../../../models'
import { client } from '../../../../supabase'
import { Text } from '../../../system'
import { theme } from '../../../theme'
import { type EnhancedFeedPost } from './types'

export const ActionButtons = memo(({ item, user }: { item: EnhancedFeedPost; user: User }) => {
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
      <TouchableOpacity onPress={handleAddToSpotifyLibrary}>
        {isOnSpotifyLibrary ? (
          <Image source={require('../../../../assets/images/icons/liked-spotify.png')} style={styles.customIcon} />
        ) : (
          <CirclePlus color={theme.surface.base.default} size={30} />
        )}
      </TouchableOpacity>
      <TouchableOpacity onPress={handleLike} style={styles.likes}>
        {isLikedByCurrentUser ? (
          <Image
            source={require('../../../../assets/images/icons/heart-filled.png')}
            style={styles.customIcon}
            tintColor={theme.text.base.invert}
          />
        ) : (
          <Heart color={theme.surface.base.default} size={30} />
        )}
        <Text color="invert">{likesCount}</Text>
      </TouchableOpacity>
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
  customIcon: {
    height: 30,
    width: 30,
  },
  likes: {
    alignItems: 'center',
  },
})
