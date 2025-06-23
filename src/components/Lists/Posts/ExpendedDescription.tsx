import { useRef } from 'react'
import { StyleSheet } from 'react-native'

import BottomSheet, { BottomSheetView } from '@gorhom/bottom-sheet'

import { usePost } from '../../../../hooks'
import { Text, Title } from '../../../system'
import { theme } from '../../../theme'

const ExpendedDescription = () => {
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
        <Title size="large" style={styles.sectionTitle}>
          Description
        </Title>
        <Text size="large" style={styles.description}>
          {expendedDescription}
        </Text>
      </BottomSheetView>
    </BottomSheet>
  )
}

const styles = StyleSheet.create({
  background: {
    backgroundColor: theme.surface.base.secondary,
    borderRadius: theme.radius.large,
  },
  bottomSheetContainer: {
    flex: 1,
  },
  description: {
    marginBottom: theme.spacing[1000],
    marginHorizontal: theme.spacing[400],
  },
  onHandleIndicator: {
    backgroundColor: theme.surface.base.secondaryPressed,
    height: 7,
    width: 40,
  },
  sectionTitle: {
    marginBottom: theme.spacing['400'],
    marginLeft: theme.spacing['400'],
  },
})

export default ExpendedDescription
