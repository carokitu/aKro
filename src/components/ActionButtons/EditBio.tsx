import { StyleSheet, TextInput } from 'react-native'

import { Label } from '../../system'
import { theme } from '../../theme'

const MAX_LINES = 2
export const MAX_BIO_LENGTH = 150

type Props = {
  bio: string
  setBio: (bio: string) => void
}

export const EditBio = ({ bio, setBio }: Props) => {
  const handleBioChange = (text: string) => {
    const lineCount = text.split('\n').length

    if (lineCount <= MAX_LINES) {
      setBio(text)
    }
  }

  return (
    <>
      <Label size="large" style={styles.bio}>
        Bio
      </Label>
      <TextInput
        maxLength={MAX_BIO_LENGTH}
        multiline
        numberOfLines={MAX_LINES}
        onChangeText={handleBioChange}
        placeholder="Mon algorithme de recommandation préféré ? Mes amis"
        placeholderTextColor={theme.text.disabled}
        style={styles.input}
        value={bio}
      />
    </>
  )
}

const styles = StyleSheet.create({
  bio: {
    marginTop: theme.spacing[800],
    textAlign: 'left',
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
    paddingHorizontal: theme.padding['600'],
    paddingVertical: theme.padding['400'],
    width: '100%',
  },
})
