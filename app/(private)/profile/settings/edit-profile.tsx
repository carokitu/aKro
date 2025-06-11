import { useCallback, useState } from 'react'
import { SafeAreaView, StyleSheet } from 'react-native'

import { type ImagePickerAsset } from 'expo-image-picker'

import { useUser } from '../../../../hooks'
import { NavBar } from '../../../../src'
import { EditAvatar } from '../../../../src/components/ActionButtons'
import { Error } from '../../../../src/system'

const EditProfile = () => {
  const { user } = useUser()
  const [newAvatarUrl, setNewAvatarUrl] = useState<ImagePickerAsset | null>(null)
  const [uploading, setUploading] = useState(false)

  const handleUpdateAvatar = useCallback((image: ImagePickerAsset) => {
    setNewAvatarUrl(image)
  }, [])

  if (!user) {
    return (
      <SafeAreaView style={styles.errorContainer}>
        <NavBar title="Modifier mon profil" />
        <Error />
      </SafeAreaView>
    )
  }

  return (
    <SafeAreaView>
      <NavBar title="Modifier mon profil" />
      <EditAvatar
        avatarUrl={user.avatar_url ?? undefined}
        onUpdateAvatar={handleUpdateAvatar}
        setUploading={setUploading}
        uploading={uploading}
      />
    </SafeAreaView>
  )
}

export default EditProfile

const styles = StyleSheet.create({
  errorContainer: {
    flex: 1,
  },
})
