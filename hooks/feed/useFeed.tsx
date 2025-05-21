// src/contexts/FeedContext.tsx
import React, { createContext, useCallback, useContext, useState } from 'react'

type FeedContextType = {
  newPostKey: number
  refreshFeed: () => void
}

const FeedContext = createContext<FeedContextType | undefined>(undefined)

export const FeedProvider = ({ children }: { children: React.ReactNode }) => {
  const [newPostKey, setNewPostKey] = useState(0)

  const refreshFeed = useCallback(() => {
    setNewPostKey((k) => k + 1)
  }, [])

  return <FeedContext.Provider value={{ newPostKey, refreshFeed }}>{children}</FeedContext.Provider>
}

export const useFeed = () => {
  const ctx = useContext(FeedContext)
  if (!ctx) {
    throw new Error('useFeed must be used within a FeedProvider')
  }

  return ctx
}
