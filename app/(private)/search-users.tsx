import { ChevronLeft, Search, UserX } from 'lucide-react-native'
import { useCallback, useEffect, useRef, useState } from 'react'
import { Keyboard, StyleSheet, TextInput, TouchableWithoutFeedback, View } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'

import { router } from 'expo-router'

import { debounce } from 'lodash'

import { useUser } from '../../hooks'
import { type UserWithStats } from '../../models/custom'
import { UserList } from '../../src/components/Lists'
import { H1, IconButton, Text, Title } from '../../src/system'
import { theme } from '../../src/theme'
import { client } from '../../supabase'

type UserListProps = {
  query: string
}

const EmptyList = () => (
  <View style={styles.emptyList}>
    <UserX color={theme.text.base.secondary} size={33} style={styles.emptyIcon} />
    <Title color="secondary">Aucun résultat</Title>
    <Text>Essaye avec un autre nom utilisateur</Text>
  </View>
)

const Users = ({ query }: UserListProps) => {
  const { user: currentUser } = useUser()
  const [users, setUsers] = useState<UserWithStats[]>([])
  const [loading, setLoading] = useState(false)

  const fetchUsers = useCallback(async () => {
    if (!currentUser) {
      return { error: new Error('Current user not found') }
    }

    setLoading(true)

    const { data: usersData, error: usersError } = await client.rpc('search_users_with_stats', {
      p_query: query,
      p_user_id: currentUser.id,
    })

    if (usersError) {
      setLoading(false)
      return { error: usersError }
    }

    setUsers(usersData as UserWithStats[])
    setLoading(false)

    return { error: null }
  }, [currentUser, query])

  useEffect(() => {
    fetchUsers()
  }, [fetchUsers, query])

  if (!currentUser) {
    return null
  }

  return (
    <UserList
      currentUser={currentUser}
      fetch={fetchUsers}
      infinieScroll={false}
      ListEmptyComponent={loading ? null : <EmptyList />}
      loading={loading}
      users={users}
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
      <View style={styles.container}>
        <SafeAreaView pointerEvents="box-none" style={styles.area}>
          <View style={styles.title}>
            <IconButton
              Icon={ChevronLeft}
              onPress={() => router.back()}
              size="md"
              style={styles.backButton}
              variant="tertiary"
            />
            <H1>Ajoute des amis</H1>
          </View>
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
          <Users query={debouncedQuery} />
        </SafeAreaView>
      </View>
    </TouchableWithoutFeedback>
  )
}

export default SearchUsers

const styles = StyleSheet.create({
  area: {
    flex: 1,
  },
  backButton: {
    left: 0,
    position: 'absolute',
  },
  container: {
    backgroundColor: theme.surface.base.default,
    flex: 1,
    paddingHorizontal: theme.spacing[400],
  },
  emptyIcon: {
    marginBottom: theme.spacing[200],
  },
  emptyList: {
    alignItems: 'center',
    gap: theme.spacing[200],
    justifyContent: 'center',
    paddingVertical: theme.spacing[400],
  },
  input: {
    flex: 1,
    fontSize: theme.fontSize.md,
    fontWeight: theme.weight.medium,
    marginLeft: theme.spacing[200],
    overflow: 'hidden',
    width: '100%',
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
  title: {
    alignItems: 'center',
    gap: theme.spacing[200],
    justifyContent: 'center',
    marginTop: theme.spacing['200'],
  },
})
