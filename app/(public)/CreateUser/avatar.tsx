import { CircleX } from 'lucide-react-native'
import { useState } from 'react'
import { Keyboard, StyleSheet, TouchableWithoutFeedback, View } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'

import type * as ImagePicker from 'expo-image-picker'

import { useUser } from '../../../hooks'
import { NavBar } from '../../../src'
import { EditAvatar } from '../../../src/components/ActionButtons'
import { Button, H1, Input, MAX_INPUT_LENGTH, Text } from '../../../src/system'
import { theme } from '../../../src/theme'
import { saveImage } from '../../../src/utils/image'

const handleDismiss = () => Keyboard.dismiss()

const Avatar = () => {
  const [bio, setBio] = useState<string>('')
  const [error, setError] = useState<null | string>(null)
  const [image, setImage] = useState<ImagePicker.ImagePickerAsset | null>(null)
  const [uploading, setUploading] = useState(false)

  const { createUser, userData } = useUser()

  const handleNext = async () => {
    const avatarUrl = image && (await saveImage(image, userData.username))

    try {
      await createUser({
        avatar_url: avatarUrl,
        bio: bio.trim().slice(0, MAX_INPUT_LENGTH) || null,
      })
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Une erreur est survenue lors de la création du compte.')
    }
  }

  return (
    <TouchableWithoutFeedback onPress={handleDismiss}>
      <SafeAreaView style={styles.container}>
        <NavBar />
        <View style={styles.formContainer}>
          <H1 style={styles.title}>Pimpe ton profil</H1>
          <EditAvatar onUpdateAvatar={setImage} setUploading={setUploading} uploading={uploading} />
          <Input setValue={setBio} title="Bio" value={bio} />
          {error && (
            <View style={styles.errorContainer}>
              <CircleX color={theme.text.danger.default} size={theme.fontSize.sm} style={styles.icon} />
              <Text color="danger">{error}</Text>
            </View>
          )}
          <View style={styles.buttonContainer}>
            <Button
              disabled={uploading}
              fullWidth
              onPress={handleNext}
              size="lg"
              style={styles.button}
              title="Suivant"
            />
          </View>
        </View>
      </SafeAreaView>
    </TouchableWithoutFeedback>
  )
}

export default Avatar

const styles = StyleSheet.create({
  button: {
    marginBottom: theme.spacing[200],
  },
  buttonContainer: {
    marginTop: 'auto',
    width: '100%',
  },
  container: {
    flex: 1,
  },
  errorContainer: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: theme.spacing['100'],
    marginTop: theme.spacing[200],
  },
  formContainer: {
    alignItems: 'center',
    flex: 1,
    marginHorizontal: theme.spacing[400],
  },
  icon: {
    height: '100%',
    width: '100%',
  },
  title: {
    textAlign: 'center',
  },
})
