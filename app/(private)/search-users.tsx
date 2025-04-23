import { useEffect, useState } from 'react'
import { FlatList, StyleSheet, TextInput, TouchableOpacity, View } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'

import { type User } from '../../models'
import { Avatar, H1, Label, Text } from '../../src/system'
import { theme } from '../../src/theme'
import { client } from '../../supabase'

const SearchUsers = () => {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<User[]>([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    const fetchUsers = async () => {
      setLoading(true)

      const { data, error } = await client
        .from('users')
        .select('id, username, name, avatar_url')
        .ilike('username', `%${query}%`)
        .limit(20)

      if (!error && data) {
        setResults(data as User[])
      }

      setLoading(false)
    }

    const delayDebounce = setTimeout(fetchUsers, 300) // debounce
    return () => clearTimeout(delayDebounce)
  }, [query])

  const renderItem = ({ item }: { item: User }) => (
    <TouchableOpacity style={styles.userCard}>
      <Avatar avatar={item.avatar_url} />
      <View style={styles.info}>
        <Label>{item.username}</Label>
        <Text color="tertiary" size="small">
          {item.name}
        </Text>
      </View>
    </TouchableOpacity>
  )

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <H1>Ajoute des amis</H1>
        <Label color="tertiary" size="large">
          Connecte toi avec ton entourage
        </Label>
      </View>
      <TextInput
        autoFocus
        onChangeText={setQuery}
        placeholder="Rechercher un utilisateur"
        placeholderTextColor={theme.text.disabled}
        style={styles.input}
        value={query}
      />
      <FlatList
        data={results}
        keyExtractor={(item) => item.id}
        ListEmptyComponent={
          query.length >= 2 && !loading ? <Text style={styles.emptyText}>Aucun utilisateur trouvé</Text> : null
        }
        renderItem={renderItem}
        style={styles.list}
      />
    </SafeAreaView>
  )
}

export default SearchUsers

const styles = StyleSheet.create({
  container: {
    backgroundColor: theme.surface.base.default,
    flex: 1,
    paddingHorizontal: theme.spacing[400],
  },
  emptyText: {
    marginTop: theme.spacing[800],
    textAlign: 'center',
  },
  header: {
    alignItems: 'center',
    gap: theme.spacing[200],
    justifyContent: 'center',
    marginTop: theme.spacing['1200'],
  },
  info: {
    marginLeft: theme.spacing[300],
  },
  input: {
    backgroundColor: theme.surface.base.secondary,
    borderRadius: theme.radius.base,
    fontSize: theme.fontSize.md,
    marginVertical: theme.spacing[400],
    padding: theme.spacing[300],
  },
  list: {
    flex: 1,
  },
  userCard: {
    alignItems: 'center',
    flexDirection: 'row',
    marginBottom: theme.spacing[300],
  },
})
