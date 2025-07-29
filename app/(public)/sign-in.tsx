import { CircleX } from 'lucide-react-native'
import React, { useEffect, useRef, useState } from 'react'
import { KeyboardAvoidingView, Platform, StyleSheet, View } from 'react-native'
import PhoneInput from 'react-native-phone-number-input'
import { SafeAreaView } from 'react-native-safe-area-context'

import { useRouter } from 'expo-router'
import { parsePhoneNumberFromString } from 'libphonenumber-js'

import { Button, H1, Text } from '../../src/system'
import { theme } from '../../src/theme'

const isPhoneValid = (phone: string): boolean => {
  const parsed = parsePhoneNumberFromString(phone)
  return parsed?.isValid() ?? false
}

const SignIn = () => {
  const phoneInput = useRef<PhoneInput>(null)
  const [value, setValue] = useState('')
  const [isValid, setIsValid] = useState(true)

  const showError = !isValid && value.length > 0
  const router = useRouter()

  const handleNext = () => {
    if (isValid) {
      router.push({ params: { phoneNumber: value }, pathname: '/(public)/verify-code' })
    }
  }

  useEffect(() => {
    setIsValid(isPhoneValid(value))
  }, [value])

  return (
    <SafeAreaView style={styles.container}>
      <H1 style={styles.title}>Quel est ton numéro de téléphone ?</H1>
      {/* @ts-expect-error as the phoneInput lib is in js */}
      <PhoneInput
        autoFocus
        containerStyle={styles.input}
        defaultCode="FR"
        defaultValue={value}
        flagButtonStyle={styles.flagButton}
        layout="first"
        onChangeFormattedText={(text) => setValue(text)}
        ref={phoneInput}
        textContainerStyle={styles.textContainer}
        withShadow
      />
      {showError && (
        <View style={styles.errorContainer}>
          <CircleX color={theme.text.danger.default} size={theme.fontSize.sm} />
          <Text color="danger">Numéro invalide</Text>
        </View>
      )}
      <Text color="tertiary" style={styles.text}>
        En continuant, vous acceptez nos Conditions d'utilisation et notre Politique de confidentialité.
      </Text>
      <Button
        onPress={() => router.push('/(public)/sign-in-with-email')}
        size="sm"
        title="Continuer avec un e-mail"
        variant="tertiary"
      />
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.buttonContainer}>
        <Button
          disabled={!isValid}
          fullWidth
          onPress={handleNext}
          size="lg"
          style={{ marginBottom: theme.spacing['200'] }}
          title="Suivant"
        />
      </KeyboardAvoidingView>
    </SafeAreaView>
  )
}

export default SignIn

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
  errorContainer: {
    alignItems: 'center',
    alignSelf: 'flex-start',
    color: theme.text.danger.default,
    flexDirection: 'row',
    gap: theme.spacing['100'],
    textAlign: 'center',
    verticalAlign: 'middle',
  },
  flagButton: {
    backgroundColor: theme.surface.base.secondary,
    borderRadius: theme.radius.base,
    marginRight: theme.spacing['200'],
  },
  input: {
    backgroundColor: theme.surface.transparent,
    borderRadius: theme.radius.base,
    marginBottom: theme.spacing['300'],
    marginTop: theme.spacing['600'],
    shadowColor: theme.surface.transparent,
    width: '100%',
  },
  text: {
    marginVertical: theme.spacing['300'],
    textAlign: 'center',
  },
  textContainer: {
    backgroundColor: theme.surface.base.secondary,
    borderRadius: theme.radius.base,
    boxShadow: 'none',
    shadowColor: theme.surface.transparent,
  },
  title: {
    marginTop: theme.spacing['1400'],
    textAlign: 'center',
  },
})
