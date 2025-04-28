import { useActionSheet } from '@expo/react-native-action-sheet'
import { ChevronLeft, Search } from 'lucide-react-native'
import { useCallback, useEffect, useRef, useState } from 'react'
import {
  FlatList,
  Keyboard,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'

import { router } from 'expo-router'

import { debounce } from 'lodash'

import { useUser } from '../../hooks'
import { type User as TUser } from '../../models'
import { Avatar, Button, H1, IconButton, Label, Text } from '../../src/system'
import { theme } from '../../src/theme'
import { client } from '../../supabase'

type UserWithStats = Pick<TUser, 'avatar_url' | 'id' | 'name' | 'username'> & {
  follows_me: boolean
  is_followed: boolean
  mutual_count: number
}

type UserListProps = {
  query: string
}

const UserList = ({ query }: UserListProps) => {
  const { user: currentUser } = useUser()
  const [results, setResults] = useState<UserWithStats[]>([])
  const [loading, setLoading] = useState(false)
  const [followLoading, setFollowLoading] = useState<null | string>(null)
  const { showActionSheetWithOptions } = useActionSheet()

  const fetchUsers = useCallback(async () => {
    if (!currentUser) {
      return
    }

    setLoading(true)

    try {
      const { data: usersData, error: usersError } = await client.rpc('search_users_with_stats', {
        p_query: query,
        p_user_id: currentUser.id,
      })

      if (usersError) {
        console.error('Erreur lors de la recherche utilisateurs:', usersError)
        setLoading(false)
        return
      }

      setResults(usersData as UserWithStats[])
    } catch (error) {
      console.error('Erreur:', error)
    } finally {
      setLoading(false)
    }
  }, [currentUser, query])

  useEffect(() => {
    fetchUsers()
  }, [fetchUsers, query])

  const handleFollow = async (userId: string) => {
    if (!currentUser) {
      return
    }

    setFollowLoading(userId)

    try {
      const { error } = await client.from('follows').insert({
        created_at: new Date().toISOString(),
        followed_id: userId,
        follower_id: currentUser.id,
      })

      if (error) {
        console.error('Erreur lors du suivi:', error)
        return
      }

      setResults((prevResults) =>
        prevResults.map((user) => (user.id === userId ? { ...user, is_followed: true } : user)),
      )
    } catch (error) {
      console.error('Erreur lors du suivi:', error)
    } finally {
      setFollowLoading(null)
    }
  }

  const handleUnfollow = async (userId: string) => {
    if (!currentUser) {
      return
    }

    const unfollow = async () => {
      setFollowLoading(userId)

      try {
        const { error } = await client
          .from('follows')
          .delete()
          .match({ followed_id: userId, follower_id: currentUser.id })

        if (error) {
          console.error('Erreur lors du désabonnement:', error)
          return
        }

        setResults((prevResults) =>
          prevResults.map((user) => (user.id === userId ? { ...user, is_followed: false } : user)),
        )
      } catch (error) {
        console.error('Erreur lors du désabonnement:', error)
      } finally {
        setFollowLoading(null)
      }
    }

    showActionSheetWithOptions(
      {
        cancelButtonIndex: 1,
        destructiveButtonIndex: 0,
        options: ['Se désabonner', 'Annuler'],
      },
      (index) => {
        if (index === 0) {
          unfollow()
        }
      },
    )
  }

  const renderItem = ({ item }: { item: UserWithStats }) => {
    const { avatar_url, follows_me, id, is_followed, mutual_count, name, username } = item
    const info = mutual_count ? `${name} • ${mutual_count} amis en commun` : name

    return (
      <TouchableOpacity onPress={() => Keyboard.dismiss()} style={styles.userCard}>
        <View style={styles.userCardContent}>
          <Avatar avatar={avatar_url} size="lg" />
          <View style={styles.info}>
            <Label ellipsizeMode="tail" numberOfLines={1} style={styles.username}>
              {username}
            </Label>
            <Text color="secondary" ellipsizeMode="tail" numberOfLines={1} size="small" style={styles.name}>
              {info}
            </Text>
          </View>
        </View>
        {is_followed ? (
          <Button
            disabled={followLoading === id}
            onPress={() => {
              handleUnfollow(id)
              Keyboard.dismiss()
            }}
            size="sm"
            title="Ne plus suivre"
            variant="secondary"
          />
        ) : (
          <Button
            disabled={followLoading === id}
            onPress={() => {
              handleFollow(id)
              Keyboard.dismiss()
            }}
            size="sm"
            title={follows_me ? 'Suivre en retour' : 'Suivre'}
          />
        )}
      </TouchableOpacity>
    )
  }

  return (
    <FlatList
      data={results}
      keyboardShouldPersistTaps="handled"
      keyExtractor={(item) => item.id}
      ListEmptyComponent={loading ? null : <Text style={styles.emptyText}>Aucun utilisateur trouvé</Text>}
      renderItem={renderItem}
      style={styles.list}
    />
  )
}

const SearchUsers = () => {
  const [query, setQuery] = useState('')
  const [debouncedQuery, setDebouncedQuery] = useState('')
  const debounceRef = useRef<(val: string) => void>()

  useEffect(() => {
    debounceRef.current = debounce((val: string) => {
      setDebouncedQuery(val)
    }, 200)
  }, [])

  const handleChange = (text: string) => {
    setQuery(text)
    debounceRef.current?.(text)
  }

  return (
    <TouchableWithoutFeedback accessible={false} onPress={() => Keyboard.dismiss()}>
      <SafeAreaView pointerEvents="box-none" style={styles.container}>
        <View style={styles.title}>
          <IconButton
            Icon={ChevronLeft}
            onPress={() => router.back()}
            size="md"
            style={styles.backButton}
            variant="secondary"
          />
          <H1>Ajoute des amis</H1>
        </View>
        <Text color="tertiary" size="large" style={styles.subtitle}>
          Connecte toi avec ton entourage
        </Text>
        <View style={styles.search}>
          <Search color={theme.text.base.tertiary} size={theme.fontSize.lg} />
          <TextInput
            autoFocus
            maxLength={40}
            onChangeText={handleChange}
            placeholder="Rechercher un utilisateur"
            placeholderTextColor={theme.text.disabled}
            style={styles.input}
            value={query}
          />
        </View>
        <UserList query={debouncedQuery} />
      </SafeAreaView>
    </TouchableWithoutFeedback>
  )
}

export default SearchUsers

const styles = StyleSheet.create({
  backButton: {
    left: 0,
    position: 'absolute',
  },
  container: {
    backgroundColor: theme.surface.base.default,
    flex: 1,
    paddingHorizontal: theme.spacing[400],
  },
  emptyText: {
    marginTop: theme.spacing[800],
    textAlign: 'center',
  },
  info: {
    flex: 1,
    marginHorizontal: theme.spacing[300],
    overflow: 'hidden',
  },
  input: {
    flex: 1,
    fontSize: theme.fontSize.md,
    fontWeight: theme.weight.medium,
    marginLeft: theme.spacing[200],
    overflow: 'hidden',
    width: '100%',
  },
  list: {
    flex: 1,
  },
  name: {
    flexShrink: 1,
  },
  search: {
    backgroundColor: theme.surface.base.secondary,
    borderRadius: theme.radius.base,
    display: 'flex',
    flexDirection: 'row',
    marginVertical: theme.spacing[600],
    paddingHorizontal: theme.padding[400],
    paddingVertical: theme.padding[400],
  },
  subtitle: {
    marginTop: theme.spacing[200],
    textAlign: 'center',
    width: '100%',
  },
  title: {
    alignItems: 'center',
    gap: theme.spacing[200],
    justifyContent: 'center',
    marginTop: theme.spacing['1000'],
  },
  userCard: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: theme.spacing[300],
    overflow: 'hidden',
  },
  userCardContent: {
    alignItems: 'center',
    flex: 1,
    flexDirection: 'row',
  },
  username: {
    flexShrink: 1,
  },
})
