import { useActionSheet } from '@expo/react-native-action-sheet'
import { Ellipsis, MessageSquareOff, Send } from 'lucide-react-native'
import { useRef, useState } from 'react'
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  SafeAreaView,
  StyleSheet,
  TextInput,
  View,
} from 'react-native'

import { FlashList } from '@shopify/flash-list'
import { router, useLocalSearchParams } from 'expo-router'

import { useFeed, useUser } from '../../../hooks'
import { type Comment as TComment } from '../../../models'
import { NavBar } from '../../../src'
import { Avatar, IconButton, Text, Title } from '../../../src/system'
import { theme } from '../../../src/theme'
import { formatRelativeDate } from '../../../src/utils'
import { client } from '../../../supabase'

const LIMIT = 20

const EmptyState = () => (
  <View style={styles.emptyState}>
    <MessageSquareOff color={theme.text.base.secondary} size={40} />
    <Title color="secondary">Aucun commentaire</Title>
    <Text color="secondary" style={styles.emptyStateText}>
      Personne n'a encore commenté sur cette publication
    </Text>
  </View>
)

const NewComment = ({
  listRef,
  postId,
  setComments,
}: {
  listRef: React.RefObject<FlashList<TComment>>
  postId: string
  setComments: React.Dispatch<React.SetStateAction<TComment[]>>
}) => {
  const { user } = useUser()
  const { updateCommentCount } = useFeed()
  const [loading, setLoading] = useState(false)
  const [text, setText] = useState('')

  if (!user) {
    return null
  }

  const handleSend = async () => {
    setLoading(true)

    const comment = {
      author_id: user.id,
      content: text.trim(),
      post_id: postId,
    }

    const { data, error } = await client.from('comments').insert([comment]).select().single()

    setLoading(false)

    if (error) {
      console.error('Erreur insertion commentaire:', error)
      return
    }

    setText('')
    setComments((prev) => [...prev, { avatar_url: user.avatar_url, name: user.name, username: user.username, ...data }])

    const newCount =
      (await client.from('comments').select('id', { count: 'exact', head: true }).eq('post_id', postId)).count || 0
    updateCommentCount(postId, newCount)

    setTimeout(() => {
      listRef.current?.scrollToEnd({ animated: true })
    }, 100)
  }

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={theme.spacing['400']}
      style={styles.inputContainer}
    >
      <Avatar avatar={user.avatar_url} style={styles.newMessageIcon} />
      <TextInput
        maxLength={200}
        multiline
        onChangeText={(t) => {
          const sanitized = t.replaceAll('\n', '').slice(0, 200)
          setText(sanitized)
        }}
        placeholder="Ajouter un commentaire..."
        returnKeyType="done"
        style={styles.input}
        value={text}
      />
      <IconButton
        disabled={loading}
        Icon={Send}
        onPress={handleSend}
        size="md"
        style={styles.newMessageIcon}
        variant="tertiary"
      />
    </KeyboardAvoidingView>
  )
}

const Comment = ({ comment, currentUserId, postId }: { comment: TComment; currentUserId: string; postId: string }) => {
  const isCurrentUser = comment.author_id === currentUserId
  const [isDeleted, setIsDeleted] = useState(false)
  const { showActionSheetWithOptions } = useActionSheet()
  const { updateCommentCount } = useFeed()

  const onPress = async () => {
    showActionSheetWithOptions(
      {
        destructiveButtonIndex: 1,
        message: 'Cette action est irréversible. Êtes-vous sûr de vouloir continuer ?',
        options: ['Conserver', 'Supprimer'],
        title: 'Supprimer ce commentaire ?',
      },
      async (index) => {
        if (index === 1) {
          const { error } = await client.from('comments').delete().eq('id', comment.id)
          if (!error) {
            setIsDeleted(true)

            const newCount =
              (await client.from('comments').select('id', { count: 'exact', head: true }).eq('post_id', postId))
                .count || 0
            updateCommentCount(postId, newCount)
          }
        }
      },
    )
  }

  if (isDeleted) {
    return null
  }

  return (
    <View style={styles.comment}>
      <Avatar avatar={comment.avatar_url} />
      <View style={styles.commentBody}>
        <View style={styles.commentHeader}>
          <View style={styles.infos}>
            <Text color="disabled" ellipsizeMode="tail" numberOfLines={1}>
              {comment.username}
            </Text>
            <Text color="disabled">•</Text>
            <Text color="disabled">{formatRelativeDate(comment.created_at)}</Text>
          </View>
          {isCurrentUser && <IconButton Icon={Ellipsis} onPress={onPress} size="sm" variant="tertiary" />}
        </View>
        <Text style={styles.content}>{comment.content}</Text>
      </View>
    </View>
  )
}

