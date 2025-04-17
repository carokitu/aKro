import React, { createContext, useContext, useState } from 'react'

import { type User } from '../models'
import { client } from '../supabase'

type UserRegistrationData = Pick<User, 'avatar_url' | 'bio' | 'birthday' | 'name' | 'username'>

type UserRegistrationContextType = {
  createUser: () => Promise<void>
  updateUserData: (data: Partial<UserRegistrationData>) => void
  userData: UserRegistrationData
}

const initialUserData: UserRegistrationData = {
  avatar_url: null,
  bio: null,
  birthday: null,
  name: '',
  username: '',
}

const UserRegistrationContext = createContext<undefined | UserRegistrationContextType>(undefined)

export const UserRegistrationProvider = ({ children }: { children: React.ReactNode }) => {
  const [userData, setUserData] = useState<UserRegistrationData>(initialUserData)

  const updateUserData = (data: Partial<UserRegistrationData>) => {
    setUserData((prevData) => ({ ...prevData, ...data }))
  }

  const createUser = async () => {
    const { error } = await client.from('users').insert(userData)

    if (error) {
      throw new Error(error.message)
    }
  }

  return (
    <UserRegistrationContext.Provider value={{ createUser, updateUserData, userData }}>
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
