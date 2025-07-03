import { memo, useCallback } from 'react'
import { StyleSheet, View } from 'react-native'

import { usePost } from '../../../../hooks'
import { Label, Text } from '../../../system'
import { theme } from '../../../theme'

const Description = memo(({ description }: { description?: string }) => {
  const { setExpendedCommentsPostId, setExpendedDescription, setExpendedLikesPostId } = usePost()

  const handleSeeMore = useCallback(() => {
    setExpendedDescription(description)
    setExpendedLikesPostId(undefined)
    setExpendedCommentsPostId(undefined)
  }, [description, setExpendedCommentsPostId, setExpendedDescription, setExpendedLikesPostId])

  if (!description) {
    return <View style={styles.emptyDescription} />
  }

  const showSeeMore = description.length > 60

  return (
    <View style={styles.container}>
      <Text color="invert" ellipsizeMode="tail" numberOfLines={1} size="small" style={styles.text}>
        {description}
      </Text>
      {showSeeMore && (
        <Label color="invert" onPress={handleSeeMore} size="small" style={styles.seeMore}>
          Voir plus
        </Label>
      )}
    </View>
  )
})

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 8,
    paddingTop: theme.spacing[200],
    paddingVertical: theme.spacing[400],
  },
  emptyDescription: {
    height: theme.spacing[1000],
  },
  seeMore: {
    flexShrink: 0,
    fontWeight: 'bold',
  },
  text: {
    flexGrow: 1,
    flexShrink: 1,
  },
})

export default Description
