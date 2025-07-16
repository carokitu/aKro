import { X } from 'lucide-react-native'
import { useRef } from 'react'
import { StyleSheet, TouchableOpacity, View } from 'react-native'

import BottomSheet, { BottomSheetView } from '@gorhom/bottom-sheet'

import { usePost } from '../../../../hooks'
import { Text, Title } from '../../../system'
import { theme } from '../../../theme'

export const ExpendedDescription = () => {
  const { expendedDescription, setExpendedDescription } = usePost()
  const bottomSheetRef = useRef<BottomSheet>(null)

  if (!expendedDescription) {
    return null
  }

  return (
    <BottomSheet
      backgroundStyle={styles.background}
      enableDynamicSizing
      enablePanDownToClose
      handleIndicatorStyle={styles.onHandleIndicator}
      onChange={(index) => {
        if (index === -1) {
          setExpendedDescription(undefined)
        }
      }}
      onClose={() => {
        setExpendedDescription(undefined)
      }}
      ref={bottomSheetRef}
    >
      <BottomSheetView style={styles.bottomSheetContainer}>
        <View style={styles.sectionTitle}>
          <Title size="large">Description</Title>
          <TouchableOpacity onPress={() => setExpendedDescription(undefined)}>
            <X color={theme.text.base.default} size={28} />
          </TouchableOpacity>
        </View>
        <Text size="large" style={styles.description}>
          {expendedDescription}
        </Text>
      </BottomSheetView>
    </BottomSheet>
  )
}

const styles = StyleSheet.create({
  background: {
    backgroundColor: theme.surface.base.default,
    borderRadius: theme.radius.large,
  },
  bottomSheetContainer: {
    flex: 1,
    marginHorizontal: theme.spacing[400],
  },
  description: {
    marginBottom: theme.spacing[1000],
  },
  onHandleIndicator: {
    backgroundColor: theme.surface.base.secondaryPressed,
    height: 7,
    width: 40,
  },
  sectionTitle: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: theme.spacing['400'],
  },
})
