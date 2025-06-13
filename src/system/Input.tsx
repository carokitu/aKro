import { StyleSheet, TextInput, View } from 'react-native'

import { theme } from '../theme'
import { Label } from './Text'

const MAX_LINES = 2
export const MAX_INPUT_LENGTH = 150

type Props = {
  placeholder?: string
  setValue: (bio: string) => void
  title: string
  value: string
}

export const Input = ({
  placeholder = 'Mon algorithme de recommandation préféré ? Mes amis',
  setValue,
  title,
  value,
}: Props) => {
  const handleBioChange = (text: string) => {
    const lineCount = text.split('\n').length

    if (lineCount <= MAX_LINES) {
      setValue(text)
    }
  }

  return (
    <View style={styles.container}>
      <Label size="large" style={styles.bio}>
        {title}
      </Label>
      <TextInput
        maxLength={MAX_INPUT_LENGTH}
        multiline
        numberOfLines={MAX_LINES}
        onChangeText={handleBioChange}
        placeholder={placeholder}
        placeholderTextColor={theme.text.disabled}
        style={styles.input}
        value={value}
      />
    </View>
  )
}

const styles = StyleSheet.create({
  bio: {
    marginTop: theme.spacing[800],
    textAlign: 'left',
  },
  container: {
    width: '100%',
  },
  input: {
    backgroundColor: theme.surface.base.secondary,
    borderRadius: theme.radius.base,
    fontSize: theme.fontSize.lg,
    fontWeight: theme.weight.medium,
    height: 100,
    marginBottom: theme.spacing['300'],
    marginTop: theme.spacing['200'],
    paddingHorizontal: theme.padding['400'],
    paddingVertical: theme.padding['400'],
  },
})