const ExpendedComments = () => {
  const { id: postID } = useLocalSearchParams<{ id: string }>()
  const { user } = useUser()

  const [comments, setComments] = useState<TComment[]>([])
  const [loading, setLoading] = useState(false)
  const [offset, setOffset] = useState(0)

  const listRef = useRef<FlashList<TComment> | null>(null)

  if (!user || !postID) {
    router.back()
  }

  if (!user) {
    return null
  }

  const fetchComments = async () => {
    if (!user) {
      return { error: new Error('Current user not found') }
    }

    setLoading(true)

    const { data, error: fetchError } = await client.rpc('get_comments_for_post', {
      p_limit: LIMIT,
      p_offset: offset,
      p_post_id: postID,
    })

    if (fetchError) {
      console.error(fetchError)
      return { error: fetchError }
    }

    if (offset === 0) {
      setComments(data as TComment[])
    } else {
      setComments((prev) => [...prev, ...(data as TComment[])])
    }

    setOffset(offset + LIMIT)
    setLoading(false)

    return { error: null }
  }

  return (
    <SafeAreaView style={styles.container}>
      <NavBar title="Commentaires" />
      <FlashList
        data={comments}
        estimatedItemSize={80}
        keyExtractor={(item) => item.id}
        ListEmptyComponent={loading ? <ActivityIndicator size="large" style={styles.loader} /> : <EmptyState />}
        onEndReached={fetchComments}
        onEndReachedThreshold={0.8}
        ref={listRef}
        refreshing={loading}
        renderItem={({ item }) => <Comment comment={item} currentUserId={user.id} postId={postID} />}
        showsVerticalScrollIndicator={false}
      />
      <NewComment listRef={listRef} postId={postID} setComments={setComments} />
    </SafeAreaView>
  )
}

export default ExpendedComments

const styles = StyleSheet.create({
  comment: {
    flexDirection: 'row',
    gap: theme.spacing['400'],
    marginHorizontal: theme.spacing['400'],
    marginVertical: theme.spacing['300'],
  },
  commentBody: {
    flex: 1,
  },
  commentHeader: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  container: {
    flex: 1,
  },
  content: {
    flexWrap: 'wrap',
    textAlign: 'justify',
  },
  emptyState: {
    alignItems: 'center',
    gap: theme.spacing['200'],
    justifyContent: 'center',
    padding: theme.spacing['800'],
  },
  emptyStateText: {
    textAlign: 'center',
  },
  infos: {
    flexDirection: 'row',
    gap: theme.spacing['200'],
    marginBottom: theme.spacing['100'],
  },
  input: {
    backgroundColor: theme.surface.base.secondary,
    borderRadius: theme.radius.base,
    flex: 1,
    fontSize: theme.fontSize.lg,
    fontWeight: theme.weight.medium,
    maxHeight: 100,
    padding: theme.spacing['400'],
  },
  inputContainer: {
    alignItems: 'flex-end',
    alignSelf: 'stretch',
    borderColor: theme.border.base.default,
    borderTopWidth: 1,
    flexDirection: 'row',
    gap: theme.spacing['400'],
    padding: theme.spacing['400'],
  },
  loader: {
    marginVertical: theme.spacing['400'],
  },
  newMessageIcon: {
    marginBottom: theme.spacing['200'],
  },
})
