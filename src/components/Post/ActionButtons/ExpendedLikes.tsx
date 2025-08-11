import { X } from 'lucide-react-native'
import { useRef, useState } from 'react'
import { StyleSheet, TouchableOpacity, View } from 'react-native'

import BottomSheet, { BottomSheetView } from '@gorhom/bottom-sheet'

import { usePost, useUser } from '../../../../hooks'
import { type UserWithStats } from '../../../../models/custom'
import { client } from '../../../../supabase'
import { Title } from '../../../system'
import { theme } from '../../../theme'
import { UserList } from '../../Lists/Users'

export const ExpendedLikes = () => {
  const { expendedLikesPostId, setExpendedLikesPostId } = usePost()
  const user = useUser()
  const [users, setUsers] = useState<UserWithStats[]>([])
  const [loading, setLoading] = useState(false)
  const bottomSheetRef = useRef<BottomSheet>(null)

  if (!expendedLikesPostId) {
    return null
  }

  const fetch = async ({ limit, offset }: { limit: number; offset: number }) => {
    setLoading(true)

    const { data, error: fetchError } = await client.rpc('get_post_likers_with_stats', {
      p_limit: limit,
      p_offset: offset,
      p_post_id: expendedLikesPostId,
      p_viewer_id: user.id,
    })

    if (fetchError) {
      console.error(fetchError)
      return { error: fetchError }
    }

    if (offset === 0) {
      setUsers(data as UserWithStats[])
    } else {
      setUsers((prev) => [...prev, ...(data as UserWithStats[])])
    }

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
          setExpendedLikesPostId(undefined)
        }
      }}
      onClose={() => {
        setExpendedLikesPostId(undefined)
      }}
      ref={bottomSheetRef}
      snapPoints={['80%', '100%']}
    >
      <BottomSheetView style={styles.bottomSheetContainer}>
        <View style={styles.sectionTitle}>
          <Title size="large">J'aime</Title>
          <TouchableOpacity onPress={() => setExpendedLikesPostId(undefined)}>
            <X color={theme.text.base.default} size={28} />
          </TouchableOpacity>
        </View>
        <View style={styles.usersList}>
          <UserList currentUser={user} fetch={fetch} loading={loading} users={users} />
        </View>
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
  usersList: {
    flex: 1,
    minHeight: 550,
  },
})
