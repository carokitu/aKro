import { useEffect, useState } from 'react'
import { Button, StyleSheet, View } from 'react-native'

import { SpotifyApi } from '@spotify/web-api-ts-sdk'

const Index = () => {
  const sdk = SpotifyApi.withAccessToken('45d1f88fc40e4e21a77effd37e8e1b77', {
    access_token:
      'BQAzL1wAn7y7SkBr3DLxdbLGiDsEa23lwy1xWXrWsvZpQdMrebTaT0Y-MEbqhYAVfVFKlUKyF3CW91qx4bmwrv8Qe3VA8gml_9Kko7WbAlLEaymCKmWqFmxGT5TrKbsRSlfd15qIPv4-Nnt9IbKHLH8U7M5jAo1AErXfKPgWTwALLY0TOtNNf0sW_Jbs4c2EruEKgXMTitDnEnGwLcYzEVzqcf24Ecrt48JMvKHnQ-VaySJXiCKZk16CZNbJBB4G3ETErlVH_qQHiCG6F8xjGrk8KJheXq66aAlbSqC_xMg-3KyMUsH8ShUMQKYG',
    expires_in: 12,
    token_type: 'Bearer',
  })

  // const [request, response, promptAsync] = useAuthRequest(
  //   {
  //     clientId: 'CLIENT_ID',
  //     redirectUri: makeRedirectUri({
  //       scheme: 'akro',
  //     }),
  //     scopes: [
  //       'user-read-email',
  //       'playlist-modify-public',
  //       'playlist-modify-private',
  //       'playlist-read-private',
  //       'playlist-read-collaborative',
  //       'user-read-playback-position',
  //       'user-top-read',
  //       'user-read-recently-played',
  //     ],
  //     usePKCE: false,
  //   },
  //   discovery,
  // )
  const [token, setToken] = useState(
    'BQAzL1wAn7y7SkBr3DLxdbLGiDsEa23lwy1xWXrWsvZpQdMrebTaT0Y-MEbqhYAVfVFKlUKyF3CW91qx4bmwrv8Qe3VA8gml_9Kko7WbAlLEaymCKmWqFmxGT5TrKbsRSlfd15qIPv4-Nnt9IbKHLH8U7M5jAo1AErXfKPgWTwALLY0TOtNNf0sW_Jbs4c2EruEKgXMTitDnEnGwLcYzEVzqcf24Ecrt48JMvKHnQ-VaySJXiCKZk16CZNbJBB4G3ETErlVH_qQHiCG6F8xjGrk8KJheXq66aAlbSqC_xMg-3KyMUsH8ShUMQKYG',
  )
  const [topTracks, setTopTracks] = useState([])

  // const fetchWebApi = async (endpoint?: string, method?: string, body?: BodyInit) => {
  //   const res = await fetch(`https://api.spotify.com/${endpoint}`, {
  //     body: JSON.stringify(body),
  //     headers: {
  //       Authorization: `Bearer ${token}`,
  //     },
  //     method,
  //   })
  //   return await res.json()
  // }

  // const getTopTracks = async () => {
  //   // Endpoint reference : https://developer.spotify.com/documentation/web-api/reference/get-users-top-artists-and-tracks
  //   setTopTracks((await fetchWebApi('v1/me/top/tracks?time_range=long_term&limit=5', 'GET')).items)
  // }

  // console.log(topTracks?.map(({ artists, name }) => `${name} by ${artists.map((artist) => artist.name).join(', ')}`))

  return (
    <View style={styles.container}>
      <Button
        onPress={() => {
          getTopTracks()
        }}
        title="Get top tracks"
      />
    </View>
  )
}

export default Index

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    flex: 1,
    justifyContent: 'center',
  },
})
