import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'

import { type AccessToken } from '@spotify/web-api-ts-sdk'
import { exchangeCodeAsync, makeRedirectUri, refreshAsync, useAuthRequest } from 'expo-auth-session'
import * as SecureStore from 'expo-secure-store'

import { ACCESS_TOKEN_KEY } from '../constants'

const ACCESS_TOKEN_EXPIRY_BUFFER = 60 // 1 minute
const REFRESH_TOKEN_INTERVAL = 30 * 60 * 1000 // 30 minutes

type AccessTokenWithExpiry = AccessToken & { expires_at: number }

type SpotifyAuthContextType = {
  accessToken: AccessTokenWithExpiry | null
  loading: boolean
  login: () => Promise<void>
  loginError: null | string
  logout: () => Promise<void>
}

const SpotifyAuthContext = createContext<SpotifyAuthContextType | undefined>(undefined)

export const SpotifyAuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [accessToken, setAccessToken] = useState<AccessTokenWithExpiry | null>(null)
  const [loading, setLoading] = useState(true)
  const [loginError, setLoginError] = useState<null | string>(null)

  const CLIENT_ID = process.env.EXPO_PUBLIC_SPOTIFY_CLIENT_ID as string
  const CLIENT_SECRET = process.env.EXPO_PUBLIC_SPOTIFY_CLIENT_SECRET as string
  if (!CLIENT_ID || !CLIENT_SECRET) {
    throw new Error('[SpotifyAuth] Missing CLIENT_ID or CLIENT_SECRET in env')
  }

  const redirectURI = makeRedirectUri({ scheme: 'akro' })

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [_request, response, promptAsync] = useAuthRequest(
    {
      clientId: CLIENT_ID,
      redirectUri: redirectURI,
      scopes: [
        'playlist-modify-public',
        'user-library-modify',
        'user-library-read',
        'user-modify-playback-state',
        'user-read-currently-playing',
        'user-read-email',
        'user-read-recently-played',
        'user-top-read',
      ],
      usePKCE: false,
    },
    {
      authorizationEndpoint: 'https://accounts.spotify.com/authorize',
      tokenEndpoint: 'https://accounts.spotify.com/api/token',
    },
  )

  const logout = useCallback(async () => {
    await SecureStore.deleteItemAsync(ACCESS_TOKEN_KEY)
    setAccessToken(null)
    setLoginError(null)
  }, [])

  const storeTokens = async (token: AccessToken) => {
    const expiresAt = Date.now() / 1000 + token.expires_in
    const tokenWithExpiry: AccessTokenWithExpiry = { ...token, expires_at: expiresAt }
    await SecureStore.setItemAsync(ACCESS_TOKEN_KEY, JSON.stringify(tokenWithExpiry))
    setAccessToken(tokenWithExpiry)
  }

  const refreshTokenAsync = useCallback(
    async (token: AccessTokenWithExpiry) => {
      try {
        const refreshed = await refreshAsync(
          {
            clientId: CLIENT_ID,
            clientSecret: CLIENT_SECRET,
            extraParams: { grant_type: 'refresh_token' },
            refreshToken: token.refresh_token,
          },
          { tokenEndpoint: 'https://accounts.spotify.com/api/token' },
        )

        if (refreshed.accessToken && refreshed.expiresIn) {
          const newToken: AccessTokenWithExpiry = {
            access_token: refreshed.accessToken,
            expires_at: Date.now() / 1000 + refreshed.expiresIn,
            expires_in: refreshed.expiresIn,
            refresh_token: token.refresh_token,
            token_type: refreshed.tokenType,
          }
          await storeTokens(newToken)
        } else {
          console.error('[SpotifyAuth] No valid token returned on refresh')
          await logout()
        }
      } catch (error) {
        console.error('[SpotifyAuth] Token refresh failed:', error)
        await logout()
      }
    },
    [CLIENT_ID, CLIENT_SECRET, logout],
  )

  // Gérer la réponse d'authentification
  const handleAuthResponse = useCallback(async () => {
    const now = Date.now() / 1000

    if (accessToken && accessToken?.expires_at - now > ACCESS_TOKEN_EXPIRY_BUFFER) {
      return
    }

    if (response?.type === 'success' && response.params.code) {
      setLoading(true)
      setLoginError(null)

      try {
        const tokenResponse = await exchangeCodeAsync(
          {
            clientId: CLIENT_ID,
            clientSecret: CLIENT_SECRET,
            code: response.params.code,
            extraParams: { grant_type: 'authorization_code' },
            redirectUri: redirectURI,
          },
          { tokenEndpoint: 'https://accounts.spotify.com/api/token' },
        )

        if (tokenResponse.accessToken && tokenResponse.expiresIn && tokenResponse.refreshToken) {
          const token: AccessToken = {
            access_token: tokenResponse.accessToken,
            expires_in: tokenResponse.expiresIn,
            refresh_token: tokenResponse.refreshToken,
            token_type: tokenResponse.tokenType,
          }

          await storeTokens(token)
        }
      } catch (err) {
        console.error('[SpotifyAuth] Auth exchange failed:', err)
        setLoginError('Authentication failed. Please try again.')
      } finally {
        setLoading(false)
      }
    }
  }, [accessToken, CLIENT_ID, CLIENT_SECRET, redirectURI, response])

  // Vérification de la présence du token localement
  useEffect(() => {
    handleAuthResponse()
  }, [handleAuthResponse])

  useEffect(() => {
    const loadToken = async () => {
      try {
        const raw = await SecureStore.getItemAsync(ACCESS_TOKEN_KEY)
        if (!raw) {
          return
        }

        const token: AccessTokenWithExpiry = JSON.parse(raw)
        const now = Date.now() / 1000

        // Si le token est expiré dans moins d'une minute, le rafraîchir
        if (token.expires_at - now < 60) {
          await refreshTokenAsync(token)
        } else {
          setAccessToken(token)
        }
      } catch (err) {
        console.error('[SpotifyAuth] Token load failed:', err)
      } finally {
        setLoading(false)
      }
    }

    loadToken()

    const interval = setInterval(() => {
      loadToken()
    }, REFRESH_TOKEN_INTERVAL)

    return () => clearInterval(interval)
  }, [refreshTokenAsync])

  // Fonction de login
  const login = useCallback(async () => {
    if (loading) {
      return
    }

    setLoading(true)
    try {
      await promptAsync()
    } finally {
      setLoading(false)
    }
  }, [loading, promptAsync])

  // Memoization du value pour éviter les rerenders inutiles
  const contextValue = useMemo(
    () => ({ accessToken, loading, login, loginError, logout }),
    [accessToken, loading, login, loginError, logout],
  )

  return <SpotifyAuthContext.Provider value={contextValue}>{children}</SpotifyAuthContext.Provider>
}

export const useSpotifyAuth = () => {
  const context = useContext(SpotifyAuthContext)
  if (!context) {
    throw new Error('[SpotifyAuth] useSpotifyAuth must be used within SpotifyAuthProvider')
  }

  return context
}
