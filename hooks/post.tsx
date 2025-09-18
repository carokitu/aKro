import React, { createContext, type ReactNode, useContext, useState } from 'react'

import * as Sentry from '@sentry/react-native'

type PostContextType = {
  expendedDescription: string | undefined
  expendedLikesPostId: string | undefined
  setExpendedDescription: (desc: string | undefined) => void
  setExpendedLikesPostId: (likes: string | undefined) => void
}

const PostContext = createContext<PostContextType | undefined>(undefined)

export const PostProvider = ({ children }: { children: ReactNode }) => {
  const [expendedDescription, setExpendedDescription] = useState<string | undefined>(undefined)
  const [expendedLikesPostId, setExpendedLikesPostId] = useState<string | undefined>(undefined)

  return (
    <PostContext.Provider
      value={{
        expendedDescription,
        expendedLikesPostId,
        setExpendedDescription,
        setExpendedLikesPostId,
      }}
    >
      {children}
    </PostContext.Provider>
  )
}

export const usePost = () => {
  const context = useContext(PostContext)
  if (!context) {
    Sentry.captureException(new Error('usePost must be used within a PostProvider'))
    throw new Error('usePost must be used within a PostProvider')
  }

  return context
}
