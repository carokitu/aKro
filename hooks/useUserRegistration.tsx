import React, { createContext, useContext, useState } from 'react'

import { type User } from '../models'

type UserRegistrationData = Pick<User, 'avatar_url' | 'birthday' | 'description' | 'name' | 'username'>

type UserRegistrationContextType = {
  resetUserData: () => void
  updateUserData: (data: Partial<UserRegistrationData>) => void
  userData: UserRegistrationData
}

const initialUserData: UserRegistrationData = {
  avatar_url: null,
  birthday: null,
  description: null,
  name: '',
  username: '',
}

const UserRegistrationContext = createContext<undefined | UserRegistrationContextType>(undefined)

export const UserRegistrationProvider = ({ children }: { children: React.ReactNode }) => {
  const [userData, setUserData] = useState<UserRegistrationData>(initialUserData)

  const updateUserData = (data: Partial<UserRegistrationData>) => {
    setUserData((prevData) => ({ ...prevData, ...data }))
  }

  const resetUserData = () => {
    setUserData(initialUserData)
  }

  return (
    <UserRegistrationContext.Provider value={{ resetUserData, updateUserData, userData }}>
      {children}
    </UserRegistrationContext.Provider>
  )
}

export const useUserRegistration = () => {
  const context = useContext(UserRegistrationContext)
  if (context === undefined) {
    throw new Error('useUserRegistration must be used within a UserRegistrationProvider')
  }

  return context
}
