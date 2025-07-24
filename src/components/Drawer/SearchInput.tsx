import { SearchIcon } from 'lucide-react-native'
import { StyleSheet, TextInput, View } from 'react-native'

import type BottomSheet from '@gorhom/bottom-sheet'

import { theme } from '../../theme'

export const SearchInput = ({
  bottomSheetRef,
  query,
  setQuery,
}: {
  bottomSheetRef: React.RefObject<BottomSheet>
  query: string
  setQuery: (query: string) => void
}) => {
  const handleInputFocus = () => {
    bottomSheetRef.current?.snapToIndex(2)
  }

  return (
    <View style={styles.searchContainer}>
      <SearchIcon color={theme.text.base.tertiary} size={20} />
      <TextInput
        onChangeText={setQuery}
        onFocus={handleInputFocus}
        placeholder="Rechercher"
        style={styles.input}
        value={query}
      />
    </View>
  )
}

const styles = StyleSheet.create({
  input: {
    fontSize: theme.fontSize.lg,
    fontWeight: theme.weight.medium,
    width: '100%',
  },
  searchContainer: {
    alignItems: 'center',
    backgroundColor: theme.surface.base.secondary,
    borderRadius: theme.radius.base,
    flexDirection: 'row',
    gap: theme.spacing['200'],
    marginBottom: theme.spacing['300'],
    marginTop: theme.spacing['200'],
    padding: theme.padding['400'],
  },
})
