import { CircleX } from 'lucide-react-native'
import { useState } from 'react'
import { Keyboard, SafeAreaView, StyleSheet, TextInput, TouchableWithoutFeedback, View } from 'react-native'

import type * as ImagePicker from 'expo-image-picker'

import { useUserRegistration } from '../../../hooks'
import { EditAvatar } from '../../../src/components/ActionButtons'
import { Button, H1, Label, Text } from '../../../src/system'
import { theme } from '../../../src/theme'
import { saveImage } from '../../../src/utils/image'

const MAX_LINES = 2
const MAX_BIO_LENGTH = 150

const handleDismiss = () => Keyboard.dismiss()

const Avatar = () => {
  const [bio, setBio] = useState<string>('')
  const [error, setError] = useState<null | string>(null)
  const [image, setImage] = useState<ImagePicker.ImagePickerAsset | null>(null)
  const [uploading, setUploading] = useState(false)

  const { createUser, userData } = useUserRegistration()

  const handleBioChange = (text: string) => {
    const lineCount = text.split('\n').length

    if (lineCount <= MAX_LINES) {
      setBio(text)
    }
  }

  const handleNext = async () => {
    const avatarUrl = image && (await saveImage(image, userData.username))

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
        <EditAvatar onUpdateAvatar={setImage} setUploading={setUploading} uploading={uploading} />
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
        {error && (
          <View style={styles.errorContainer}>
            <CircleX color={theme.text.danger.default} size={theme.fontSize.sm} style={styles.icon} />
            <Text color="danger">{error}</Text>
          </View>
        )}
        <View style={styles.buttonContainer}>
          <Button disabled={uploading} fullWidth onPress={handleNext} size="lg" style={styles.button} title="Suivant" />
        </View>
      </SafeAreaView>
    </TouchableWithoutFeedback>
  )
}

export default Avatar

const styles = StyleSheet.create({
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
    alignItems: 'center',
    flexDirection: 'row',
    gap: theme.spacing['100'],
    marginTop: theme.spacing[200],
  },
  icon: {
    height: '100%',
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
  title: {
    marginTop: theme.spacing[1400],
    textAlign: 'center',
  },
})
