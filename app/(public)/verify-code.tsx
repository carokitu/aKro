import React from 'react'
import { SafeAreaView, StyleSheet, Text, TextInput, View } from 'react-native'

import { useLocalSearchParams } from 'expo-router'

import { H1 } from '../../src/system'
import { theme } from '../../src/theme'

const VerifyCode = () => {
  const { phoneNumber } = useLocalSearchParams()

  console.log(phoneNumber)
  // const isString = typeof numberFromParams === 'string'
  // const parsedPhoneNumber =
  //   typeof phoneNumber === 'string' ? phoneNumber : (Array.isArray(phoneNumber) ? phoneNumber[0] : undefined)

  return (
    <SafeAreaView style={styles.container}>
      <H1 style={styles.title}>Entre le code envoyé sur ton numéro</H1>
      <TextInput keyboardType="number-pad" maxLength={6} style={styles.input} />
    </SafeAreaView>
  )
}

export default VerifyCode

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    flex: 1,
    marginHorizontal: theme.spacing['400'],
  },
  input: {
    backgroundColor: theme.surface.base.secondary,
    borderRadius: theme.radius.base,
    marginBottom: theme.spacing['300'],
    marginTop: theme.spacing['600'],
    paddingHorizontal: theme.padding['600'],
    paddingVertical: theme.padding['400'],
    width: '100%',
  },
  title: {
    marginTop: theme.spacing['1400'],
    textAlign: 'center',
  },
})
