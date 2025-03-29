import React, { useCallback, useEffect, useState } from 'react'
import { ActivityIndicator, FlatList, Image, StyleSheet, Text, View } from 'react-native'

import { type PlayHistory, type Track } from '@spotify/web-api-ts-sdk'

import { useSpotifyApi } from '../hooks'

const REFRESH_INTERVAL = 5000 // 5 seconds

const RecentTracks = () => {
  const { loading: loadingToken, useApi } = useSpotifyApi()
  const [tracks, setTracks] = useState<PlayHistory[]>()
  const [currentTrack, setCurrentTrack] = useState<null | Track>(null)
  const [loading, setLoading] = useState(loadingToken)

  const fetchCurrentTrack = useCallback(async () => {
    try {
      const current = await useApi?.player.getCurrentlyPlayingTrack()
      if (current?.item && 'album' in current.item) {
        setCurrentTrack(current.item as Track)
      }
    } catch (error) {
      console.error('Error fetching currently played tracks:', error)
    }
  }, [useApi])

  const fetchRecentTracks = useCallback(async () => {
    try {
      const recentTracks = await useApi?.player.getRecentlyPlayedTracks()
      setTracks(recentTracks?.items)
    } catch (error) {
      console.error('Error fetching recently played tracks:', error)
    }
  }, [useApi])

  useEffect(() => {
    const fetchData = async () => {
      await Promise.all([fetchCurrentTrack(), fetchRecentTracks()])
      setLoading(false)
    }

    // Initial fetch
    setLoading(true)
    fetchData()

    // Set up interval for periodic refresh
    const intervalId = setInterval(fetchData, REFRESH_INTERVAL)

    // Cleanup interval on unmount
    return () => clearInterval(intervalId)
  }, [fetchCurrentTrack, fetchRecentTracks])

  if (loading) {
    return <ActivityIndicator size="large" />
  }

  return (
    <View>
      {currentTrack && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Currently Playing</Text>
          <View style={styles.trackContainer}>
            <Image source={{ uri: currentTrack.album.images[0].url }} style={styles.albumCover} />
            <View>
              <Text style={styles.trackName}>{currentTrack.name}</Text>
              <Text>{currentTrack.artists.map((artist) => artist.name).join(', ')}</Text>
            </View>
          </View>
        </View>
      )}
      <Text style={styles.sectionTitle}>Recently Played Tracks</Text>
      <FlatList
        data={tracks}
        keyExtractor={(item) => item.track.id}
        renderItem={({ item }) => (
          <View style={styles.trackContainer}>
            <Image source={{ uri: item.track.album.images[0].url }} style={styles.albumCover} />
            <View>
              <Text style={styles.trackName}>{item.track.name}</Text>
              <Text>{item.track.artists.map((artist) => artist.name).join(', ')}</Text>
            </View>
          </View>
        )}
      />
    </View>
  )
}

const styles = StyleSheet.create({
  albumCover: {
    borderRadius: 5,
    height: 50,
    marginRight: 10,
    width: 50,
  },
  section: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  trackContainer: {
    alignItems: 'center',
    flexDirection: 'row',
    marginBottom: 10,
  },
  trackName: {
    fontWeight: 'bold',
  },
})

export default RecentTracks
