import { CircleCheck, CircleX, Eye, EyeOff } from 'lucide-react-native'
import React, { useEffect, useState } from 'react'
import {
  KeyboardAvoidingView,
  Platform,
  SafeAreaView,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native'

import { validate } from 'email-validator'
import { router, useLocalSearchParams } from 'expo-router'

import { Button, H1, Text } from '../../src/system'
import { theme } from '../../src/theme'
import { client } from '../../supabase'

const PASSWORD_REGEX = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!$%&*?@])[\d!$%&*?@A-Za-z]{8,}$/

const Password = () => {
  const [password, setPassword] = useState('')
  const [error, setError] = useState<null | string>(null)
  const [showPassword, setShowPassword] = useState(false)
  const [hasAccount, setHasAccount] = useState(false)

  const { email } = useLocalSearchParams<{ email: string }>()

  // Redirect if email is invalid
  useEffect(() => {
    if (!validate(email)) {
      router.replace('/(public)/sign-in-with-email')
    }
  }, [email])

  // Validate password on change
  useEffect(() => {
    if (password.length === 0) {
      return setError(null)
    }

    const isValid = PASSWORD_REGEX.test(password)
    setError(
      isValid
        ? null
        : 'Le mot de passe doit contenir au moins 8 caractères avec majuscules, minuscules, chiffres et caractères spéciaux.',
    )
  }, [password])

  const handleNext = async () => {
    setError(null)

    if (hasAccount) {
      const { error: err } = await client.auth.signInWithPassword({ email, password })

      if (err) {
        setError('Mot de passe incorrect ou compte inexistant.')
      }
    } else {
      const { error: err } = await client.auth.signUp({ email, password })

      if (err) {
        setError('Erreur lors de la création du compte.')
      }
    }
  }

  const isDisabled = password.length === 0 || !!error

  return (
    <SafeAreaView style={styles.container}>
      <H1 style={styles.title}>{hasAccount ? 'Entre ton mot de passe' : 'Choisis un mot de passe'}</H1>
      <View style={styles.inputContainer}>
        <TextInput
          autoFocus
          maxLength={30}
          onChangeText={setPassword}
          placeholder="motdepasse123"
          placeholderTextColor={theme.text.disabled}
          secureTextEntry={!showPassword}
          style={styles.input}
          value={password}
        />
        <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
          {showPassword ? (
            <Eye color={theme.text.base.tertiary} size={theme.fontSize.lg} />
          ) : (
            <EyeOff color={theme.text.base.tertiary} size={theme.fontSize.lg} />
          )}
        </TouchableOpacity>
      </View>
      <View style={styles.feedback}>
        {error && (
          <>
            <CircleX color={theme.text.danger.default} size={theme.fontSize.sm} style={styles.icon} />
            <Text color="danger" style={styles.feedbackText}>
              {error}
            </Text>
          </>
        )}
        {!error && password.length > 0 && (
          <>
            <CircleCheck color={theme.text.success.default} size={theme.fontSize.sm} style={styles.icon} />
            <Text color="success" style={styles.feedbackText}>
              Mot de passe valide
            </Text>
          </>
        )}
      </View>
      <Button
        onPress={() => {
          setError(null)
          setHasAccount(!hasAccount)
        }}
        size="sm"
        title={hasAccount ? 'Pas encore de compte ?' : 'Tu as déjà un compte ?'}
        variant="tertiary"
      />
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.buttonContainer}>
        <Button disabled={isDisabled} fullWidth onPress={handleNext} size="lg" style={styles.button} title="Suivant" />
      </KeyboardAvoidingView>
    </SafeAreaView>
  )
}

export default Password

const styles = StyleSheet.create({
  button: {
    marginBottom: theme.spacing[200],
  },
  buttonContainer: {
    marginTop: 'auto',
    width: '100%',
  },
  container: {
    alignItems: 'center',
    flex: 1,
    marginHorizontal: theme.spacing[400],
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
    fontSize: theme.fontSize.lg,
    fontWeight: theme.weight.medium,
    width: '100%',
  },
  inputContainer: {
    backgroundColor: theme.surface.base.secondary,
    borderRadius: theme.radius.base,
    display: 'flex',
    flexDirection: 'row',
    marginBottom: theme.spacing[300],
    marginHorizontal: theme.spacing[100],
    marginTop: theme.spacing[600],
    paddingHorizontal: theme.padding[600],
    paddingVertical: theme.padding[400],
  },
  title: {
    marginTop: theme.spacing[1400],
    textAlign: 'center',
  },
})
