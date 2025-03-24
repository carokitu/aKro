import { useEffect, useState } from 'react'

import { exchangeCodeAsync, makeRedirectUri, useAuthRequest } from 'expo-auth-session'
import * as SecureStore from 'expo-secure-store'

const CLIENT_ID = process.env.EXPO_PUBLIC_SPOTIFY_CLIENT_ID as string
const CLIENT_SECRET = process.env.EXPO_PUBLIC_SPOTIFY_CLIENT_SECRET as string
const REDIRECT_URI = makeRedirectUri({ scheme: 'akro' })

const discovery = {
  authorizationEndpoint: 'https://accounts.spotify.com/authorize',
  tokenEndpoint: 'https://accounts.spotify.com/api/token',
}

export const useSpotifyAuth = () => {
  const [token, setToken] = useState<null | string>(null)

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [_request, response, promptAsync] = useAuthRequest(
    {
      clientId: CLIENT_ID,
      redirectUri: REDIRECT_URI,
      scopes: ['user-read-email', 'playlist-modify-public'],
      usePKCE: false, // PKCE is disabled because we handle it manually
    },
    discovery,
  )

  useEffect(() => {
    const handleAuthResponse = async () => {
      if (response?.type === 'success' && response.params.code) {
        try {
          // Exchange code for access token
          const tokenResponse = await exchangeCodeAsync(
            {
              clientId: CLIENT_ID,
              clientSecret: CLIENT_SECRET,
              code: response.params.code,
              extraParams: { grant_type: 'authorization_code' },
              redirectUri: REDIRECT_URI,
            },
            discovery,
          )

          if (tokenResponse.accessToken) {
            await SecureStore.setItemAsync('spotify_token', tokenResponse.accessToken)
            setToken(tokenResponse.accessToken)
          }
        } catch (error) {
          console.error('Error exchanging code for token:', error)
        }
      }
    }

    handleAuthResponse()
  }, [response])

  const logout = async () => {
    await SecureStore.deleteItemAsync('spotify_token')
    setToken(null)
  }

  return { login: () => promptAsync(), logout, token }
}
