import { CircleX } from 'lucide-react-native'
import React, { useEffect, useState } from 'react'
import { KeyboardAvoidingView, Platform, StyleSheet, TextInput, View } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'

import { validate } from 'email-validator'
import { useRouter } from 'expo-router'

import { Button, H1, Text } from '../../src/system'
import { theme } from '../../src/theme'

const SignInWithEmail = () => {
  const [email, setEmail] = useState('')
  const [isValid, setIsValid] = useState(true)

  const showError = !isValid && email.length > 0
  const router = useRouter()

  const handleNext = () => {
    if (isValid) {
      router.push({ params: { email }, pathname: '/(public)/password' })
    }
  }

  useEffect(() => {
    setIsValid(validate(email))
  }, [email])

  return (
    <SafeAreaView style={styles.container}>
      <H1 style={styles.title}>Quel est ton mail ?</H1>
      <TextInput
        autoComplete="email"
        autoFocus
        keyboardType="email-address"
        maxLength={150}
        onChangeText={setEmail}
        placeholder="exemple@email.com"
        placeholderTextColor={theme.text.disabled}
        style={styles.input}
        value={email}
      />
      {showError && (
        <View style={styles.errorContainer}>
          <CircleX color={theme.text.danger.default} size={theme.fontSize.sm} />
          <Text color="danger">Adresse mail invalide</Text>
        </View>
      )}
      <Text color="tertiary" style={styles.text}>
        En continuant, vous acceptez nos Conditions d'utilisation et notre Politique de confidentialité.
      </Text>
      <Button
        onPress={() => router.push('/(public)/sign-in')}
        size="sm"
        title="Continuer avec un numéro de téléphone"
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

export default SignInWithEmail

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
  input: {
    backgroundColor: theme.surface.base.secondary,
    borderRadius: theme.radius.base,
    fontSize: theme.fontSize.lg,
    fontWeight: theme.weight.medium,
    marginBottom: theme.spacing[300],
    marginTop: theme.spacing[600],
    paddingHorizontal: theme.padding[600],
    paddingVertical: theme.padding[400],
    width: '100%',
  },
  text: {
    marginVertical: theme.spacing['300'],
    textAlign: 'center',
  },
  title: {
    marginTop: theme.spacing['1400'],
    textAlign: 'center',
  },
})
