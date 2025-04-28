import React, { createContext, useCallback, useContext, useEffect, useMemo, useReducer } from 'react'

import { type User as AuthUser } from '@supabase/supabase-js'

import { isEqual } from 'lodash'

import { type User } from '../models'
import { client } from '../supabase'

type LoginInput = {
  email: string
  password: string
}

type State = {
  error: null | string
  isLoggedIn: boolean
  loading: boolean
  user: null | User
}

type Action =
  | { payload: boolean; type: 'SET_LOADING' }
  | { payload: null | string; type: 'SET_ERROR' }
  | { payload: null | User; type: 'SET_USER' }
  | { type: 'CLEAR_USER' }

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

const initialState: State = {
  error: null,
  isLoggedIn: false,
  loading: true,
  user: null,
}

const reducer = (state: State, action: Action): State => {
  switch (action.type) {
    case 'CLEAR_USER':
      return { ...state, error: null, isLoggedIn: false, user: null }
    case 'SET_ERROR':
      return { ...state, error: action.payload }
    case 'SET_LOADING':
      return { ...state, loading: action.payload }
    case 'SET_USER':
      return { ...state, error: null, isLoggedIn: true, user: action.payload }
    default:
      return state
  }
}

export const UserProvider = ({ children }: { children: React.ReactNode }) => {
  const [state, dispatch] = useReducer(reducer, initialState)

  const checkIfUserExists = useCallback(
    async (authUser: AuthUser) => {
      try {
        const { data, error } = await client.from('users').select('*').eq('id', authUser.id).single<User>()

        if (error) {
          // le user n'a pas encore été créé
          if (error.code === 'PGRST116') {
            dispatch({ payload: null, type: 'SET_USER' })
          } else {
            throw new Error(error.message)
          }
        }

        const payload = isEqual(state.user, data) ? state.user : data
        dispatch({ payload, type: 'SET_USER' })
      } catch (err) {
        dispatch({ payload: err instanceof Error ? err.message : 'Erreur utilisateur', type: 'SET_ERROR' })
        dispatch({ type: 'CLEAR_USER' })
      }
    },
    [state.user],
  )

  const init = useCallback(async () => {
    dispatch({ payload: true, type: 'SET_LOADING' })

    try {
      const {
        data: { session },
      } = await client.auth.getSession()

      if (session?.user) {
        await checkIfUserExists(session.user)
      } else {
        dispatch({ type: 'CLEAR_USER' })
      }
    } catch {
      dispatch({ payload: 'Erreur de session', type: 'SET_ERROR' })
    } finally {
      dispatch({ payload: false, type: 'SET_LOADING' })
    }
  }, [checkIfUserExists])

  useEffect(() => {
    let isMounted = true

    init()

    const { data: listener } = client.auth.onAuthStateChange(async (_event, session) => {
      if (!isMounted) {
        return
      }

      if (session?.user) {
        await checkIfUserExists(session.user)
      } else {
        dispatch({ type: 'CLEAR_USER' })
      }
    })

    return () => {
      isMounted = false
      listener?.subscription.unsubscribe()
    }
  }, [checkIfUserExists, init])

  const login = useCallback(
    async (input: LoginInput) => {
      dispatch({ payload: true, type: 'SET_LOADING' })
      try {
        const { error } = await client.auth.signInWithPassword(input)
        if (error) {
          throw new Error(error.message)
        }

        await init()
      } catch (err) {
        dispatch({ payload: err instanceof Error ? err.message : 'Erreur connexion', type: 'SET_ERROR' })
      } finally {
        dispatch({ payload: false, type: 'SET_LOADING' })
      }
    },
    [init],
  )

  const logout = useCallback(async () => {
    dispatch({ payload: true, type: 'SET_LOADING' })

    try {
      await client.auth.signOut()
      dispatch({ type: 'CLEAR_USER' })
    } catch {
      dispatch({ payload: 'Erreur de déconnexion', type: 'SET_ERROR' })
    } finally {
      dispatch({ payload: false, type: 'SET_LOADING' })
    }
  }, [])

  const refetchUser = useCallback(async () => {
    await init()
  }, [init])

  const value = useMemo(
    () => ({
      error: state.error,
      isLoggedIn: state.isLoggedIn,
      loading: state.loading,
      login,
      logout,
      refetchUser,
      user: state.user,
    }),
    [login, logout, refetchUser, state],
  )

  return <UserContext.Provider value={value}>{children}</UserContext.Provider>
}

export const useUser = () => {
  const context = useContext(UserContext)
  if (!context) {
    throw new Error('useUser must be used within a UserProvider')
  }

  return context
}
