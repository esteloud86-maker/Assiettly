import type { NiveauActivite, ObjectifType, Sexe } from "@assiettly/shared";
import { useState } from "react";
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from "react-native";
import { api } from "@/api/client";

const NIVEAUX: { value: NiveauActivite; label: string }[] = [
  { value: "SEDENTAIRE", label: "Sédentaire" },
  { value: "LEGER", label: "Légèrement actif" },
  { value: "MODERE", label: "Modérément actif" },
  { value: "ACTIF", label: "Actif" },
  { value: "TRES_ACTIF", label: "Très actif" },
];

const OBJECTIFS: { value: ObjectifType; label: string }[] = [
  { value: "PERTE", label: "Perte de poids" },
  { value: "MAINTIEN", label: "Maintien" },
  { value: "PRISE_MASSE", label: "Prise de masse" },
];

function Pill<T extends string>({
  options,
  value,
  onChange,
}: {
  options: { value: T; label: string }[];
  value: T | null;
  onChange: (v: T) => void;
}) {
  return (
    <View style={styles.pillRow}>
      {options.map((o) => (
        <Pressable
          key={o.value}
          onPress={() => onChange(o.value)}
          style={[styles.pill, value === o.value && styles.pillActive]}
        >
          <Text style={[styles.pillTexte, value === o.value && styles.pillTexteActif]}>{o.label}</Text>
        </Pressable>
      ))}
    </View>
  );
}

export function OnboardingScreen({ onTermine }: { onTermine: () => void }) {
  const [sexe, setSexe] = useState<Sexe | null>(null);
  const [dateNaissance, setDateNaissance] = useState(""); // YYYY-MM-DD
  const [tailleCm, setTailleCm] = useState("");
  const [poidsKg, setPoidsKg] = useState("");
  const [niveauActivite, setNiveauActivite] = useState<NiveauActivite | null>(null);
  const [objectifType, setObjectifType] = useState<ObjectifType | null>(null);
  const [erreur, setErreur] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const pretAValider =
    sexe && dateNaissance.match(/^\d{4}-\d{2}-\d{2}$/) && tailleCm && poidsKg && niveauActivite && objectifType;

  async function valider() {
    if (!pretAValider) return;
    setErreur(null);
    setLoading(true);
    try {
      await api.put("/me", {
        sexe,
        dateNaissance,
        tailleCm: Number(tailleCm),
        niveauActivite,
        objectifType,
      });
      await api.post("/weight", { poidsKg: Number(poidsKg), date: new Date().toISOString().slice(0, 10) });
      await api.post("/me/goals/calculate");
      onTermine();
    } catch (e) {
      setErreur(e instanceof Error ? e.message : "Erreur lors de l'enregistrement du profil");
    } finally {
      setLoading(false);
    }
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.titre}>Ton profil</Text>
      <Text style={styles.sousTitre}>Pour calculer tes objectifs caloriques personnalisés.</Text>

      <Text style={styles.label}>Sexe</Text>
      <Pill
        options={[
          { value: "FEMME", label: "Femme" },
          { value: "HOMME", label: "Homme" },
        ]}
        value={sexe}
        onChange={setSexe}
      />

      <Text style={styles.label}>Date de naissance (AAAA-MM-JJ)</Text>
      <TextInput
        style={styles.input}
        placeholder="1995-06-15"
        value={dateNaissance}
        onChangeText={setDateNaissance}
      />

      <Text style={styles.label}>Taille (cm)</Text>
      <TextInput style={styles.input} placeholder="170" keyboardType="numeric" value={tailleCm} onChangeText={setTailleCm} />

      <Text style={styles.label}>Poids actuel (kg)</Text>
      <TextInput style={styles.input} placeholder="68" keyboardType="numeric" value={poidsKg} onChangeText={setPoidsKg} />

      <Text style={styles.label}>Niveau d'activité</Text>
      <Pill options={NIVEAUX} value={niveauActivite} onChange={setNiveauActivite} />

      <Text style={styles.label}>Objectif</Text>
      <Pill options={OBJECTIFS} value={objectifType} onChange={setObjectifType} />

      {erreur ? <Text style={styles.erreur}>{erreur}</Text> : null}

      <Pressable
        style={[styles.bouton, !pretAValider && styles.boutonDesactive]}
        onPress={valider}
        disabled={!pretAValider || loading}
      >
        {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.boutonTexte}>Calculer mes objectifs</Text>}
      </Pressable>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { padding: 24, backgroundColor: "#FFF7ED", flexGrow: 1 },
  titre: { fontSize: 26, fontWeight: "700", marginBottom: 4 },
  sousTitre: { fontSize: 15, color: "#78716C", marginBottom: 24 },
  label: { fontSize: 14, fontWeight: "600", marginBottom: 8, marginTop: 12 },
  input: { backgroundColor: "#fff", borderRadius: 12, padding: 14, borderWidth: 1, borderColor: "#E7E5E4" },
  pillRow: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  pill: {
    borderWidth: 1,
    borderColor: "#E7E5E4",
    borderRadius: 20,
    paddingVertical: 8,
    paddingHorizontal: 14,
    backgroundColor: "#fff",
  },
  pillActive: { backgroundColor: "#F97316", borderColor: "#F97316" },
  pillTexte: { color: "#44403C" },
  pillTexteActif: { color: "#fff", fontWeight: "600" },
  bouton: { backgroundColor: "#F97316", borderRadius: 12, padding: 16, alignItems: "center", marginTop: 28 },
  boutonDesactive: { opacity: 0.5 },
  boutonTexte: { color: "#fff", fontWeight: "600", fontSize: 16 },
  erreur: { color: "#DC2626", marginTop: 16, textAlign: "center" },
});
