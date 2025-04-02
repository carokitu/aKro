import { ActivityIndicator, ScrollView, StyleSheet } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'

import { useSpotifyApi } from '../hooks'
import { Drawer } from '../src'
import { RecentTracks } from '../src/components/Drawer/Header/RecentTracks'

const Feed = () => {
  const { loading } = useSpotifyApi()

  if (loading) {
    return <ActivityIndicator size="large" />
  }

  return (
    <SafeAreaView edges={['top']} style={styles.container}>
      <ScrollView style={styles.content}>
        <RecentTracks />
        <RecentTracks />
        <RecentTracks />
        <RecentTracks />
        <RecentTracks />
        <RecentTracks />
        <RecentTracks />
        <RecentTracks />
      </ScrollView>
      <Drawer />
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    bottom: 0,
    left: 0,
    position: 'absolute',
    right: 0,
    top: 0,
  },
})

export default Feed
