import { CircleX, ImageUp } from 'lucide-react-native'
import { useCallback, useMemo, useState } from 'react'
import { ActivityIndicator, Image, StyleSheet, TouchableOpacity, View } from 'react-native'

import { type ImagePickerAsset, launchImageLibraryAsync, requestMediaLibraryPermissionsAsync } from 'expo-image-picker'

import { Avatar, Label, Text } from '../../system'
import { theme } from '../../theme'

type Props = {
  avatarUrl?: string
  onUpdateAvatar: (image: ImagePickerAsset) => void
  setUploading: (uploading: boolean) => void
  uploading: boolean
}

export const EditAvatar = ({ avatarUrl: initialAvatarUrl, onUpdateAvatar, setUploading, uploading }: Props) => {
  const [localAvatarUri, setLocalAvatarUri] = useState<null | string>(null)
  const [error, setError] = useState<null | string>(null)

  const handleImagePermissions = useCallback(async () => {
    const { status } = await requestMediaLibraryPermissionsAsync()

    if (status !== 'granted') {
      setError('Autorisation requise pour accéder à votre bibliothèque.')
      return false
    }

    return true
  }, [])

  const pickImage = useCallback(async () => {
    const hasPermission = await handleImagePermissions()
    if (!hasPermission) {
      return
    }

    try {
      const result = await launchImageLibraryAsync({
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      })

      if (result.canceled || result.assets.length === 0) {
        return
      }

      const image = result.assets[0]
      setLocalAvatarUri(image.uri)
      setUploading(true)
      setError(null)

      if (image.type === 'image') {
        // const extension = image.uri.split('.').pop() || 'jpg'
        // const contentType = `image/${extension}`
        // const filePath = `${username}_${Date.now()}.${extension}`

        // const base64 = await FileSystem.readAsStringAsync(image.uri, { encoding: 'base64' })
        // const binary = decode(base64)

        // const { error: uploadError } = await client.storage.from('avatars').upload(filePath, binary, { contentType })

        // if (uploadError) {
        //   throw uploadError
        // }

        onUpdateAvatar(image)
      } else {
        setError("Le fichier sélectionné n'est pas une image.")
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur inconnue lors du chargement.')
    } finally {
      setUploading(false)
    }
  }, [handleImagePermissions, onUpdateAvatar, setUploading])

  const renderAvatar = useMemo(() => {
    if (uploading) {
      return <ActivityIndicator color={theme.colors.brand[700]} size="large" />
    }

    if (localAvatarUri) {
      return <Image source={{ uri: localAvatarUri }} style={styles.avatarImage} />
    }

    if (initialAvatarUrl) {
      return <Avatar avatar={initialAvatarUrl} size="xxl" />
    }

    return <ImageUp color={theme.text.base.default} size={40} />
  }, [initialAvatarUrl, localAvatarUri, uploading])

  return (
    <>
      <TouchableOpacity disabled={uploading} onPress={pickImage} style={styles.optionContainer}>
        <View style={styles.avatarContainer}>{renderAvatar}</View>
        <Label size="medium" style={styles.label}>
          {uploading ? 'Upload en cours...' : 'Choisir une photo'}
        </Label>
      </TouchableOpacity>
      {error && (
        <View style={styles.errorContainer}>
          <CircleX color={theme.text.danger.default} size={theme.fontSize.sm} style={styles.icon} />
          <Text color="danger">{error}</Text>
        </View>
      )}
    </>
  )
}

const styles = StyleSheet.create({
  avatarContainer: {
    alignItems: 'center',
    backgroundColor: theme.surface.base.secondary,
    borderRadius: theme.radius.full,
    height: 100,
    justifyContent: 'center',
    marginTop: theme.spacing[600],
    overflow: 'hidden',
    width: 100,
  },
  avatarImage: {
    height: '100%',
    width: '100%',
  },
  errorContainer: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: theme.spacing['100'],
    marginTop: theme.spacing[200],
  },
  icon: {
    marginTop: theme.spacing[50],
  },
  label: {
    marginVertical: theme.spacing[400],
  },
  optionContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
})
