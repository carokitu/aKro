import React, { createContext, type ReactNode, useContext, useState } from 'react'

type PostContextType = {
  expendedCommentsPostId: string | undefined
  expendedDescription: string | undefined
  expendedLikesPostId: string | undefined
  setExpendedCommentsPostId: (comments: string | undefined) => void
  setExpendedDescription: (desc: string | undefined) => void
  setExpendedLikesPostId: (likes: string | undefined) => void
}

const PostContext = createContext<PostContextType | undefined>(undefined)

export const PostProvider = ({ children }: { children: ReactNode }) => {
  const [expendedDescription, setExpendedDescription] = useState<string | undefined>(undefined)
  const [expendedLikesPostId, setExpendedLikesPostId] = useState<string | undefined>(undefined)
  const [expendedCommentsPostId, setExpendedCommentsPostId] = useState<string | undefined>(undefined)

  return (
    <PostContext.Provider
      value={{
        expendedCommentsPostId,
        expendedDescription,
        expendedLikesPostId,
        setExpendedCommentsPostId,
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
    throw new Error('usePost must be used within a PostProvider')
  }

  return context
}
