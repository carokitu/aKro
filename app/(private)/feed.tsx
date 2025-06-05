/* eslint-disable @typescript-eslint/no-require-imports */
import { CircleCheck, EyeOff, UserPlus } from 'lucide-react-native'
import { useCallback, useEffect, useState } from 'react'
import { ImageBackground, StyleSheet, View } from 'react-native'
import { GestureHandlerRootView } from 'react-native-gesture-handler'
import { SafeAreaView } from 'react-native-safe-area-context'

import { router } from 'expo-router'

import { useFeed, useUser } from '../../hooks'
import { type Post as TPost, type User } from '../../models'
import { Drawer } from '../../src'
import { PostsList } from '../../src/components'
import { Avatar, Button, IconButton, Text, Title } from '../../src/system'
import { theme } from '../../src/theme'
import { client } from '../../supabase'

const FeedHeader = ({ user }: { user: User }) => (
  <View style={styles.header}>
    <Avatar avatar={user.avatar_url} />
    <IconButton Icon={UserPlus} onPress={() => router.push('/search-users')} size="sm" variant="tertiary" />
  </View>
)

const FooterComponent = () => (
  <ImageBackground
    imageStyle={{ borderRadius: theme.radius.medium }}
    resizeMode="cover"
    source={require('../../assets/images/feedFooter.png')}
    style={styles.footer}
  >
    <View style={styles.footerContent}>
      <EyeOff color={theme.text.base.invert} size={36} />
      <Title color="invert" size="large">
        Tu as fait le tour du feed
      </Title>
      <Text color="invert" size="large">
        Ajoute des amis pour connaître leurs pépites
      </Text>
    </View>
    <Button
      beforeElement={<UserPlus color={theme.text.base.invert} size={24} />}
      fullWidth
      onPress={() => router.push('/search-users')}
      size="lg"
      style={styles.footerButton}
      title="Ajouter des amis"
    />
  </ImageBackground>
)

const Feed = () => {
  const { user } = useUser()
  const { newPostKey } = useFeed()
  const [closeDrawer, setCloseDrawer] = useState(false)
  const [newPostFromUser, setNewPostFromUser] = useState(false)
  const [hasNewPostsKey, setHasNewPostsKey] = useState(0)

  const fetchPosts = useCallback(
    async ({ limit, offset }: { limit: number; offset: number }): Promise<{ data: TPost[]; error: Error | null }> => {
      if (!user) {
        return { data: [], error: new Error('User not found') }
      }

      const { data, error } = await client.rpc('get_user_feed', {
        p_limit: limit,
        p_offset: offset,
        p_user_id: user.id,
      })

      return { data: data as TPost[], error }
    },
    [user],
  )

  useEffect(() => {
    // newPostKey is only for current user posts
    // => this is why we close the drawer

    if (newPostKey > 0 && newPostKey !== hasNewPostsKey) {
      setCloseDrawer(true)
      setNewPostFromUser(true)
      setHasNewPostsKey(newPostKey)
    }
  }, [hasNewPostsKey, newPostKey, setNewPostFromUser])

  // Add effect for timeout on newPostFromUser
  useEffect(() => {
    if (newPostFromUser) {
      setTimeout(() => {
        setNewPostFromUser(false)
      }, 3000)
    }
  }, [newPostFromUser])

  if (!user) {
    return null
  }

  const onReset = () => {
    setNewPostFromUser(false)
    setCloseDrawer(true)
  }

  return (
    <SafeAreaView edges={['top']} style={styles.container}>
      <GestureHandlerRootView>
        <FeedHeader user={user} />
        <PostsList
          fetchPosts={fetchPosts}
          ListFooterComponent={FooterComponent}
          loadNewPost
          onScrollBeginDrag={() => setCloseDrawer(true)}
          toast={
            newPostFromUser
              ? { Icon: CircleCheck, message: 'Reco postée', onPress: onReset, variant: 'success' }
              : undefined
          }
          user={user}
        />
        <Drawer close={closeDrawer} setClose={setCloseDrawer} />
      </GestureHandlerRootView>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: theme.surface.base.default,
    flex: 1,
  },
  footer: {
    alignItems: 'stretch',
    borderRadius: theme.radius.medium,
    height: 430,
    justifyContent: 'center',
    marginBottom: theme.spacing[2800],
    marginHorizontal: theme.spacing[200],
    padding: theme.spacing[200],
  },
  footerButton: {
    marginTop: theme.spacing[800],
  },
  footerContent: {
    alignItems: 'center',
    gap: theme.spacing[100],
  },
  header: {
    backgroundColor: theme.surface.base.default,
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: theme.spacing[400],
    paddingVertical: theme.spacing[100],
  },
})

export default Feed
