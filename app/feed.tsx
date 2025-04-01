import { ActivityIndicator, StyleSheet, View } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'

import { useSpotifyApi } from '../hooks'
import { Drawer } from '../src'

const Feed = () => {
  const { loading } = useSpotifyApi()

  if (loading) {
    return <ActivityIndicator size="large" />
  }

  return (
    <SafeAreaView edges={['top', 'bottom']} style={styles.container}>
      <View style={styles.content}>
        <Drawer />
      </View>
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
