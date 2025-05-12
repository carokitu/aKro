import { useState } from 'react'
import { Image, Modal, StyleSheet, TouchableWithoutFeedback, View } from 'react-native'

import { type Track as TTrack } from '@spotify/web-api-ts-sdk'

import { useUser } from '../../../hooks'
import { client } from '../../../supabase'
import { Button, Label, Title } from '../../system'
import { theme } from '../../theme'

type Props = {
  onClose: () => void
  track: null | TTrack
}

export const ShareModal = ({ onClose, track }: Props) => {
  const { user } = useUser()
  const [isSharing, setIsSharing] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)
  const [error, setError] = useState<null | string>(null)

  if (!track) {
    return null
  }

  const handleShare = async () => {
    if (!user) {
      return
    }

    setIsSharing(true)

    try {
      const { error: shareError } = await client.from('posts').insert({
        album_cover_url: track.album.images[0].url,
        artist_name: track.artists.map((artist) => artist.name).join(', '),
        preview_url: track.preview_url,
        spotify_track_id: track.id,
        track_name: track.name,
        user_id: user.id,
      })

      if (shareError) {
        throw shareError
      }
    } catch {
      setError('Une erreur est survenue lors du partage')
      setIsSharing(false)
    } finally {
      setIsSharing(false)
      setIsSuccess(true)
    }
  }

  const artists = track.artists.map((artist) => artist.name).join(', ')
  const description = isSuccess ? "Merci d'avoir fait découvrir ce banger à tes copains !" : 'Partager ce son'

  return (
    <Modal animationType="fade" onRequestClose={onClose} transparent>
      <TouchableWithoutFeedback onPress={onClose}>
        <View style={styles.modalContainer}>
          <TouchableWithoutFeedback>
            <View style={styles.modalContent}>
              <View style={styles.header}>
                <Title size="large">{description}</Title>
              </View>
              <View style={styles.trackInfo}>
                <Image source={{ uri: track.album.images[0].url }} style={styles.albumCover} />
                <Label size="large">{track.name}</Label>
                <Label color="secondary">{artists}</Label>
              </View>
              {error && <Label color="danger">{error}</Label>}
              {!isSuccess && (
                <View style={styles.buttonsContainer}>
                  <>
                    <Button onPress={onClose} title="Fermer" variant="secondary" />
                    <Button
                      disabled={isSharing}
                      onPress={handleShare}
                      title={isSharing ? 'Partage en cours...' : 'Partager'}
                      variant="primary"
                    />
                  </>
                </View>
              )}
            </View>
          </TouchableWithoutFeedback>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  )
}

const styles = StyleSheet.create({
  albumCover: {
    borderRadius: theme.radius['small'],
    height: 150,
    marginBottom: theme.spacing['200'],
    marginRight: 10,
    width: 150,
  },
  buttonsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: theme.spacing['400'],
  },
  header: {
    alignItems: 'center',
    flexDirection: 'row',
    marginBottom: theme.spacing['400'],
    textAlign: 'center',
  },
  // eslint-disable-next-line react-native/no-color-literals
  modalContainer: {
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.2)',
    flex: 1,
    justifyContent: 'center',
  },
  modalContent: {
    backgroundColor: theme.surface.base.default,
    borderRadius: theme.radius.large,
    maxWidth: 400,
    padding: theme.padding['600'],
    width: '90%',
  },
  trackInfo: {
    alignItems: 'center',
    gap: theme.spacing['100'],
    marginBottom: theme.spacing['100'],
  },
})
