import React, { createContext, useCallback, useContext, useState } from 'react'

import * as Sentry from '@sentry/react-native'

type FeedContextType = {
  commentUpdates: Map<string, number>
  newPostKey: number
  notifyNewPost: () => void
  updateCommentCount: (postId: string, count: number) => void
}

const FeedContext = createContext<FeedContextType | undefined>(undefined)

export const FeedProvider = ({ children }: { children: React.ReactNode }) => {
  const [newPostKey, setNewPostKey] = useState(0)
  const [commentUpdates, setCommentUpdates] = useState<Map<string, number>>(new Map())

  const notifyNewPost = useCallback(() => {
    setNewPostKey((k) => k + 1)
  }, [])

  const updateCommentCount = useCallback((postId: string, count: number) => {
    setCommentUpdates((prev) => {
      const newMap = new Map(prev)
      newMap.set(postId, count)
      return newMap
    })
  }, [])

  return (
    <FeedContext.Provider value={{ commentUpdates, newPostKey, notifyNewPost, updateCommentCount }}>
      {children}
    </FeedContext.Provider>
  )
}

export const useFeed = () => {
  const ctx = useContext(FeedContext)
  if (!ctx) {
    Sentry.captureException(new Error('useFeed must be used within a FeedProvider'))
    throw new Error('useFeed must be used within a FeedProvider')
  }

  return ctx
}
