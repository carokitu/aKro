import React, { useEffect, useState } from 'react'
import { ActivityIndicator, FlatList, Image, Text, View } from 'react-native'

import { type PlayHistory, type Track } from '@spotify/web-api-ts-sdk'

import { useSpotifyApi } from '../hooks'

const RecentTracks = () => {
  const { loading: loadingToken, useApi } = useSpotifyApi()
  const [tracks, setTracks] = useState<PlayHistory[]>()
  const [currentTrack, setCurrentTrack] = useState<null | Track>(null)
  const [loading, setLoading] = useState(loadingToken)

  useEffect(() => {
    const fetchCurrentTrack = async () => {
      try {
        setLoading(true)

        const current = await useApi?.player.getCurrentlyPlayingTrack()

        if (current?.item && 'album' in current.item) {
          setCurrentTrack(current.item as Track)
        }
      } catch (error) {
        console.error('Error fetching currently played tracks:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchCurrentTrack()
  }, [useApi])

  useEffect(() => {
    const getTracks = async () => {
      try {
        setLoading(true)

        const recentTracks = await useApi?.player.getRecentlyPlayedTracks()
        setTracks(recentTracks?.items)

        setLoading(false)
      } catch (error) {
        console.error('Error fetching recently played tracks:', error)
      } finally {
        setLoading(false)
      }
    }

    getTracks()
  }, [useApi])

  if (loading) {
    return <ActivityIndicator size="large" />
  }

  return (
    <View>
      {currentTrack && (
        <View style={{ marginBottom: 20 }}>
          <Text style={{ fontSize: 20, fontWeight: 'bold' }}>Currently Playing</Text>
          <View style={{ alignItems: 'center', flexDirection: 'row', marginBottom: 10 }}>
            <Image
              source={{ uri: currentTrack.album.images[0].url }}
              style={{ borderRadius: 5, height: 50, marginRight: 10, width: 50 }}
            />
            <View>
              <Text style={{ fontWeight: 'bold' }}>{currentTrack.name}</Text>
              <Text>{currentTrack.artists.map((artist) => artist.name).join(', ')}</Text>
            </View>
          </View>
        </View>
      )}
      <Text style={{ fontSize: 20, fontWeight: 'bold' }}>Recently Played Tracks</Text>
      <FlatList
        data={tracks}
        keyExtractor={(item) => item.track.id}
        renderItem={({ item }) => (
          <View style={{ alignItems: 'center', flexDirection: 'row', marginBottom: 10 }}>
            <Image
              source={{ uri: item.track.album.images[0].url }}
              style={{ borderRadius: 5, height: 50, marginRight: 10, width: 50 }}
            />
            <View>
              <Text style={{ fontWeight: 'bold' }}>{item.track.name}</Text>
              <Text>{item.track.artists.map((artist) => artist.name).join(', ')}</Text>
            </View>
          </View>
        )}
      />
    </View>
  )
}

export default RecentTracks
