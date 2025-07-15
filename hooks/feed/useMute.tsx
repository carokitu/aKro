import React, { createContext, useContext, useState } from 'react'

type MuteContextType = {
  mute: boolean
  setMute: (value: boolean) => void
  setTemporaryMute: (value: boolean) => void
  temporaryMute: boolean
}

const MuteContext = createContext<MuteContextType | undefined>(undefined)

export const MuteProvider = ({ children }: { children: React.ReactNode }) => {
  const [mute, setMute] = useState(false)
  const [temporaryMute, setTemporaryMute] = useState(false)

  return (
    <MuteContext.Provider value={{ mute, setMute, setTemporaryMute, temporaryMute }}>{children}</MuteContext.Provider>
  )
}

export const useMute = (): MuteContextType => {
  const context = useContext(MuteContext)
  if (!context) {
    throw new Error('useMute must be used within a MuteProvider')
  }

  return context
}
