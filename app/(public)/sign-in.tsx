import React from 'react'
import { StyleSheet } from 'react-native'
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context'

import { Label } from '../../src/system'

const SignIn = () => {
  const insets = useSafeAreaInsets()

  return (
    <SafeAreaView style={[styles.container, { paddingTop: insets.top }]}>
      <Label>This is the sign in screen</Label>
    </SafeAreaView>
  )
}

export default SignIn

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    marginTop: 40,
    padding: 20,
  },
})
