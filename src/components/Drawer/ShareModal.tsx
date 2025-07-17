import { X } from 'lucide-react-native'
import { useEffect, useRef, useState } from 'react'
import {
  Keyboard,
  KeyboardAvoidingView,
  Modal,
  Platform,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  TextInput,
  View,
} from 'react-native'

import { type Track as TTrack } from '@spotify/web-api-ts-sdk'

import { useFeed, useMute, useUser } from '../../../hooks'
import { client } from '../../../supabase'
import { Button, IconButton, Label, Title } from '../../system'
import { theme } from '../../theme'
import { Post } from '../Post'

type Props = {
  onClose: () => void
  track: null | TTrack
}

export const ShareModal = ({ onClose, track }: Props) => {
  const { user } = useUser()
  const { notifyNewPost } = useFeed()
  const { setTemporaryMute } = useMute()
  const [description, setDescription] = useState<string | undefined>(undefined)
  const [isSharing, setIsSharing] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)
  const [error, setError] = useState<null | string>(null)
  const scrollViewRef = useRef<ScrollView>(null)
  const inputRef = useRef<TextInput>(null)

  useEffect(() => {
    const showSub = Keyboard.addListener('keyboardDidShow', () => {
      scrollViewRef.current?.scrollToEnd({ animated: true })
    })

    return () => {
      showSub.remove()
    }
  }, [])

  useEffect(() => {
    if (track) {
      setTemporaryMute(true)
    } else {
      setTemporaryMute(false)
    }
  }, [setTemporaryMute, track])

  useEffect(() => {
    if (track && isSuccess) {
      setIsSuccess(false)
      notifyNewPost()
      onClose()
    }
  }, [isSuccess, notifyNewPost, onClose, track])

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
        description,
        isrc: track.external_ids.isrc,
        preview_url: track.preview_url,
        spotify_track_id: track.id,
        track_name: track.name,
        user_id: user.id,
      })

      if (shareError) {
        throw shareError
      }

      setIsSuccess(true)
    } catch {
      setError('Une erreur est survenue lors de la publication')
    } finally {
      setIsSharing(false)
    }
  }

  const artists = track.artists.map((a) => a.name).join(', ')
  const item = {
    album_cover_url: track.album.images[0].url,
    artist_name: artists,
    preview_url: track.preview_url ?? undefined,
    spotify_track_id: track.id,
    track_name: track.name,
  }

  return (
    <Modal animationType="fade" onRequestClose={onClose} transparent>
      <View style={styles.modalContainer}>
        <SafeAreaView style={styles.modalContent}>
          <View style={styles.titleRow}>
            <Title size="large" style={styles.titleText}>
              Partager un son
            </Title>
            <IconButton Icon={X} onPress={onClose} size="lg" style={styles.closeButton} variant="tertiary" />
          </View>
          <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} keyboardVerticalOffset={10}>
            <ScrollView
              contentContainerStyle={{ paddingBottom: theme.spacing['400'] }}
              keyboardShouldPersistTaps="handled"
              ref={scrollViewRef}
            >
              <Post.Container>
                <Post.Track item={item} />
                <Post.Footer item={item} />
              </Post.Container>
              <Label size="large" style={styles.descriptionLabel}>
                Ajouter une légende
              </Label>
              <TextInput
                maxLength={500}
                multiline
                numberOfLines={5}
                onChangeText={setDescription}
                placeholder="Pourquoi ce son vous fait vibrer ?"
                placeholderTextColor={theme.text.disabled}
                ref={inputRef}
                style={styles.input}
                value={description}
              />
            </ScrollView>
          </KeyboardAvoidingView>
          {error && <Label color="danger">{error}</Label>}
          <View style={styles.buttonsContainer}>
            <View style={styles.button}>
              <Button fullWidth onPress={onClose} size="lg" title="Annuler" variant="secondary" />
            </View>
            <View style={styles.button}>
              <Button
                disabled={isSharing}
                fullWidth
                onPress={handleShare}
                size="lg"
                title={isSharing ? 'Partage en cours...' : 'Publier'}
                variant="primary"
              />
            </View>
          </View>
        </SafeAreaView>
      </View>
    </Modal>
  )
}

const styles = StyleSheet.create({
  button: {
    width: '45%',
  },
  buttonsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: theme.spacing['800'],
  },
  closeButton: {
    position: 'absolute',
    right: 0,
  },
  descriptionLabel: {
    marginBottom: theme.spacing['200'],
    marginTop: theme.spacing['800'],
  },
  input: {
    backgroundColor: theme.surface.base.secondary,
    borderRadius: theme.radius.base,
    fontSize: theme.fontSize.lg,
    fontWeight: theme.weight.medium,
    height: 100,
    marginTop: theme.spacing['200'],
    paddingHorizontal: theme.padding['600'],
    paddingVertical: theme.padding['400'],
  },
  modalContainer: {
    backgroundColor: theme.surface.base.default,
    flex: 1,
    paddingHorizontal: theme.spacing['400'],
    paddingVertical: theme.padding['600'],
  },
  modalContent: {
    flex: 1,
  },
  titleRow: {
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: theme.spacing['600'],
    position: 'relative',
  },
  titleText: {
    textAlign: 'center',
  },
})
