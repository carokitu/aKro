import React, { createContext, type ReactNode, useContext, useState } from 'react'

type PostContextType = {
  expendedDescription: string | undefined
  setExpendedDescription: (desc: string | undefined) => void
}

const PostContext = createContext<PostContextType | undefined>(undefined)

export const PostProvider = ({ children }: { children: ReactNode }) => {
  const [expendedDescription, setExpendedDescription] = useState<string | undefined>()

  return <PostContext.Provider value={{ expendedDescription, setExpendedDescription }}>{children}</PostContext.Provider>
}

export const usePost = () => {
  const context = useContext(PostContext)
  if (!context) {
    throw new Error('usePost must be used within a PostProvider')
  }

  return context
}
