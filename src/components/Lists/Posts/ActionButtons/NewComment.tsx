import { Send } from 'lucide-react-native'
import { useState } from 'react'
import { KeyboardAvoidingView, Platform, StyleSheet, TextInput, View } from 'react-native'

import { useUser } from '../../../../../hooks'
import { Avatar, IconButton } from '../../../../system'
import { theme } from '../../../../theme'

export const NewComment = () => {
  const { user } = useUser()
  const [inputHeight, setInputHeight] = useState(40)

  if (!user) {
    return null
  }

  const handleSend = () => {
    console.log(user.avatar_url, 'send')
  }

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
      style={styles.container}
    >
      {/* <View> */}
      <Avatar avatar={user.avatar_url} />
      <TextInput
        keyboardType="twitter"
        multiline={false}
        onContentSizeChange={(e) => {
          setInputHeight(e.nativeEvent.contentSize.height)
        }}
        onSubmitEditing={handleSend}
        placeholder="Ajouter un commentaire"
        style={[styles.input, { height: inputHeight }]}
        submitBehavior="blurAndSubmit"
      />
      <IconButton Icon={Send} onPress={handleSend} size="md" variant="tertiary" />
      {/* </View> */}
    </KeyboardAvoidingView>
  )
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    borderColor: theme.border.base.default,
    borderTopWidth: 1,
    flex: 1,
    flexDirection: 'row',
    gap: theme.spacing['400'],
    paddingVertical: theme.spacing['400'],
  },
  input: {
    backgroundColor: theme.surface.base.secondary,
    borderRadius: theme.radius.base,
    flex: 1,
    fontSize: theme.fontSize.lg,
    fontWeight: theme.weight.medium,
    padding: theme.spacing['400'],
  },
})
