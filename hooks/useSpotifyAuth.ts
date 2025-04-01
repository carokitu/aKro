import { useCallback, useEffect, useState } from 'react'

import { type AccessToken } from '@spotify/web-api-ts-sdk'
import { exchangeCodeAsync, makeRedirectUri, refreshAsync, useAuthRequest } from 'expo-auth-session'
import * as SecureStore from 'expo-secure-store'

import { ACCESS_TOKEN_KEY } from '../constants'

type AccessTokenWithExpiry = AccessToken & { expires_at: number }
export const useSpotifyAuth = () => {
  const [isLoading, setIsLoading] = useState(false)
  const [accessToken, setAccessToken] = useState<AccessTokenWithExpiry | null>(null)

  const CLIENT_ID = process.env.EXPO_PUBLIC_SPOTIFY_CLIENT_ID as string
  const CLIENT_SECRET = process.env.EXPO_PUBLIC_SPOTIFY_CLIENT_SECRET as string

  const redirectURI = makeRedirectUri({ scheme: 'akro' })

  const storeTokens = async (token: AccessToken) => {
    const expiresAt = Date.now() / 1000 + token.expires_in
    const tokenWithExpiry: AccessTokenWithExpiry = { ...token, expires_at: expiresAt }
    await SecureStore.setItemAsync(ACCESS_TOKEN_KEY, JSON.stringify(tokenWithExpiry))

    setAccessToken(tokenWithExpiry)
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [_request, response, promptAsync] = useAuthRequest(
    {
      clientId: CLIENT_ID,
      redirectUri: redirectURI,
      scopes: [
        'user-read-email',
        'playlist-modify-public',
        'user-read-recently-played',
        'user-top-read',
        'user-read-currently-playing',
        'user-library-read',
      ],
      usePKCE: false,
    },
    {
      authorizationEndpoint: 'https://accounts.spotify.com/authorize',
      tokenEndpoint: 'https://accounts.spotify.com/api/token',
    },
  )

  // Handle Authentication Response
  useEffect(() => {
    const handleAuthResponse = async () => {
      const now = Date.now() / 1000

      if (accessToken && accessToken?.expires_at > now) {
        return
      }

      if (response?.type === 'success' && response.params.code) {
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
            const newAccessToken: AccessToken = {
              access_token: tokenResponse.accessToken,
              expires_in: tokenResponse.expiresIn,
              refresh_token: tokenResponse.refreshToken,
              token_type: tokenResponse.tokenType,
            }

            await storeTokens(newAccessToken)
          }
        } catch (error) {
          console.error('Error exchanging code for token:', error)
        }
      }
    }

    handleAuthResponse()
  }, [response])

  const refreshTokenAsync = async (token: AccessTokenWithExpiry) => {
    try {
      const refreshedTokens = await refreshAsync(
        {
          clientId: CLIENT_ID,
          clientSecret: CLIENT_SECRET,
          extraParams: { grant_type: 'refresh_token' },
          refreshToken: token.refresh_token,
        },
        {
          tokenEndpoint: 'https://accounts.spotify.com/api/token',
        },
      )

      if (refreshedTokens.accessToken && refreshedTokens.expiresIn) {
        const newAccessToken: AccessTokenWithExpiry = {
          access_token: refreshedTokens.accessToken,
          expires_at: Date.now() / 1000 + refreshedTokens.expiresIn,
          expires_in: refreshedTokens.expiresIn,
          refresh_token: token.refresh_token,
          token_type: refreshedTokens.tokenType,
        }

        await storeTokens(newAccessToken)
      } else {
        console.error('Failed to refresh token. No valid access token or expiration time returned.')
        logout()
      }
    } catch (error) {
      console.error('Failed to refresh token:', error)
      logout()
    }
  }

  useEffect(() => {
    const loadTokens = async () => {
      try {
        const tokenString = await SecureStore.getItemAsync(ACCESS_TOKEN_KEY)

        if (tokenString) {
          const token: AccessTokenWithExpiry = JSON.parse(tokenString)
          const now = Date.now() / 1000

          if (token.expires_at > now) {
            setAccessToken(token)
          } else {
            await refreshTokenAsync(token)
          }
        }
      } catch (error) {
        console.error('Error loading tokens:', error)
      } finally {
        setIsLoading(false)
      }
    }

    loadTokens()
  }, [])

  const login = async () => {
    setIsLoading(true)
    await promptAsync()
    setIsLoading(false)
  }

  const logout = useCallback(async () => {
    await SecureStore.deleteItemAsync(ACCESS_TOKEN_KEY)
    setAccessToken(null)
  }, [])

  return {
    accessToken,
    isLoading,
    login,
    logout,
  }
}
