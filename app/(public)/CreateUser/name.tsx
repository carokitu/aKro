import { CircleX } from 'lucide-react-native'
import { useState } from 'react'
import { KeyboardAvoidingView, Platform, SafeAreaView, StyleSheet, TextInput, View } from 'react-native'

import { router } from 'expo-router'

import { useUserRegistration } from '../../../hooks'
import { Button, H1, Text } from '../../../src/system'
import { theme } from '../../../src/theme'

// eslint-disable-next-line regexp/no-obscure-range, unicorn/better-regex
const NAME_REGEX = /^[A-Za-zÀ-ÖØ-öø-ÿ'’ -]{2,50}$/

const validateNameFormat = (value: string) => NAME_REGEX.test(value)

const Name = () => {
  const [name, setName] = useState('')
  const [error, setError] = useState<null | string>(null)
  const { updateUserData } = useUserRegistration()

  const handleNext = () => {
    updateUserData({ name })
    router.push('/(public)/CreateUser/username')
  }

  const onChangeText = (text: string) => {
    setName(text)
    if (text.trim().length === 0) {
      setError(null)
      return
    }

    setError(validateNameFormat(text) ? null : 'Format invalide. Utilise des lettres, des espaces et des tirets.')
  }

  return (
    <SafeAreaView style={styles.container}>
      <H1 style={styles.title}>Comment t'appelles-tu ?</H1>
      <TextInput
        autoComplete="name"
        autoFocus
        keyboardType="default"
        maxLength={50}
        onChangeText={onChangeText}
        placeholder="Paul Dupont"
        placeholderTextColor={theme.text.disabled}
        style={styles.input}
        value={name}
      />
      {error && (
        <View style={styles.errorContainer}>
          <CircleX color={theme.text.danger.default} size={theme.fontSize.sm} style={styles.icon} />
          <Text color="danger">{error}</Text>
        </View>
      )}
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.buttonContainer}>
        <Button
          disabled={name.length < 3 || !!error}
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
    alignItems: 'flex-start',
    alignSelf: 'flex-start',
    flexDirection: 'row',
    gap: theme.spacing['100'],
    textAlign: 'center',
    verticalAlign: 'middle',
    width: '100%',
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
    width: '100%',
  },
  title: {
    marginTop: theme.spacing['1400'],
    textAlign: 'center',
  },
})

export default Name
