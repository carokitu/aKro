import { ScrollView, StyleSheet } from 'react-native'

import { NavBar } from '../../../../src'
import { Text, Title } from '../../../../src/system'
import { theme } from '../../../../src/theme'
import { SafeAreaView } from 'react-native-safe-area-context'

const PrivacyPolicy = () => (
  <SafeAreaView style={styles.area}>
    <NavBar title="Politique de confidentialité" />
    <ScrollView style={styles.container}>
      <Title style={styles.title}>Qui sommes-nous ?</Title>
      <Text>
        L’application Akro est éditée par la société akro, dont la mission est de permettre aux utilisateurs de
        découvrir, partager et soutenir leurs artistes préférés. Pour toute question, tu peux nous contacter à :
        contact@akroapp.com
      </Text>
      <Title style={styles.title}>Données collectées</Title>
      <Text>
        Nous collectons uniquement les données strictement nécessaires au bon fonctionnement de l'application :{'\n'}•
        Adresse email ou numéro de téléphone (authentification){'\n'}• Nom d'utilisateur, username, date de naissance et
        photo de profil{'\n'}• Identifiant Spotify{'\n'}• Feedback ou rapports de bugs que vous nous envoyez{'\n'}•
        Données d’interaction : posts, commentaires, amis suivis{'\n'}• Données techniques: logs d’erreur, bugs signalés
        (volontairement), device info (pour debug)
      </Text>
      <Title style={styles.title}>Pourquoi collectons-nous ces données ?</Title>
      <Text>
        Les données collectées sont utilisées pour :{'\n'}• Vous authentifier de manière sécurisée{'\n'}• Afficher votre
        profil à d'autres utilisateurs{'\n'}• Partager du contenu musical avec tes amis{'\n'}• Améliorer l'application
        et corriger les bugs{'\n'}• Vous contacter si besoin (retour sur un bug, mise à jour importante)
        {'\n'}• Vous envoyer des notifications personnalisées
      </Text>
      <Title style={styles.title}>Base légale du traitement</Title>
      <Text>
        Nous traitons les données sur la base de : Ton consentement (ex. : accès Spotify) La nécessité contractuelle
        (ex. : fonctionnement de ton compte) Nos intérêts légitimes (ex. : sécurité, amélioration continue)
      </Text>
      <Title style={styles.title}>Où sont stockées tes données ?</Title>
      <Text>Toutes les données sont hébergées chez Supabase, en Europe.</Text>
      <Title style={styles.title}>Combien de temps sont-elles conservées ?</Title>
      <Text>
        • Données de compte : jusqu’à suppression du compte{'\n'}• Données de bug/feedback : 2 ans maximum{'\n'}•
        Données techniques : quelques jours à quelques semaines, selon le besoin
      </Text>
      <Title style={styles.title}>Tes droits</Title>
      <Text>
        Conformément au RGPD, tu peux :{'\n'}• Accéder à tes données{'\n'}• Les corriger{'\n'}• Demander leur
        suppression{'\n'}• Retirer ton consentement à tout moment 📩 Il suffit de nous écrire à contact@akroapp.com
      </Text>
      <Title style={styles.title}>Sous-traitants</Title>
      <Text>
        Nous utilisons des services de confiance pour le stockage et l’envoi d’emails, comme : Supabase (base de
        données, auth), Expo et Spotify (via leur API, avec ton autorisation explicite)
      </Text>
      <Title style={styles.title}>Cookies & suivi</Title>
      <Text>
        Akro ne contient pas de cookies de tracking tiers. Nous utilisons éventuellement des outils d’analyse anonymisés
        pour améliorer le produit (ex : nombre d’ouvertures d’écran).
      </Text>
      <Title style={styles.title}>Modifications</Title>
      <Text>Cette politique pourra être mise à jour. Tu seras notifié·e en cas de changements majeurs.</Text>
      <Title style={styles.title}>Contact</Title>
      <Text>Des questions ? Un souci ? Écris-nous à : contact@akroapp.com</Text>
    </ScrollView>
  </SafeAreaView>
)

export default PrivacyPolicy

const styles = StyleSheet.create({
  area: {
    flex: 1,
  },
  container: {
    paddingHorizontal: theme.spacing[400],
  },
  title: {
    marginVertical: theme.spacing[200],
  },
})
