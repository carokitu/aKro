import { MessageSquareOff, X } from 'lucide-react-native'
import { useRef, useState } from 'react'
import { StyleSheet, TouchableOpacity, View } from 'react-native'

import BottomSheet, { BottomSheetView } from '@gorhom/bottom-sheet'
import { FlashList } from '@shopify/flash-list'

import { usePost, useUser } from '../../../../../hooks'
import { type Comment as TComment } from '../../../../../models'
import { client } from '../../../../../supabase'
import { Text, Title } from '../../../../system'
import { theme } from '../../../../theme'
import { NewComment } from './NewComment'

const LIMIT = 20

const EmptyState = () => {
  return (
    <View style={styles.emptyState}>
      <MessageSquareOff color={theme.text.base.secondary} size={40} />
      <Title color="secondary">Aucun commentaire</Title>
      <Text color="secondary" style={styles.emptyStateText}>
        Personne n’a encore commenté sur cette publication
      </Text>
    </View>
  )
}

const Comment = ({ comment }: { comment: TComment }) => {
  return (
    <View>
      <Text>{comment.content}</Text>
    </View>
  )
}

export const ExpendedComments = () => {
  const { expendedCommentsPostId, setExpendedCommentsPostId } = usePost()
  const { user } = useUser()

  const [comments, setComments] = useState<TComment[]>([])
  const [loading, setLoading] = useState(false)
  const [offset, setOffset] = useState(0)

  const bottomSheetRef = useRef<BottomSheet>(null)

  if (!expendedCommentsPostId || !user) {
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
      p_post_id: expendedCommentsPostId,
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
    <BottomSheet
      backgroundStyle={styles.background}
      enablePanDownToClose
      handleIndicatorStyle={styles.onHandleIndicator}
      index={1}
      onChange={(index) => {
        if (index === -1) {
          setExpendedCommentsPostId(undefined)
        }
      }}
      onClose={() => {
        setExpendedCommentsPostId(undefined)
      }}
      ref={bottomSheetRef}
      snapPoints={['80%', '100%']}
    >
      <BottomSheetView style={styles.bottomSheetContainer}>
        <View style={styles.commentsContainer}>
          <View style={styles.sectionTitle}>
            <Title size="large">Commentaires</Title>
            <TouchableOpacity onPress={() => setExpendedCommentsPostId(undefined)}>
              <X color={theme.text.base.default} size={28} />
            </TouchableOpacity>
          </View>
          <FlashList
            data={comments}
            estimatedItemSize={80}
            keyExtractor={(item) => item.id}
            ListEmptyComponent={<EmptyState />}
            onEndReached={fetchComments}
            onEndReachedThreshold={0.8}
            refreshing={loading}
            renderItem={({ item }) => <Comment comment={item} />}
            showsVerticalScrollIndicator={false}
          />
        </View>
        <NewComment />
      </BottomSheetView>
    </BottomSheet>
  )
}

const styles = StyleSheet.create({
  background: {
    backgroundColor: theme.surface.base.default,
    borderRadius: theme.radius.large,
    flex: 1,
  },
  bottomSheetContainer: {
    flex: 1,
    marginBottom: theme.spacing[800],
    marginHorizontal: theme.spacing['400'],
  },
  commentsContainer: {
    flex: 1,
    marginBottom: theme.spacing['400'],
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
  onHandleIndicator: {
    backgroundColor: theme.surface.base.secondaryPressed,
    height: 7,
    width: 40,
  },
  sectionTitle: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: theme.spacing['400'],
  },
})
