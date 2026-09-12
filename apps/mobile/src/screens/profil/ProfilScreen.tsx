import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { useAuth } from "@/context/AuthContext";
import { useProfile } from "@/hooks/useProfile";

const LIBELLES_OBJECTIF: Record<string, string> = {
  PERTE: "Perte de poids",
  MAINTIEN: "Maintien",
  PRISE_MASSE: "Prise de masse",
};

export function ProfilScreen() {
  const { session, signOut } = useAuth();
  const { profile } = useProfile();

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.titre}>Mon profil</Text>

      <View style={styles.carte}>
        <Text style={styles.ligne}>{session?.user.email}</Text>
        {profile?.objectifType ? (
          <Text style={styles.ligneMuted}>Objectif : {LIBELLES_OBJECTIF[profile.objectifType]}</Text>
        ) : null}
        {profile?.goals[0] ? (
          <Text style={styles.ligneMuted}>{profile.goals[0].objectifCaloriesKcal} kcal / jour</Text>
        ) : null}
      </View>

      <View style={styles.carte}>
        <Text style={styles.sectionTitre}>Données & confidentialité</Text>
        <Text style={styles.ligneMuted}>
          Conformément au RGPD, tu peux demander l'export ou la suppression de tes données à tout moment depuis
          les paramètres de ton compte.
        </Text>
      </View>

      <Pressable style={styles.bouton} onPress={signOut}>
        <Text style={styles.boutonTexte}>Se déconnecter</Text>
      </Pressable>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#FFF7ED", padding: 20 },
  titre: { fontSize: 24, fontWeight: "700", marginBottom: 16 },
  carte: { backgroundColor: "#fff", borderRadius: 16, padding: 16, marginBottom: 16 },
  sectionTitre: { fontWeight: "700", marginBottom: 8 },
  ligne: { fontSize: 16, fontWeight: "600" },
  ligneMuted: { color: "#78716C", marginTop: 4 },
  bouton: { backgroundColor: "#1C1917", borderRadius: 12, padding: 16, alignItems: "center", marginTop: 12 },
  boutonTexte: { color: "#fff", fontWeight: "600" },
});
