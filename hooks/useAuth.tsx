import React, { createContext, useCallback, useContext, useEffect, useState } from 'react'

import { type PrivateUser, type User } from '../models'
import { client } from '../supabase'

type UserData = Pick<User, 'avatar_url' | 'bio' | 'birthday' | 'name' | 'username'>

type AuthContextType = {
  createUser: (overrideData?: Partial<UserData>) => Promise<void>
  error: null | string
  isLoggedIn: boolean
  loading: boolean
  logout: () => Promise<void>
  updateUserData: (data: Partial<UserData>) => void
  user: null | User
  userData: UserData
}

const initialUserRegistrationData: UserData = {
  avatar_url: null,
  bio: null,
  birthday: null,
  name: '',
  username: '',
}

const UserContext = createContext<AuthContextType | undefined>(undefined)

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<null | User>(null)
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<null | string>(null)
  const [userRegistrationData, setUserRegistrationData] = useState<UserData>(initialUserRegistrationData)

  const fetchUserFromSession = useCallback(async () => {
    setError(null)
    setLoading(true)

    const {
      data: { session },
      error: sessionError,
    } = await client.auth.getSession()

    if (sessionError || !session?.user) {
      setUser(null)
      setIsLoggedIn(false)
      setLoading(false)
      return
    } else {
      setIsLoggedIn(true)
    }

    const { data: dbUser, error: userError } = await client
      .from('users')
      .select('*')
      .eq('id', session.user.id)
      .single<User>()

    if (userError) {
      if (userError.code === 'PGRST116') {
        setUser(null)
      } else {
        setError(userError.message)
        setUser(null)
      }
    } else {
      setUser(dbUser)
    }

    setLoading(false)
  }, [])

  useEffect(() => {
    let isMounted = true

    fetchUserFromSession()

    const { data: listener } = client.auth.onAuthStateChange(async (_event, session) => {
      if (!isMounted) {
        return
      }

      if (session?.user) {
        setIsLoggedIn(true)

        const { data: dbUser, error: userError } = await client
          .from('users')
          .select('*')
          .eq('id', session.user.id)
          .single<User>()

        if (userError) {
          setUser(null)
          setError(userError.message)
        } else {
          setUser(dbUser)
          setError(null)
        }
      } else {
        setUser(null)
        setError(null)
        setIsLoggedIn(false)
      }
    })

    return () => {
      isMounted = false
      listener?.subscription.unsubscribe()
    }
  }, [fetchUserFromSession])

  const logout = useCallback(async () => {
    setError(null)
    setLoading(true)

    try {
      await client.auth.signOut()
      setUser(null)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur de déconnexion')
    } finally {
      setLoading(false)
    }
  }, [])

  const updateUserData = useCallback((data: Partial<UserData>) => {
    setUserRegistrationData((prev) => ({ ...prev, ...data }))
  }, [])

  const createUser = useCallback(
    async (overrideData?: Partial<UserData>) => {
      setError(null)
      setLoading(true)

      try {
        const {
          data: { session },
        } = await client.auth.getSession()

        if (!session?.user) {
          throw new Error('No authenticated user')
        }

        const input: Omit<PrivateUser, 'created_at'> = {
          ...userRegistrationData,
          ...overrideData,
          email: session.user.email,
          id: session.user.id,
          phone: session.user.phone,
        }

        const { data: insertedUser, error: err } = await client.from('users').insert(input).select().single<User>()

        if (err) {
          throw err
        }

        setUser(insertedUser)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Erreur inconnue')
        throw err
      } finally {
        setLoading(false)
      }
    },
    [userRegistrationData],
  )

  return (
    <UserContext.Provider
      value={{ createUser, error, isLoggedIn, loading, logout, updateUserData, user, userData: userRegistrationData }}
    >
      {children}
    </UserContext.Provider>
  )
}

export const useAuth = (): AuthContextType => {
  const context = useContext(UserContext)
  if (!context) {
    throw new Error('useUser must be used within a UserProvider')
  }

  return context
}
