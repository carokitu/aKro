import DateTimePicker, { type DateTimePickerEvent } from '@react-native-community/datetimepicker'
import { CircleX } from 'lucide-react-native'
import React, { useEffect, useMemo, useState } from 'react'
import { KeyboardAvoidingView, Platform, SafeAreaView, StyleSheet, TouchableOpacity, View } from 'react-native'

import { router } from 'expo-router'

import { useUserRegistration } from '../../../hooks'
import { Button, H1, Text } from '../../../src/system'
import { theme } from '../../../src/theme'

const validateAge = (date: Date) => {
  const minimumDate = new Date()
  minimumDate.setFullYear(minimumDate.getFullYear() - 16)

  const maximumDate = new Date()
  maximumDate.setFullYear(maximumDate.getFullYear() - 100)

  return date <= minimumDate && date >= maximumDate
}

const Birthday = () => {
  const { updateUserData } = useUserRegistration()

  const defaultDate = useMemo(() => {
    const d = new Date()
    d.setFullYear(d.getFullYear() - 20)
    return d
  }, [])

  const [birthday, setBirthday] = useState(defaultDate)
  const [isOldEnough, setIsOldEnough] = useState(true)
  const [showPicker, setShowPicker] = useState(Platform.OS === 'ios')

  useEffect(() => {
    setIsOldEnough(validateAge(birthday))
  }, [birthday])

  const handleDateChange = (_event: DateTimePickerEvent, selectedDate?: Date) => {
    if (selectedDate) {
      setBirthday(selectedDate)
    }

    if (Platform.OS === 'android') {
      setShowPicker(false)
    }
  }

  const formatDate = useMemo(
    () =>
      birthday.toLocaleDateString('fr-FR', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
      }),
    [birthday],
  )

  const handleNext = () => {
    if (isOldEnough) {
      updateUserData({ birthday })
      router.push('/(public)/CreateUser/avatar')
    }
  }

  return (
    <SafeAreaView style={styles.container}>
      <H1 style={styles.title}>Indique ta date de naissance</H1>
      {Platform.OS === 'android' && (
        <TouchableOpacity onPress={() => setShowPicker(true)} style={styles.dateButton}>
          <Text style={styles.dateText}>{formatDate}</Text>
        </TouchableOpacity>
      )}
      {showPicker && (
        <DateTimePicker
          display="spinner"
          mode="date"
          onChange={handleDateChange}
          style={styles.datePicker}
          textColor={theme.text.base.default}
          value={birthday}
        />
      )}
      {!isOldEnough && (
        <View style={styles.feedback}>
          <CircleX color={theme.text.danger.default} size={theme.fontSize.sm} style={styles.icon} />
          <Text color="danger" style={styles.feedbackText}>
            Tu dois avoir au moins 16 ans pour t'inscrire
          </Text>
        </View>
      )}
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.buttonContainer}>
        <Button
          disabled={!isOldEnough}
          fullWidth
          onPress={handleNext}
          size="lg"
          style={styles.button}
          title="Suivant"
        />
      </KeyboardAvoidingView>
    </SafeAreaView>
  )
}

export default Birthday

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
  dateButton: {
    backgroundColor: theme.surface.base.secondary,
    borderRadius: theme.radius.base,
    marginBottom: theme.spacing[200],
    marginTop: theme.spacing[600],
    padding: theme.padding[400],
    width: '100%',
  },
  datePicker: {
    backgroundColor: theme.surface.base.secondary,
    borderRadius: theme.radius.base,
    marginBottom: theme.spacing[200],
    marginTop: theme.spacing[600],
    width: '100%',
  },
  dateText: {
    color: theme.text.base.default,
    fontSize: theme.fontSize.lg,
    textAlign: 'center',
  },
  feedback: {
    alignItems: 'flex-start',
    flexDirection: 'row',
    gap: theme.spacing[100],
    width: '100%',
  },
  feedbackText: {
    flexShrink: 1,
    flexWrap: 'wrap',
  },
  icon: {
    marginTop: theme.spacing[50],
  },
  title: {
    marginTop: theme.spacing[1400],
    textAlign: 'center',
  },
})
