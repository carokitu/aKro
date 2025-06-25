import { useCallback, useState } from 'react'

import { FlashList, type FlashListProps } from '@shopify/flash-list'

import { type User as TUser } from '../../../../models'
import { type UserWithStats } from '../../../../models/custom'
import { Error } from '../../../system'
import { User } from './User'

type UserListProps = Omit<FlashListProps<UserWithStats>, 'data' | 'renderItem'> & {
  currentUser: TUser
  fetch: ({ limit, offset }: { limit: number; offset: number }) => Promise<{ error: Error | null }>
  infinieScroll?: boolean
  loading: boolean
  users: UserWithStats[]
}

const LIMIT = 50

export const UserList = ({
  currentUser,
  fetch,
  infinieScroll = true,
  users = [],
  ...flashListProps
}: UserListProps) => {
  const [offset, setOffset] = useState(0)

  const fetchUsers = useCallback(async () => {
    const { error: usersError } = await fetch({ limit: LIMIT, offset })
    if (usersError) {
      // HANDLE ERROR
      return
    }

    setOffset(offset + LIMIT)
  }, [fetch, offset])

  const renderItem = useCallback(
    ({ item }: { item: UserWithStats }) => <User currentUser={currentUser} item={item} />,
    [currentUser],
  )

  return (
    <FlashList
      data={users}
      estimatedItemSize={45}
      keyboardShouldPersistTaps="handled"
      keyExtractor={(item) => item.id}
      ListEmptyComponent={<Error />}
      onEndReached={infinieScroll ? fetchUsers : undefined}
      renderItem={renderItem}
      {...flashListProps}
    />
  )
}
