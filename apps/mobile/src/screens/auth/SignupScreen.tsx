import { useState } from "react";
import { ActivityIndicator, Pressable, StyleSheet, Text, TextInput, View } from "react-native";
import { useAuth } from "@/context/AuthContext";

export function SignupScreen({ navigation }: { navigation: { navigate: (screen: string) => void } }) {
  const { signUpWithEmail } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [erreur, setErreur] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [inscrit, setInscrit] = useState(false);

  async function handleInscription() {
    setErreur(null);
    if (password.length < 6) {
      setErreur("Le mot de passe doit contenir au moins 6 caractères.");
      return;
    }
    setLoading(true);
    try {
      await signUpWithEmail(email.trim(), password);
      setInscrit(true);
    } catch (e) {
      setErreur(e instanceof Error ? e.message : "Erreur lors de l'inscription");
    } finally {
      setLoading(false);
    }
  }

  if (inscrit) {
    return (
      <View style={styles.container}>
        <Text style={styles.titre}>Vérifie ta boîte mail 📩</Text>
        <Text style={styles.sousTitre}>
          Un e-mail de confirmation vient de t'être envoyé. Confirme ton adresse pour te connecter.
        </Text>
        <Pressable onPress={() => navigation.navigate("Login")}>
          <Text style={styles.lien}>Retour à la connexion</Text>
        </Pressable>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.titre}>Créer un compte</Text>

      <TextInput
        style={styles.input}
        placeholder="Adresse e-mail"
        autoCapitalize="none"
        keyboardType="email-address"
        value={email}
        onChangeText={setEmail}
      />
      <TextInput
        style={styles.input}
        placeholder="Mot de passe (6 caractères min.)"
        secureTextEntry
        value={password}
        onChangeText={setPassword}
      />

      {erreur ? <Text style={styles.erreur}>{erreur}</Text> : null}

      <Pressable style={styles.bouton} onPress={handleInscription} disabled={loading}>
        {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.boutonTexte}>Créer mon compte</Text>}
      </Pressable>

      <Pressable onPress={() => navigation.navigate("Login")}>
        <Text style={styles.lien}>Déjà un compte ? Se connecter</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: "center", padding: 24, backgroundColor: "#FFF7ED" },
  titre: { fontSize: 26, fontWeight: "700", textAlign: "center", marginBottom: 16 },
  sousTitre: { fontSize: 15, textAlign: "center", color: "#78716C", marginBottom: 24 },
  input: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 14,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#E7E5E4",
  },
  bouton: { backgroundColor: "#F97316", borderRadius: 12, padding: 16, alignItems: "center", marginTop: 8 },
  boutonTexte: { color: "#fff", fontWeight: "600", fontSize: 16 },
  lien: { textAlign: "center", marginTop: 20, color: "#F97316" },
  erreur: { color: "#DC2626", marginBottom: 8, textAlign: "center" },
});
