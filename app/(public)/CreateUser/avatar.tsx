import { CircleX, ImageUp } from 'lucide-react-native'
import { useCallback, useState } from 'react'
import {
  Image,
  Keyboard,
  SafeAreaView,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
} from 'react-native'

import * as ImagePicker from 'expo-image-picker'

import { useUserRegistration } from '../../../hooks'
import { Button, H1, Label, Text } from '../../../src/system'
import { theme } from '../../../src/theme'

const MAX_LINES = 4
const MAX_BIO_LENGTH = 150

const handleDismiss = () => Keyboard.dismiss()

const Avatar = () => {
  const [avatarUrl, setAvatarUrl] = useState<null | string>(null)
  const [bio, setBio] = useState<string>('')
  const [error, setError] = useState<null | string>(null)
  const { createUser } = useUserRegistration()

  const handleImagePermissions = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync()

    if (status !== 'granted') {
      setError('Nous avons besoin de votre permission pour accéder à votre bibliothèque.')
      return false
    }

    return true
  }

  const pickImage = useCallback(async () => {
    const granted = await handleImagePermissions()

    if (!granted) {
      return
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      allowsEditing: true,
      aspect: [1, 1],
    })

    if (!result.canceled && result.assets.length > 0) {
      setAvatarUrl(result.assets[0].uri)
      setError(null)
    }
  }, [])

  const handleBioChange = (text: string) => {
    const lineCount = text.split('\n').length

    if (lineCount <= MAX_LINES) {
      setBio(text)
    }
  }

  const handleNext = async () => {
    try {
      await createUser({
        avatar_url: avatarUrl,
        bio: bio.trim().slice(0, MAX_BIO_LENGTH) || null,
      })
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Une erreur est survenue lors de la création du compte.')
    }
  }

  return (
    <TouchableWithoutFeedback onPress={handleDismiss}>
      <SafeAreaView style={styles.container}>
        <H1 style={styles.title}>Pimpe ton profil</H1>
        <TouchableOpacity onPress={pickImage} style={styles.optionContainer}>
          <View style={styles.avatarContainer}>
            {avatarUrl ? (
              <Image source={{ uri: avatarUrl }} style={styles.avatarImage} />
            ) : (
              <ImageUp color={theme.text.base.default} size={40} />
            )}
          </View>
          <Label size="medium" style={styles.label}>
            Choisir une photo
          </Label>
        </TouchableOpacity>
        {error && (
          <View style={styles.errorContainer}>
            <CircleX color={theme.text.danger.default} size={theme.fontSize.sm} style={styles.icon} />
            <Text color="danger">{error}</Text>
          </View>
        )}
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
        <View style={styles.buttonContainer}>
          <Button fullWidth onPress={handleNext} size="lg" style={styles.button} title="Suivant" />
        </View>
      </SafeAreaView>
    </TouchableWithoutFeedback>
  )
}

export default Avatar

const styles = StyleSheet.create({
  avatarContainer: {
    alignItems: 'center',
    backgroundColor: theme.surface.base.secondary,
    borderRadius: theme.radius.small,
    height: 110,
    justifyContent: 'center',
    marginTop: theme.spacing[600],
    overflow: 'hidden',
    width: 100,
  },
  avatarImage: {
    height: '100%',
    width: '100%',
  },
  bio: {
    marginTop: theme.spacing[800],
    textAlign: 'left',
    width: '100%',
  },
  button: {
    marginBottom: theme.spacing[200],
  },
  buttonContainer: {
    marginTop: 'auto',
    width: '100%',
  },
  container: {
    alignItems: 'center',
    flex: 1,
    marginHorizontal: theme.spacing[400],
  },
  errorContainer: {
    alignItems: 'flex-start',
    alignSelf: 'flex-start',
    flexDirection: 'row',
    gap: theme.spacing['100'],
    textAlign: 'center',
    verticalAlign: 'middle',
    width: '100%',
  },
  icon: {
    marginTop: theme.spacing[50],
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
  label: {
    marginVertical: theme.spacing[400],
  },
  optionContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    marginTop: theme.spacing[1400],
    textAlign: 'center',
  },
})
