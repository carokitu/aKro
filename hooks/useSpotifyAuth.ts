import { useEffect, useState } from 'react'

import { type AccessToken } from '@spotify/web-api-ts-sdk'
import { exchangeCodeAsync, makeRedirectUri, useAuthRequest } from 'expo-auth-session'
import * as SecureStore from 'expo-secure-store'

import { TOKEN_STORAGE_KEY } from '../constants'

const CLIENT_ID = process.env.EXPO_PUBLIC_SPOTIFY_CLIENT_ID as string
const CLIENT_SECRET = process.env.EXPO_PUBLIC_SPOTIFY_CLIENT_SECRET as string

export const spotifyDiscovery = {
  authorizationEndpoint: 'https://accounts.spotify.com/authorize',
  tokenEndpoint: 'https://accounts.spotify.com/api/token',
}

export const useSpotifyAuth = () => {
  const [token, setToken] = useState<AccessToken | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const redirectURI = makeRedirectUri({ scheme: 'akro' })

  // Configure Spotify Auth Request
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [_request, response, promptAsync] = useAuthRequest(
    {
      clientId: CLIENT_ID,
      redirectUri: redirectURI,
      scopes: ['user-read-email', 'playlist-modify-public', 'user-read-recently-played'],
      usePKCE: false, // PKCE is not needed for implicit grant flow
    },
    spotifyDiscovery,
  )

  // Handle Authentication Response
  useEffect(() => {
    const handleAuthResponse = async () => {
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
          if (tokenResponse.accessToken) {
            const accessToken: AccessToken = {
              access_token: response.params.access_token,
              expires_in: Number.parseInt(response.params.expires_in, 10),
              refresh_token: response.params.refresh_token,
              token_type: response.params.token_type,
            }

            setToken(accessToken)
            SecureStore.setItemAsync(TOKEN_STORAGE_KEY, JSON.stringify(accessToken))
          }
        } catch (error) {
          console.error('Error exchanging code for token:', error)
        }
      }
    }

    handleAuthResponse()
  }, [response])

  // Load Token from Secure Storage on App Start
  useEffect(() => {
    const loadStoredToken = async () => {
      const storedToken = await SecureStore.getItemAsync(TOKEN_STORAGE_KEY)

      if (storedToken) {
        setToken(JSON.parse(storedToken) as AccessToken)
      }

      setIsLoading(false)
    }

    loadStoredToken()
  }, [])

  // Logout Function
  const logout = async () => {
    await SecureStore.deleteItemAsync(TOKEN_STORAGE_KEY)
    setToken(null)
  }

  return {
    isLoading,
    login: () => promptAsync(),
    logout,
    token,
  }
}
