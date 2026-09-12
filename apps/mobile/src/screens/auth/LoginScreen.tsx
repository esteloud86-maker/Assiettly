import { useState } from "react";
import { ActivityIndicator, Pressable, StyleSheet, Text, TextInput, View } from "react-native";
import { useAuth } from "@/context/AuthContext";

export function LoginScreen({ navigation }: { navigation: { navigate: (screen: string) => void } }) {
  const { signInWithEmail } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [erreur, setErreur] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleConnexion() {
    setErreur(null);
    setLoading(true);
    try {
      await signInWithEmail(email.trim(), password);
    } catch (e) {
      setErreur(e instanceof Error ? e.message : "Erreur de connexion");
    } finally {
      setLoading(false);
    }
  }

  return (
    <View style={styles.container}>
      <Text style={styles.titre}>🔥 Assiettly</Text>
      <Text style={styles.sousTitre}>Suis ton alimentation, garde ta flamme.</Text>

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
        placeholder="Mot de passe"
        secureTextEntry
        value={password}
        onChangeText={setPassword}
      />

      {erreur ? <Text style={styles.erreur}>{erreur}</Text> : null}

      <Pressable style={styles.bouton} onPress={handleConnexion} disabled={loading}>
        {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.boutonTexte}>Se connecter</Text>}
      </Pressable>

      <Pressable onPress={() => navigation.navigate("Signup")}>
        <Text style={styles.lien}>Pas encore de compte ? Créer un compte</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: "center", padding: 24, backgroundColor: "#FFF7ED" },
  titre: { fontSize: 32, fontWeight: "700", textAlign: "center", marginBottom: 4 },
  sousTitre: { fontSize: 15, textAlign: "center", color: "#78716C", marginBottom: 32 },
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
