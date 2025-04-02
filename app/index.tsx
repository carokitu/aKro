import React from 'react'
import { Button, View } from 'react-native'

import { Link } from 'expo-router'

import { useSpotifyAuth } from '../hooks'
import { H1, H2, H3, Label, Text, Title } from '../src/system'

const SpotifyLogin = () => {
  const { accessToken, login, logout } = useSpotifyAuth()

  if (!accessToken) {
    return (
      <View>
        <Button onPress={login} title="Login with Spotify" />
      </View>
    )
  }

  return (
    <View>
      <Text>🎵 Logged in to Spotify! 🎵</Text>
      <H1>Hello World</H1>
      <H2>Hello World</H2>
      <H3>Hello World</H3>
      <Title variant="large">Hello World</Title>
      <Title>Hello World</Title>
      <Title variant="small">Hello World</Title>
      <Label color="secondary">Hello World</Label>
      <Label variant="large">Hello World</Label>
      <Label variant="small">Hello World</Label>
      <Text variant="large">Hello World</Text>
      <Text variant="medium">Hello World</Text>
      <Text variant="small">Hello World</Text>
      <Link asChild href="/feed">
        <Button title="Go to Recently Played Tracks" />
      </Link>
      <Button onPress={logout} title="Logout" />
    </View>
  )
}

export default SpotifyLogin
