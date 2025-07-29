import { SearchIcon } from 'lucide-react-native'
import { forwardRef, useImperativeHandle, useRef } from 'react'
import { StyleSheet, TextInput, View } from 'react-native'

import type BottomSheet from '@gorhom/bottom-sheet'

import { theme } from '../../theme'

export type SearchInputRef = {
  focus: () => void
}

export const SearchInput = forwardRef<
  SearchInputRef,
  {
    autoFocus?: boolean
    bottomSheetRef?: React.RefObject<BottomSheet | null>
    query: string
    setQuery: (query: string) => void
  }
>(({ autoFocus = false, bottomSheetRef, query, setQuery }, ref) => {
  const textInputRef = useRef<TextInput>(null)

  useImperativeHandle(ref, () => ({
    focus: () => {
      textInputRef.current?.focus()
    },
  }))

  const handleInputFocus = () => {
    bottomSheetRef?.current?.snapToIndex(1)
  }

  return (
    <View style={styles.searchContainer}>
      <SearchIcon color={theme.text.base.tertiary} size={20} />
      <TextInput
        autoFocus={autoFocus}
        onChangeText={setQuery}
        onFocus={handleInputFocus}
        placeholder="Rechercher"
        ref={textInputRef}
        style={styles.input}
        value={query}
      />
    </View>
  )
})

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
