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

const handleDismiss = () => {
  Keyboard.dismiss()
}

const Avatar = () => {
  const [avatarUrl, setAvatarUrl] = useState<null | string>(null)
  const [bio, setBio] = useState<null | string>(null)
  const [error, setError] = useState<null | string>(null)
  const { createUser, updateUserData } = useUserRegistration()

  const pickImage = useCallback(async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync()

    if (status !== 'granted') {
      setError('Désolé, nous avons besoin des permissions pour accéder à votre bibliothèque !')

      const { status: newStatus } = await ImagePicker.requestMediaLibraryPermissionsAsync()

      if (newStatus === 'granted') {
        setError(null)
      }

      return
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      allowsEditing: true,
      aspect: [1, 1],
    })

    if (!result.canceled && result.assets && result.assets.length > 0) {
      setAvatarUrl(result.assets[0].uri)
    }
  }, [])

  const handleNext = async () => {
    updateUserData({ avatar_url: avatarUrl, bio: bio ?? null })

    try {
      await createUser()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Une erreur est survenue lors de la création du compte')
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
          maxLength={150}
          multiline
          numberOfLines={4}
          onChangeText={setBio}
          placeholder="Mon algorithme de recommandation préféré ? Mes amis"
          placeholderTextColor={theme.text.disabled}
          style={styles.input}
        />
        <View style={styles.buttonContainer}>
          <Button fullWidth onPress={handleNext} size="lg" style={styles.button} title="Suivant" />
        </View>
      </SafeAreaView>
    </TouchableWithoutFeedback>
  )
}

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
    marginTop: theme.spacing[400],
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
    marginTop: theme.spacing[400],
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

export default Avatar
