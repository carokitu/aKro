import { Text, View } from 'react-native'

import { useUser } from '../../../hooks'
import { Button } from '../../../src/system'

const MyProfile = () => {
  const { user } = useUser()

  if (!user) {
    return null
  }

  return (
    <View>
      <Text>Mon profil</Text>
      <Text>{user.username}</Text>
      <Button onPress={() => console.log('Go to settings')} title="Réglages" />
    </View>
  )
}

export default MyProfile
