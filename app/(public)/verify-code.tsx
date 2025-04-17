import { CircleX } from 'lucide-react-native'
import React, { useCallback, useEffect, useState } from 'react'
import { KeyboardAvoidingView, Platform, SafeAreaView, StyleSheet, TextInput, View } from 'react-native'

import { useLocalSearchParams } from 'expo-router'
import { parsePhoneNumberFromString } from 'libphonenumber-js'

import { Button, H1, Text } from '../../src/system'
import { theme } from '../../src/theme'
import { client } from '../../supabase'

const RESEND_DELAY = 30

const VerifyCode = () => {
  const { phoneNumber } = useLocalSearchParams<{ phoneNumber: string }>()
  const [code, setCode] = useState('')
  const [timer, setTimer] = useState(RESEND_DELAY)
  const [error, setError] = useState<null | string>(null)
  const [isTimerActive, setIsTimerActive] = useState(true)

  const isValidCode = code.trim().length === 6

  const sendCode = useCallback(async () => {
    const formattedPhoneNumber = phoneNumber?.toString() ?? ''
    const parsed = parsePhoneNumberFromString(phoneNumber?.toString())

    if (parsed?.isValid()) {
      try {
        await client.auth.signInWithOtp({
          phone: formattedPhoneNumber,
        })
        setIsTimerActive(true)
        setTimer(RESEND_DELAY)
      } catch {
        setError('Erreur lors de l’envoi du code')
      }
    } else {
      setError(`Numéro invalide : ${formattedPhoneNumber}`)
    }
  }, [phoneNumber])

  useEffect(() => {
    sendCode()
  }, [sendCode])

  useEffect(() => {
    if (!isTimerActive || timer === 0) {
      return
    }

    const interval = setInterval(() => {
      setTimer((prev) => prev - 1)
    }, 1000)

    return () => clearInterval(interval)
  }, [isTimerActive, timer])

  const handleVerify = async () => {
    try {
      await client.auth.verifyOtp({
        phone: phoneNumber?.toString(),
        token: code.trim(),
        type: 'sms',
      })
      console.log('Code vérifié')
    } catch (err) {
      console.error('Échec de la vérification :', err)
      setError('Code invalide')
    }
  }

  const autoCompleteType = Platform.OS === 'android' ? 'sms-otp' : 'one-time-code'
  const resendTitle = isTimerActive ? `Renvoyer le code dans 00:${String(timer).padStart(2, '0')}` : 'Renvoyer le code'

  return (
    <SafeAreaView style={styles.container}>
      <H1 style={styles.title}>Entre le code envoyé sur ton numéro</H1>
      <TextInput
        autoComplete={autoCompleteType}
        autoFocus
        keyboardType="number-pad"
        maxLength={6}
        onChangeText={setCode}
        style={styles.input}
        value={code}
      />
      {error && (
        <View style={styles.feedback}>
          <CircleX color={theme.text.danger.default} size={theme.fontSize.sm} style={styles.icon} />
          <Text color="danger" style={styles.feedbackText}>
            {error}
          </Text>
        </View>
      )}
      <Button disabled={isTimerActive} onPress={sendCode} title={resendTitle} variant="tertiary" />
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.buttonContainer}>
        <Button
          disabled={!isValidCode}
          fullWidth
          onPress={handleVerify}
          size="lg"
          style={{ marginBottom: theme.spacing['200'] }}
          title="Suivant"
        />
      </KeyboardAvoidingView>
    </SafeAreaView>
  )
}

export default VerifyCode

const styles = StyleSheet.create({
  buttonContainer: {
    marginTop: 'auto',
    width: '100%',
  },
  container: {
    alignItems: 'center',
    flex: 1,
    marginHorizontal: theme.spacing['400'],
  },
  feedback: {
    alignItems: 'flex-start',
    alignSelf: 'flex-start',
    flexDirection: 'row',
    gap: theme.spacing['100'],
    textAlign: 'center',
    verticalAlign: 'middle',
    width: '100%',
  },
  feedbackText: {
    flexShrink: 1,
    flexWrap: 'wrap',
  },
  icon: {
    marginTop: theme.spacing[50],
  },
  input: {
    backgroundColor: theme.surface.base.secondary,
    borderRadius: theme.radius.base,
    fontSize: theme.fontSize.lg,
    fontWeight: theme.weight.medium,
    marginBottom: theme.spacing['300'],
    marginTop: theme.spacing['600'],
    paddingHorizontal: theme.padding['600'],
    paddingVertical: theme.padding['400'],
    textAlign: 'center',
    width: '100%',
  },
  title: {
    marginTop: theme.spacing['1400'],
    textAlign: 'center',
  },
})
