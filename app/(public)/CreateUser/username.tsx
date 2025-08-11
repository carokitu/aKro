import { CircleCheck, CircleX, Loader } from 'lucide-react-native'
import React, { useEffect, useState } from 'react'
import { KeyboardAvoidingView, Platform, StyleSheet, TextInput, View } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'

import { router } from 'expo-router'

import { useUserRegistration } from '../../../hooks'
import { NavBar } from '../../../src'
import { Button, H1, Text } from '../../../src/system'
import { theme } from '../../../src/theme'
import { client } from '../../../supabase'

const USERNAME_REGEX = /^\w{3,20}$/
const DEBOUNCE_DELAY = 300

const validateUsernameFormat = (value: string) => USERNAME_REGEX.test(value)

const checkUsernameAvailability = async (value: string): Promise<boolean> => {
  const { data, error } = await client.from('users').select('id').eq('username', value).maybeSingle()

  if (error) {
    return false
  }

  return !data
}

const UserName = () => {
  const [username, setUsername] = useState('')
  const [error, setError] = useState<null | string>(null)
  const [checking, setChecking] = useState(false)

  const { updateUserData } = useUserRegistration()

  useEffect(() => {
    if (username.trim().length === 0) {
      setError(null)
      setChecking(false)
      return
    }

    setChecking(true)

    const timeout = setTimeout(async () => {
      const isFormatValid = validateUsernameFormat(username)

      if (!isFormatValid) {
        setError('Format invalide. Utilise 3 à 20 caractères : lettres, chiffres et tirets bas (_) uniquement')
        setChecking(false)
        return
      }

      const available = await checkUsernameAvailability(username)

      setError(available ? null : "Ce nom d'utilisateur n'est pas disponible")
      setChecking(false)
    }, DEBOUNCE_DELAY)

    return () => clearTimeout(timeout)
  }, [username])

  const handleNext = () => {
    const isFormatValid = validateUsernameFormat(username)
    if (isFormatValid) {
      updateUserData({ username })
      router.push('/(public)/CreateUser/birthday')
    }
  }

  const isDisabled = username.length === 0 || !!error || checking

  return (
    <SafeAreaView style={styles.container}>
      <NavBar />
      <KeyboardAvoidingView behavior="padding" style={styles.keyboardAvoidingView}>
        <View style={styles.formContainer}>
          <H1 style={styles.title}>Choisis un nom d’utilisateur</H1>
          <TextInput
            {...(Platform.OS === 'ios' && { autoFocus: true })}
            autoCorrect={false}
            keyboardType="twitter"
            maxLength={30}
            onChangeText={setUsername}
            placeholder="pauldupont12"
            placeholderTextColor={theme.text.disabled}
            style={styles.input}
            value={username}
          />
          <View style={styles.feedback}>
            {checking && (
              <>
                <Loader color={theme.text.informal.default} size={theme.fontSize.sm} style={styles.icon} />
                <Text color="informal" style={styles.feedbackText}>
                  Vérification de la disponibilité...
                </Text>
              </>
            )}
            {!checking && error && (
              <>
                <CircleX color={theme.text.danger.default} size={theme.fontSize.sm} style={styles.icon} />
                <Text color="danger" style={styles.feedbackText}>
                  {error}
                </Text>
              </>
            )}
            {!checking && !error && (
              <>
                <CircleCheck color={theme.text.success.default} size={theme.fontSize.sm} style={styles.icon} />
                <Text color="success" style={styles.feedbackText}>
                  Nom d’utilisateur disponible
                </Text>
              </>
            )}
          </View>
          <View style={styles.buttonContainer}>
            <Button
              disabled={isDisabled}
              fullWidth
              onPress={handleNext}
              size="lg"
              style={styles.button}
              title="Suivant"
            />
          </View>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  )
}

export default UserName

const styles = StyleSheet.create({
  button: {
    marginBottom: theme.spacing[200],
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
    marginBottom: theme.spacing[300],
    marginTop: theme.spacing[600],
    paddingHorizontal: theme.padding[600],
    paddingVertical: theme.padding[400],
    width: '100%',
  },
  keyboardAvoidingView: {
    flex: 1,
  },
  title: {
    textAlign: 'center',
  },
})
