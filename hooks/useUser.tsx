import React, { createContext, useContext, useEffect, useState } from 'react'

import { type User } from '@supabase/supabase-js'

import { client } from '../supabase'

type LoginInput = {
  email: string
  password: string
}

type UserContextType = {
  loading: boolean
  login: (input: LoginInput) => Promise<{ error: null | string }>
  logout: () => Promise<void>
  user: null | User
}

const UserContext = createContext<undefined | UserContextType>(undefined)

export const UserProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<null | User>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const getUser = async () => {
      const {
        data: { session },
      } = await client.auth.getSession()

      if (session?.user) {
        setUser(session.user)
      }

      setLoading(false)
    }

    getUser()

    const { data: listener } = client.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null)
    })

    return () => {
      listener?.subscription.unsubscribe()
    }
  }, [])

  const login = async (input: LoginInput) => {
    const { data, error } = await client.auth.signInWithPassword(input)

    if (error) {
      return { error: error.message }
    }

    setUser(data.user)
    return { error: null }
  }

  const logout = async () => {
    await client.auth.signOut()
    setUser(null)
  }

  return <UserContext.Provider value={{ loading, login, logout, user }}>{children}</UserContext.Provider>
}

export const useUser = () => {
  const context = useContext(UserContext)
  if (context === undefined) {
    throw new Error('useUser must be used within a UserProvider')
  }

  return context
}
