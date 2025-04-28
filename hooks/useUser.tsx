import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'

import { type User as AuthUser } from '@supabase/supabase-js'

import { isEqual } from 'lodash'

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
  refetchUser: () => Promise<void>
  user: null | User
}

const UserContext = createContext<undefined | UserContextType>(undefined)

export const UserProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<null | User>(null)
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<null | string>(null)

  const checkIfUserExists = useCallback(async (authUser: AuthUser) => {
    try {
      const { data, error: fetchError } = await client
        .from('users')
        .select('*')
        .eq('auth_id', authUser.id)
        .single<User>()

      if (fetchError) {
        if (fetchError.code !== 'PGRST116') {
          throw new Error(fetchError.message)
        }

        return
      }

      setUser((prev) => (isEqual(prev, data) ? prev : data))
      setIsLoggedIn(true)
    } catch (err) {
      console.error('checkIfUserExists error:', err)
      setError(err instanceof Error ? err.message : 'Erreur lors de la récupération du user')
      setUser(null)
      setIsLoggedIn(false)
    }
  }, [])

  useEffect(() => {
    let isMounted = true

    const init = async () => {
      try {
        const {
          data: { session },
        } = await client.auth.getSession()

        if (!isMounted) {
          return
        }

        if (session?.user) {
          await checkIfUserExists(session.user)
        } else {
          setUser(null)
          setIsLoggedIn(false)
        }
      } catch {
        if (isMounted) {
          setError("Erreur d'initialisation")
        }
      } finally {
        if (isMounted) {
          setLoading(false)
        }
      }
    }

    init()

    const { data: listener } = client.auth.onAuthStateChange(async (_event, session) => {
      if (!isMounted) {
        return
      }

      if (session?.user) {
        await checkIfUserExists(session.user)
      } else {
        setUser(null)
        setIsLoggedIn(false)
      }
    })

    return () => {
      isMounted = false
      listener?.subscription.unsubscribe()
    }
  }, [checkIfUserExists])

  const refetchUser = useCallback(async () => {
    const {
      data: { session },
    } = await client.auth.getSession()

    if (session?.user) {
      await checkIfUserExists(session.user)
    } else {
      setUser(null)
      setIsLoggedIn(false)
    }
  }, [checkIfUserExists])

  const login = useCallback(
    async (input: LoginInput) => {
      setLoading(true)
      try {
        const { error: authError } = await client.auth.signInWithPassword(input)
        if (authError) {
          throw new Error(authError.message)
        }

        await refetchUser()
        setError(null)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Erreur lors de la connexion')
      } finally {
        setLoading(false)
      }
    },
    [refetchUser],
  )

  const logout = useCallback(async () => {
    setLoading(true)
    try {
      await client.auth.signOut()
      setUser(null)
      setIsLoggedIn(false)
    } catch (err) {
      console.error('logout error:', err)
    } finally {
      setLoading(false)
    }
  }, [])

  const contextValue = useMemo(
    () => ({ error, isLoggedIn, loading, login, logout, refetchUser, user }),
    [error, isLoggedIn, loading, login, logout, refetchUser, user],
  )

  return <UserContext.Provider value={contextValue}>{children}</UserContext.Provider>
}

export const useUser = () => {
  const context = useContext(UserContext)
  if (!context) {
    throw new Error('useUser must be used within a UserProvider')
  }

  return context
}
