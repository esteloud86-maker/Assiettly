import { useCallback, useState } from "react";
import { useFocusEffect } from "@react-navigation/native";
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from "react-native";
import { api } from "@/api/client";
import { GraphiquePoids } from "@/components/GraphiquePoids";

interface WeightLog {
  id: string;
  poidsKg: string;
  date: string;
}

export function PoidsScreen() {
  const [logs, setLogs] = useState<WeightLog[]>([]);
  const [nouveauPoids, setNouveauPoids] = useState("");
  const [loading, setLoading] = useState(true);
  const [envoiEnCours, setEnvoiEnCours] = useState(false);

  const charger = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.get<WeightLog[]>("/weight");
      setLogs(res);
    } finally {
      setLoading(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      charger();
    }, [charger]),
  );

  async function enregistrer() {
    const poids = Number(nouveauPoids.replace(",", "."));
    if (!poids || poids <= 0) return;
    setEnvoiEnCours(true);
    try {
      await api.post("/weight", { poidsKg: poids, date: new Date().toISOString().slice(0, 10) });
      setNouveauPoids("");
      await charger();
    } finally {
      setEnvoiEnCours(false);
    }
  }

  const dernierPoids = logs.at(-1);

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.titre}>Suivi du poids</Text>

      {loading ? (
        <ActivityIndicator color="#F97316" style={{ marginVertical: 20 }} />
      ) : (
        <View style={styles.carte}>
          <GraphiquePoids
            points={logs.map((l) => ({ date: l.date, poidsKg: Number(l.poidsKg) }))}
          />
          {dernierPoids ? (
            <Text style={styles.dernierPoids}>Dernière pesée : {Number(dernierPoids.poidsKg)} kg</Text>
          ) : null}
        </View>
      )}

      <View style={styles.formulaire}>
        <TextInput
          style={styles.input}
          placeholder="Nouveau poids (kg)"
          keyboardType="numeric"
          value={nouveauPoids}
          onChangeText={setNouveauPoids}
        />
        <Pressable style={styles.bouton} onPress={enregistrer} disabled={envoiEnCours}>
          {envoiEnCours ? <ActivityIndicator color="#fff" /> : <Text style={styles.boutonTexte}>Enregistrer</Text>}
        </Pressable>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#FFF7ED", padding: 20 },
  titre: { fontSize: 24, fontWeight: "700", marginBottom: 16 },
  carte: { backgroundColor: "#fff", borderRadius: 16, padding: 16, alignItems: "center" },
  dernierPoids: { marginTop: 12, color: "#44403C", fontWeight: "600" },
  formulaire: { flexDirection: "row", gap: 10, marginTop: 20 },
  input: {
    flex: 1,
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 14,
    borderWidth: 1,
    borderColor: "#E7E5E4",
  },
  bouton: { backgroundColor: "#F97316", borderRadius: 12, paddingHorizontal: 20, justifyContent: "center" },
  boutonTexte: { color: "#fff", fontWeight: "600" },
});
