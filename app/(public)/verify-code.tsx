import { CircleX } from 'lucide-react-native'
import React, { useCallback, useEffect, useState } from 'react'
import { parsePhoneNumber } from 'awesome-phonenumber'
import { KeyboardAvoidingView, Platform, StyleSheet, TextInput, View } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'

import { router, useLocalSearchParams } from 'expo-router'

import { NavBar } from '../../src'
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
  const [parsedNumber, setParsedNumber] = useState<string | null>(null)

  const isValidCode = code.trim().length === 6

  const sendCode = useCallback(async () => {
    const parsed = parsePhoneNumber( phoneNumber )

    if (parsed.valid) {
      setError(null)
      setParsedNumber(parsed.number.e164)
      try {
        await client.auth.signInWithOtp({
          phone: parsed.number.e164,
        })
        setIsTimerActive(true)
        setTimer(RESEND_DELAY)
      } catch {
        setError(`Erreur lors de l’envoi du code au ${phoneNumber}`)
      }
    } else {
      setError(`Numéro invalide : ${phoneNumber}`)
    }
  }, [phoneNumber])

  useEffect(() => {
    sendCode()
  }, [sendCode])

  useEffect(() => {
    if (timer === 0) {
      setIsTimerActive(false)
    }

    if (!isTimerActive || timer === 0) {
      return
    }

    const interval = setInterval(() => {
      setTimer((prev) => prev - 1)
    }, 1000)

    return () => clearInterval(interval)
  }, [isTimerActive, timer])

  const handleVerify = async () => {
    if (!parsedNumber) return

    try {
      const { error: err } = await client.auth.verifyOtp({
        phone: parsedNumber,
        token: code.trim(),
        type: 'sms',
      })
      if (err) {
        setError('Code invalide')
      }
    } catch {
      setError('Code invalide')
    }
  }

  const autoCompleteType = Platform.OS === 'android' ? 'sms-otp' : 'one-time-code'
  const resendTitle = isTimerActive ? `Renvoyer le code dans 00:${String(timer).padStart(2, '0')}` : 'Renvoyer le code'

  return (
    <SafeAreaView style={styles.container}>
      <NavBar />
      <KeyboardAvoidingView behavior="padding" style={styles.keyboardAvoidingView}>
        <View style={styles.formContainer}>
          <H1 style={styles.title}>Entre le code envoyé au {phoneNumber}</H1>
          <TextInput
            autoComplete={autoCompleteType}
            autoFocus
            keyboardType="number-pad"
            maxLength={6}
            onChangeText={setCode}
            onSubmitEditing={handleVerify}
            returnKeyType="done"
            style={styles.input}
            submitBehavior="blurAndSubmit"
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
          <View style={styles.buttonContainer}>
            <Button
              disabled={!isValidCode}
              fullWidth
              onPress={handleVerify}
              size="lg"
              style={styles.button}
              title="Suivant"
            />
            <Button
              fullWidth
              onPress={() => router.back()}
              size="lg"
              style={styles.button}
              title="Retour"
              variant="tertiary"
            />
          </View>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  )
}

export default VerifyCode

const styles = StyleSheet.create({
  button: {
    marginBottom: theme.spacing['200'],
  },
  buttonContainer: {
    marginTop: 'auto',
    width: '100%',
  },
  container: {
    flex: 1,
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
  formContainer: {
    alignItems: 'center',
    flex: 1,
    marginHorizontal: theme.spacing[400],
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
  keyboardAvoidingView: {
    flex: 1,
  },
  title: {
    textAlign: 'center',
  },
})
