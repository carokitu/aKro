import React, { createContext, useContext, useState } from 'react'

import { type User } from '../models'
import { client } from '../supabase'
import { useUser } from './useUser'

type UserRegistrationData = Pick<User, 'avatar_url' | 'bio' | 'birthday' | 'name' | 'username'>

type UserRegistrationContextType = {
  createUser: (data?: Partial<UserRegistrationData>) => Promise<void>
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
  const { refetchUser } = useUser()

  const updateUserData = (data: Partial<UserRegistrationData>) => {
    setUserData((prevData) => ({ ...prevData, ...data }))
  }

  const createUser = async (data?: Partial<UserRegistrationData>) => {
    const {
      data: { session },
    } = await client.auth.getSession()

    const input = {
      ...userData,
      ...data,
      email: session?.user.email,
      id: session?.user.id,
      phone: session?.user.phone,
    }
    const { error } = await client.from('users').insert(input)
    await refetchUser()

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
