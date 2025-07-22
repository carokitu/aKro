import { useActionSheet } from '@expo/react-native-action-sheet'
import { CalendarRange } from 'lucide-react-native'
import { useState } from 'react'
import { SafeAreaView, StyleSheet } from 'react-native'

import { LinearGradient } from 'expo-linear-gradient'
import { router } from 'expo-router'

import { NavBar } from '../../src'
import { Podium } from '../../src/components'
import { Button } from '../../src/system'
import { theme } from '../../src/theme'

const Ranking = () => {
  const [period, setPeriod] = useState<'all' | 'week'>('week')
  const { showActionSheetWithOptions } = useActionSheet()

  const handlePeriodPress = () => {
    showActionSheetWithOptions(
      {
        message: 'Choisi entre voir le score sur les 7 derniers jours ou depuis toujours',
        options: ['Classement 7 derniers jours', 'Classement depuis toujours'],
        title: 'Temporalité du classement',
      },
      (index) => {
        if (index === 0) {
          setPeriod('week')
        } else {
          setPeriod('all')
        }
      },
    )
  }

  return (
    <LinearGradient colors={['#D0D9EC', '#E6EAF2', '#EDECE7']} locations={[0, 0.2, 0.8]} style={styles.container}>
      <SafeAreaView style={styles.container}>
        <NavBar rightIcon={{ handlePress: () => router.back(), Icon: CalendarRange }} title="Top contributeurs" />
        <Button
          afterElement={<CalendarRange color={theme.text.base.invert} size={16} />}
          onPress={handlePeriodPress}
          size="sm"
          style={styles.button}
          title={period === 'week' ? '7 derniers jours' : 'depuis toujours'}
        />
        <Podium period={period} />
      </SafeAreaView>
    </LinearGradient>
  )
}

const styles = StyleSheet.create({
  button: { alignSelf: 'center', marginTop: theme.spacing[200] },
  container: {
    flex: 1,
  },
})

export default Ranking
