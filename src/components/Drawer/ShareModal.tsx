import { X } from 'lucide-react-native'
import { useEffect, useState } from 'react'
import { Alert, Image, Modal, StyleSheet, TouchableWithoutFeedback, View } from 'react-native'

import { type Track as TTrack } from '@spotify/web-api-ts-sdk'

import { useUser } from '../../../hooks'
import { client } from '../../../supabase'
import { Button, IconButton, Label, Title } from '../../system'
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
        spotify_track_id: track.id,
        track_name: track.name,
        user_id: user.id,
      })

      if (shareError) {
        throw shareError
      }
    } catch {
      setError('Une erreur est survenue lors du partage')
    } finally {
      setIsSharing(false)
      setIsSuccess(true)
    }
  }

  const artists = track.artists.map((artist) => artist.name).join(', ')
  const title = isSuccess ? 'Partage réussi !' : 'Partager ce son'
  const description = isSuccess ? "Merci d'avoir fait découvrir ce banger à tes copains !" : ''

  return (
    <Modal animationType="fade" onRequestClose={onClose} transparent>
      <TouchableWithoutFeedback onPress={onClose}>
        <View style={styles.modalContainer}>
          <TouchableWithoutFeedback>
            <View style={styles.modalContent}>
              <View style={styles.header}>
                <Title size="large">{description}</Title>
                {/* <IconButton Icon={X} onPress={onClose} variant="tertiary" /> */}
              </View>
              {/* <Label size="medium">{description}</Label> */}
              <View style={styles.trackInfo}>
                <Image source={{ uri: track.album.images[0].url }} style={styles.albumCover} />
                <Label size="large">{track.name}</Label>
                <Label color="secondary">{artists}</Label>
              </View>
              {error && <Label color="danger">{error}</Label>}
              <View style={styles.buttonsContainer}>
                <Button onPress={onClose} title="Fermer" variant="secondary" />
                {!isSuccess && (
                  <Button
                    disabled={isSharing}
                    onPress={handleShare}
                    title={isSharing ? 'Partage en cours...' : 'Partager'}
                    variant="primary"
                  />
                )}
              </View>
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
  },
  header: {
    alignItems: 'center',
    flexDirection: 'row',
    // textAlign: 'center',
    // justifyContent: 'space-between',
    marginBottom: theme.spacing['400'],
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
    marginBottom: theme.spacing['600'],
  },
})
