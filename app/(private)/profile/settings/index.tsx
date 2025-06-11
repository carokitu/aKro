import { ArrowRight, Bell, CircleAlert, Landmark, LogOut, type LucideIcon, Pencil } from 'lucide-react-native'
import { useState } from 'react'
import { SafeAreaView, StyleSheet, TouchableOpacity, View } from 'react-native'

import { router } from 'expo-router'

import { useUser } from '../../../../hooks'
import { type User } from '../../../../models'
import { NavBar } from '../../../../src'
import { Avatar, Error, Text, Title } from '../../../../src/system'
import { theme } from '../../../../src/theme'

const UserInfo = ({ user }: { user: User }) => {
  return (
    <View style={styles.userInfo}>
      <Avatar avatar={user.avatar_url} size="lg" />
      <View>
        <Title>{user.name}</Title>
        <Text>{user.username}</Text>
      </View>
    </View>
  )
}

const Card = ({ handlePress, Icon, title }: { handlePress: () => void; Icon: LucideIcon; title: string }) => {
  const [isPressed, setIsPressed] = useState(false)

  return (
    <TouchableOpacity
      activeOpacity={1}
      onPress={handlePress}
      onPressIn={() => setIsPressed(true)}
      onPressOut={() => setIsPressed(false)}
      style={[styles.card, isPressed && styles.cardPressed]}
    >
      <View style={styles.cardContent}>
        <Icon color={theme.text.base.default} size={theme.fontSize.lg} />
        <Title>{title}</Title>
      </View>
      <ArrowRight color={theme.text.base.default} size={theme.fontSize.lg} />
    </TouchableOpacity>
  )
}

const Settings = () => {
  const { user } = useUser()

  if (!user) {
    return (
      <SafeAreaView style={styles.container}>
        <NavBar title="Paramètres" />
        <Error />
      </SafeAreaView>
    )
  }

  return (
    <SafeAreaView style={styles.container}>
      <NavBar title="Paramètres" />
      <UserInfo user={user} />
      <View style={styles.cards}>
        <Card
          handlePress={() => router.push('/profile/settings/edit-profile')}
          Icon={Pencil}
          title="Modifier mon profil"
        />
        <Card handlePress={() => console.log('Gérer les notifications')} Icon={Bell} title="Gérer les notifications" />
        <Card handlePress={() => console.log('Signaler un problème')} Icon={CircleAlert} title="Signaler un problème" />
        <Card
          handlePress={() => console.log('Confidentialité et légal')}
          Icon={Landmark}
          title="Confidentialité et légal"
        />
        <Card handlePress={() => console.log('Se déconnecter')} Icon={LogOut} title="Se déconnecter" />
      </View>
    </SafeAreaView>
  )
}

export default Settings

const styles = StyleSheet.create({
  card: {
    alignItems: 'center',
    borderRadius: theme.radius.medium,
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginHorizontal: theme.spacing[300],
    paddingHorizontal: theme.spacing[100],
    paddingVertical: theme.spacing[300],
  },
  cardContent: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: theme.spacing[300],
  },
  cardPressed: {
    backgroundColor: theme.surface.base.secondary,
  },
  cards: {
    gap: theme.spacing[400],
  },
  container: {
    gap: theme.spacing[200],
  },
  userInfo: {
    alignItems: 'center',
    backgroundColor: theme.surface.base.secondary,
    borderRadius: theme.radius.medium,
    flexDirection: 'row',
    gap: theme.spacing[600],
    margin: theme.spacing[300],
    padding: theme.spacing[300],
  },
})
