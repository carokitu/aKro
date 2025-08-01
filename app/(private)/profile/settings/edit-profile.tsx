import { useCallback, useEffect, useState } from 'react'
import { KeyboardAvoidingView, Platform, StyleSheet, View } from 'react-native'

import { type ImagePickerAsset } from 'expo-image-picker'
import { useNavigation } from 'expo-router'

import { useUser } from '../../../../hooks'
import { NavBar } from '../../../../src'
import { EditAvatar } from '../../../../src/components/ActionButtons'
import { Button, Error, Input } from '../../../../src/system'
import { theme } from '../../../../src/theme'
import { saveImage } from '../../../../src/utils/image'
import { SafeAreaView } from 'react-native-safe-area-context'

const EditProfile = () => {
  const { updateUser, user } = useUser()
  const [newAvatarImage, setNewAvatarImage] = useState<ImagePickerAsset | null>(null)
  const [bio, setBio] = useState<string>('')
  const [uploading, setUploading] = useState(false)
  const navigation = useNavigation()

  useEffect(() => {
    setBio(user?.bio ?? '')
  }, [user])

  const handleUpdateAvatar = useCallback((image: ImagePickerAsset) => {
    setNewAvatarImage(image)
  }, [])

  const handleSave = useCallback(async () => {
    if (!user) {
      return
    }

    const avatarUrl = newAvatarImage && (await saveImage(newAvatarImage, user.username))

    const updatePayload = {
      ...(newAvatarImage && { avatar_url: avatarUrl }),
      ...(bio && { bio }),
    }

    await updateUser(updatePayload)
    navigation.reset({
      index: 0,
      routes: [{ name: '[username]' as never, params: { username: user.username } }],
    })
  }, [bio, navigation, newAvatarImage, updateUser, user])

  if (!user) {
    return (
      <SafeAreaView style={styles.errorContainer}>
        <NavBar title="Modifier mon profil" />
        <Error />
      </SafeAreaView>
    )
  }

  return (
    <SafeAreaView style={styles.area}>
      <NavBar title="Modifier mon profil" />
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={theme.spacing['400']}
        style={styles.container}
      >
        <View style={styles.formContainer}>
          <EditAvatar
            avatarUrl={user.avatar_url ?? undefined}
            onUpdateAvatar={handleUpdateAvatar}
            setUploading={setUploading}
            uploading={uploading}
          />
          <Input setValue={setBio} title="Bio" value={bio} />
        </View>
        <View style={styles.buttonContainer}>
          <Button fullWidth onPress={handleSave} size="lg" title="Enregistrer" />
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  )
}

export default EditProfile

const styles = StyleSheet.create({
  area: {
    flex: 1,
  },
  buttonContainer: {
    marginHorizontal: theme.spacing[400],
  },
  container: {
    flex: 1,
    flexDirection: 'column',
    justifyContent: 'space-between',
    width: '100%',
  },
  errorContainer: {
    flex: 1,
  },
  formContainer: {
    marginHorizontal: theme.spacing[400],
  },
})
