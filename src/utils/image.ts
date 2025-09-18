import { decode } from 'base64-arraybuffer'
import * as FileSystem from 'expo-file-system'
import { type ImagePickerAsset } from 'expo-image-picker'
import * as Sentry from '@sentry/react-native'

import { client } from '../../supabase'

export const saveImage = async (image: ImagePickerAsset, username: string): Promise<null | string> => {
  if (image.type === 'image') {
    const extension = image.uri.split('.').pop() || 'jpg'
    const contentType = `image/${extension}`
    const filePath = `${username}_${Date.now()}.${extension}`

    const base64 = await FileSystem.readAsStringAsync(image.uri, { encoding: 'base64' })
    const binary = decode(base64)

    const { error: uploadError } = await client.storage.from('avatars').upload(filePath, binary, { contentType })

    if (uploadError) {
      Sentry.captureException(uploadError)
      throw uploadError
    }

    return filePath
  }

  return null
}
