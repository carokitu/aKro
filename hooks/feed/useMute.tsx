import React, { createContext, useContext, useState } from 'react'

type MuteContextType = {
  mute: boolean
  setMute: (value: boolean) => void
}

const MuteContext = createContext<MuteContextType | undefined>(undefined)

export const MuteProvider = ({ children }: { children: React.ReactNode }) => {
  const [mute, setMute] = useState(false)

  return <MuteContext.Provider value={{ mute, setMute }}>{children}</MuteContext.Provider>
}

export const useMute = (): MuteContextType => {
  const context = useContext(MuteContext)
  if (!context) {
    throw new Error('useMute must be used within a MuteProvider')
  }

  return context
}
