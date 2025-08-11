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

import { useFeed, useMute, useUser } from '../../../hooks'
import { useFetchOrSaveDeezerTrack } from '../../../hooks/useDeezerTrack'
import { type DeezerTrack } from '../../../models'
import { client } from '../../../supabase'
import { Button, IconButton, Label, Title } from '../../system'
import { theme } from '../../theme'
import { Post } from '../Post'

type Props = {
  onClose: () => void
  track: DeezerTrack
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
  const { fetchAndSaveTrack } = useFetchOrSaveDeezerTrack(track.id)

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
    const isrc = await fetchAndSaveTrack()

    if (!isrc) {
      setError('Une erreur est survenue lors de la publication')
      setIsSharing(false)
      return
    }

    try {
      const { error: shareError } = await client.from('posts').insert({
        description,
        isrc,
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

  return (
    <Modal animationType="fade" onRequestClose={onClose}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 20 : 0}
        style={styles.modalContainer}
      >
        <SafeAreaView style={styles.modalContent}>
          <View style={styles.titleRow}>
            <Title size="large" style={styles.titleText}>
              Partager un son
            </Title>
            <IconButton Icon={X} onPress={onClose} size="lg" style={styles.closeButton} variant="tertiary" />
          </View>
          <ScrollView keyboardShouldPersistTaps="handled" ref={scrollViewRef}>
            <Post.Container coverUrl={track.album.cover_medium}>
              <Post.Track coverUrl={track.album.cover_big} />
              <Post.Footer artistName={track.artist.name} trackName={track.title} />
            </Post.Container>
            <Label size="large" style={styles.descriptionLabel}>
              Ajouter une légende
            </Label>
            <TextInput
              editable={!isSharing}
              maxLength={500}
              multiline
              numberOfLines={5}
              onChangeText={setDescription}
              placeholder="Pourquoi ce son vous fait vibrer ?"
              placeholderTextColor={theme.text.disabled}
              ref={inputRef}
              returnKeyType="done"
              style={styles.input}
              submitBehavior='blurAndSubmit'
              value={description}
            />
            {error && (
              <Label color="danger" style={styles.error}>
                {error}
              </Label>
            )}
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
          </ScrollView>
        </SafeAreaView>
      </KeyboardAvoidingView>
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
    marginBottom: theme.spacing['300'],
    marginTop: theme.spacing['600'],
  },
  closeButton: {
    position: 'absolute',
    right: 0,
  },
  descriptionLabel: {
    marginBottom: theme.spacing['200'],
    marginTop: theme.spacing['800'],
  },
  error: {
    marginTop: theme.spacing['200'],
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
