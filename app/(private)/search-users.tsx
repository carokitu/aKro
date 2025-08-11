import { Search, UserX } from 'lucide-react-native'
import { useCallback, useEffect, useRef, useState } from 'react'
import { Keyboard, Platform, StyleSheet, TextInput, TouchableWithoutFeedback, View } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'

import { debounce } from 'lodash'

import { useUser } from '../../hooks'
import { type UserWithStats } from '../../models/custom'
import { NavBar } from '../../src/components'
import { UserList } from '../../src/components/Lists'
import { Text, Title } from '../../src/system'
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
  const debounceRef = useRef<(val: string) => void>(() => {})

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
      <SafeAreaView pointerEvents="box-none" style={styles.area}>
        <NavBar title="Ajoute des amis" />
        <View style={styles.container}>
          <View style={styles.search}>
            <Search color={theme.text.base.tertiary} size={theme.fontSize.lg} />
            <TextInput
              autoFocus
              maxLength={40}
              onChangeText={handleChange}
              placeholder="Rechercher un utilisateur"
              placeholderTextColor={theme.text.disabled}
              returnKeyType="done"
              style={styles.input}
              value={query}
            />
          </View>
          <Users query={debouncedQuery} />
        </View>
      </SafeAreaView>
    </TouchableWithoutFeedback>
  )
}

export default SearchUsers

const styles = StyleSheet.create({
  area: {
    backgroundColor: theme.surface.base.default,
    flex: 1,
  },
  container: {
    flex: 1,
    marginHorizontal: theme.spacing[400],
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
    marginBottom: theme.spacing[600],
    marginTop: theme.spacing[200],
    paddingHorizontal: theme.padding[400],
    alignItems: 'center',
    paddingVertical: Platform.OS === 'ios' ? theme.padding[400] : theme.padding[200],
  },
})
