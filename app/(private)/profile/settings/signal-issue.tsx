import { useState } from 'react'
import { Platform, StyleSheet, View } from 'react-native'

import Constants from 'expo-constants'

import { useUser } from '../../../../hooks'
import { NavBar } from '../../../../src'
import { Button, Input } from '../../../../src/system'
import { theme } from '../../../../src/theme'
import { client } from '../../../../supabase'
import { SafeAreaView } from 'react-native-safe-area-context'

const SignalIssue = () => {
  const [issue, setIssue] = useState('')
  const { user } = useUser()

  const reportBug = async () => {
    if (!user) {
      return null
    }

    const deviceInfo = {
      appVersion: Constants.manifest?.version,
      os: Platform.OS,
      version: Platform.Version,
    }

    const { error } = await client.from('bug_reports').insert({
      device_info: deviceInfo,
      message: issue,
      user_id: user.id,
    })

    if (error) {
      console.error('Erreur lors de l’envoi du rapport :', error)
    }
  }

  return (
    <SafeAreaView style={styles.area}>
      <NavBar title="Signaler un problème" />
      <View style={styles.container}>
        <Input
          placeholder="J’ai remarqué un bug dans le feed..."
          setValue={setIssue}
          title="Écrivez nous un message "
          value={issue}
        />
        <View>
          <Button fullWidth onPress={() => reportBug()} size="lg" title="Enregistrer" />
        </View>
      </View>
    </SafeAreaView>
  )
}

export default SignalIssue

const styles = StyleSheet.create({
  area: {
    flex: 1,
  },
  container: {
    flex: 1,
    flexDirection: 'column',
    justifyContent: 'space-between',
    marginHorizontal: theme.spacing[400],
  },
})
