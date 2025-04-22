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

const validatePasswordFormat = (value: string) => PASSWORD_REGEX.test(value)

const Password = () => {
  const [password, setPassword] = useState('')
  const [error, setError] = useState<null | string>(null)
  const [userExists, setUserExists] = useState(false)
  const [showPassword, setShowPassword] = useState(false)

  const { email } = useLocalSearchParams<{ email: string }>()

  useEffect(() => {
    const checkUserExists = async () => {
      const { data } = await client.from('users').select('*').eq('email', email)
      setUserExists(!!data)
    }

    checkUserExists()
  }, [email])

  if (!validate(email)) {
    router.navigate({ pathname: '/(public)/sign-in-with-email' })
  }

  useEffect(() => {
    if (password.length === 0) {
      setError(null)
      return
    }

    const isFormatValid = validatePasswordFormat(password)

    if (isFormatValid) {
      setError(null)
    } else {
      setError(
        'Le mot de passe doit contenir au moins 8 caractères, incluant au moins une lettre minuscule, une lettre majuscule, un chiffre et un caractère spécial parmi !, $, %, &, *, ?, @',
      )
    }
  }, [password])

  const handleNext = async () => {
    if (userExists) {
      const { error: errorSignUp } = await client.auth.signInWithPassword({
        email,
        password,
      })

      if (errorSignUp) {
        setError('Mot de passe erroné')
      }
    } else {
      const { error: errorSignIn } = await client.auth.signUp({
        email,
        password,
      })

      if (errorSignIn) {
        setError('Il y a eu une erreur lors de la création de ton compte')
      }
    }
  }

  const isDisabled = password.length === 0 || !!error
  const title = userExists ? 'Entre ton mot de passe' : 'Choisis un mot de passe'

  return (
    <SafeAreaView style={styles.container}>
      <H1 style={styles.title}>{title}</H1>
      <View style={styles.inputContainer}>
        <TextInput
          autoComplete="password"
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
