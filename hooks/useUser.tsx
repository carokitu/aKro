import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'

import { type User as AuthUser } from '@supabase/supabase-js'

import { type User } from '../models'
import { client } from '../supabase'

type LoginInput = {
  email: string
  password: string
}

type UserContextType = {
  error: null | string
  isLoggedIn: boolean
  loading: boolean
  login: (input: LoginInput) => Promise<void>
  logout: () => Promise<void>
  user: null | User
}

const UserContext = createContext<undefined | UserContextType>(undefined)

export const UserProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<null | User>(null)
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<null | string>(null)

  const checkIfUserExists = async (authUser: AuthUser) => {
    setLoading(true)
    const { data, error: authError } = await client.from('users').select('*').eq('auth_id', authUser.id).single<User>()

    if (authError) {
      if (authError.code !== 'PGRST116') {
        setError(authError.message)
      }
    } else {
      setUser(data)
    }

    setLoading(false)
  }

  useEffect(() => {
    setLoading(true)
    const getUser = async () => {
      const {
        data: { session },
      } = await client.auth.getSession()

      if (session?.user) {
        await checkIfUserExists(session.user)
      } else {
        setUser(null)
      }

      setLoading(false)
    }

    getUser()

    const { data: listener } = client.auth.onAuthStateChange(async (_event, session) => {
      setLoading(true)
      if (session?.user) {
        setIsLoggedIn(true)
        await checkIfUserExists(session.user)
      } else {
        setIsLoggedIn(false)
        setUser(null)
      }

      setLoading(false)
    })

    return () => {
      listener?.subscription.unsubscribe()
    }
  }, [])

  const login = useCallback(async (input: LoginInput) => {
    try {
      setLoading(true)
      const { error: authError } = await client.auth.signInWithPassword(input)

      if (authError) {
        setError(authError.message)
      } else {
        setError(null)
      }
    } catch {
      setError('Une erreur est survenue')
    }

    setLoading(false)
  }, [])

  // Logout function
  const logout = useCallback(async () => {
    setLoading(true)
    await client.auth.signOut()
    setUser(null)
    setIsLoggedIn(false)
    setLoading(false)
  }, [])

  const value = useMemo(
    () => ({ error, isLoggedIn, loading, login, logout, user }),
    [error, isLoggedIn, loading, login, logout, user],
  )

  return <UserContext.Provider value={value}>{children}</UserContext.Provider>
}

export const useUser = () => {
  const context = useContext(UserContext)

  if (context === undefined) {
    throw new Error('useUser must be used within a UserProvider')
  }

  return context
}
