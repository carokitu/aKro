import { CircleX } from 'lucide-react-native'
import React, { useEffect, useRef, useState } from 'react'
import { KeyboardAvoidingView, Platform, StyleSheet, View } from 'react-native'
import PhoneInput from 'react-native-phone-number-input'
import { SafeAreaView } from 'react-native-safe-area-context'

import { Link, useRouter } from 'expo-router'
import { parsePhoneNumber } from 'awesome-phonenumber'

import { Button, H1, Text } from '../../src/system'
import { theme } from '../../src/theme'

const SignIn = () => {
  const phoneInput = useRef<PhoneInput>(null)
  const router = useRouter()
  const [value, setValue] = useState('')
  const [formattedNumber, setFormattedNumber] = useState<string | undefined>(undefined)

  const showError = !formattedNumber && value.length > 0

  const handleNext = () => {
    if (formattedNumber) {
      router.push({ params: { phoneNumber: value }, pathname: '/(public)/verify-code' })
    }
  }

  useEffect(() => {
    if (value.length > 7) {
      const pn = parsePhoneNumber( value );
      if (pn.valid) {
        setFormattedNumber(pn.number?.e164)
      } else {
        setFormattedNumber(undefined)
      }
    }
  }, [value])

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView behavior="padding" style={styles.keyboardAvoidingContainer}>
        <H1 style={styles.title}>Quel est ton numéro de téléphone ?</H1>
        {/* @ts-expect-error as the phoneInput lib is in js */}
        <PhoneInput
          {...(Platform.OS === 'ios' && { autoFocus: true })}
          containerStyle={styles.input}
          defaultCode="FR"
          flagButtonStyle={styles.flagButton}
          onChangeFormattedText={(text) => setValue(text)}
          ref={phoneInput}
          textContainerStyle={styles.textContainer}
        />
        {showError && (
          <View style={styles.errorContainer}>
            <CircleX color={theme.text.danger.default} size={theme.fontSize.sm} />
            <Text color="danger">Numéro invalide</Text>
          </View>
        )}
        <Text color="tertiary" style={styles.text}>
          En continuant, vous acceptez nos{' '}
          <Text color="tertiary" style={styles.link}>
            <Link href="/privacy-policy">Conditions d'utilisation et notre Politique de confidentialité</Link>.
          </Text>
        </Text>
        <Button
          onPress={() => router.push('/(public)/sign-in-with-email')}
          size="sm"
          title="Continuer avec un e-mail"
          variant="tertiary"
        />
        <View style={styles.buttonContainer}>
          <Button
            disabled={!formattedNumber}
            fullWidth
            onPress={handleNext}
            size="lg"
            style={{ marginBottom: theme.spacing['200'] }}
            title="Suivant"
          />
        </View>
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
    width: 50,
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
  keyboardAvoidingContainer: {
    alignItems: 'center',
    flex: 1,
    width: '100%',
  },
  link: {
    textDecorationLine: 'underline',
  },
  text: {
    marginVertical: theme.spacing['300'],
    textAlign: 'center',
  },
  textContainer: {
    ...Platform.select({
      android: {
        paddingVertical: theme.spacing['200'],
      },
    }),
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
