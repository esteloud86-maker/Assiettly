import type { MealType } from "@assiettly/shared";
import { useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { api } from "@/api/client";

interface FoodResult {
  id: string;
  nom: string;
  marque: string | null;
  caloriesKcal100g: string;
}

const TYPES: { value: MealType; label: string }[] = [
  { value: "PETIT_DEJ", label: "Petit-déjeuner" },
  { value: "DEJEUNER", label: "Déjeuner" },
  { value: "DINER", label: "Dîner" },
  { value: "COLLATION", label: "Collation" },
];

interface ItemPanier {
  foodId?: string;
  nomLibre?: string;
  quantiteG: number;
  caloriesKcal?: number;
  proteinesG?: number;
  glucidesG?: number;
  lipidesG?: number;
  libelleAffiche: string;
}

export function AjouterRepasScreen({ navigation }: { navigation: { goBack: () => void } }) {
  const [type, setType] = useState<MealType>("DEJEUNER");
  const [recherche, setRecherche] = useState("");
  const [resultats, setResultats] = useState<FoodResult[]>([]);
  const [rechercheEnCours, setRechercheEnCours] = useState(false);
  const [codeBarre, setCodeBarre] = useState("");
  const [panier, setPanier] = useState<ItemPanier[]>([]);
  const [envoiEnCours, setEnvoiEnCours] = useState(false);
  const [erreur, setErreur] = useState<string | null>(null);

  async function rechercher(texte: string) {
    setRecherche(texte);
    if (texte.trim().length < 2) {
      setResultats([]);
      return;
    }
    setRechercheEnCours(true);
    try {
      const res = await api.get<FoodResult[]>(`/foods/search?q=${encodeURIComponent(texte.trim())}`);
      setResultats(res);
    } finally {
      setRechercheEnCours(false);
    }
  }

  function ajouterAuPanierDepuisAliment(food: FoodResult, quantiteG = 100) {
    setPanier((p) => [
      ...p,
      {
        foodId: food.id,
        quantiteG,
        libelleAffiche: `${food.nom}${food.marque ? ` (${food.marque})` : ""} — ${quantiteG} g`,
      },
    ]);
    setRecherche("");
    setResultats([]);
  }

  async function chercherParCodeBarre() {
    if (!codeBarre.trim()) return;
    setErreur(null);
    try {
      const food = await api.get<FoodResult>(`/foods/barcode/${codeBarre.trim()}`);
      ajouterAuPanierDepuisAliment(food);
      setCodeBarre("");
    } catch {
      setErreur("Produit introuvable pour ce code-barres.");
    }
  }

  function retirerDuPanier(index: number) {
    setPanier((p) => p.filter((_, i) => i !== index));
  }

  async function valider() {
    if (panier.length === 0) return;
    setEnvoiEnCours(true);
    setErreur(null);
    try {
      await api.post("/meals", {
        date: new Date().toISOString().slice(0, 10),
        type,
        items: panier.map(({ libelleAffiche: _libelleAffiche, ...item }) => item),
      });
      navigation.goBack();
    } catch (e) {
      setErreur(e instanceof Error ? e.message : "Erreur lors de l'ajout du repas");
    } finally {
      setEnvoiEnCours(false);
    }
  }

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scroll}>
        <Text style={styles.titre}>Ajouter un repas</Text>

        <View style={styles.pillRow}>
          {TYPES.map((t) => (
            <Pressable
              key={t.value}
              onPress={() => setType(t.value)}
              style={[styles.pill, type === t.value && styles.pillActive]}
            >
              <Text style={[styles.pillTexte, type === t.value && styles.pillTexteActif]}>{t.label}</Text>
            </Pressable>
          ))}
        </View>

        <Text style={styles.label}>Rechercher un aliment</Text>
        <TextInput
          style={styles.input}
          placeholder="ex : pain au chocolat, yaourt..."
          value={recherche}
          onChangeText={rechercher}
        />
        {rechercheEnCours ? <ActivityIndicator style={{ marginTop: 8 }} color="#F97316" /> : null}
        {resultats.map((food) => (
          <Pressable key={food.id} style={styles.resultat} onPress={() => ajouterAuPanierDepuisAliment(food)}>
            <Text style={styles.resultatNom}>
              {food.nom}
              {food.marque ? ` — ${food.marque}` : ""}
            </Text>
            <Text style={styles.resultatDetail}>{Math.round(Number(food.caloriesKcal100g))} kcal / 100 g</Text>
          </Pressable>
        ))}

        <Text style={styles.label}>Ou scanner un code-barres</Text>
        <View style={styles.ligneCodeBarre}>
          <TextInput
            style={[styles.input, { flex: 1 }]}
            placeholder="Code-barres (EAN)"
            keyboardType="numeric"
            value={codeBarre}
            onChangeText={setCodeBarre}
          />
          <Pressable style={styles.boutonSecondaire} onPress={chercherParCodeBarre}>
            <Text style={styles.boutonSecondaireTexte}>OK</Text>
          </Pressable>
        </View>

        {panier.length > 0 ? (
          <View style={styles.panier}>
            <Text style={styles.label}>Repas en cours</Text>
            <FlatList
              data={panier}
              scrollEnabled={false}
              keyExtractor={(_, i) => String(i)}
              renderItem={({ item, index }) => (
                <View style={styles.itemPanier}>
                  <Text style={styles.itemPanierTexte}>{item.libelleAffiche}</Text>
                  <Pressable onPress={() => retirerDuPanier(index)}>
                    <Text style={styles.supprimer}>✕</Text>
                  </Pressable>
                </View>
              )}
            />
          </View>
        ) : null}

        {erreur ? <Text style={styles.erreur}>{erreur}</Text> : null}
      </ScrollView>

      <Pressable
        style={[styles.boutonValider, panier.length === 0 && styles.boutonDesactive]}
        onPress={valider}
        disabled={panier.length === 0 || envoiEnCours}
      >
        {envoiEnCours ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.boutonValiderTexte}>Valider le repas ({panier.length})</Text>
        )}
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#FFF7ED" },
  scroll: { padding: 20, paddingBottom: 100 },
  titre: { fontSize: 22, fontWeight: "700", marginBottom: 16 },
  label: { fontSize: 14, fontWeight: "600", marginTop: 16, marginBottom: 8 },
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
  resultat: { backgroundColor: "#fff", borderRadius: 10, padding: 12, marginTop: 8 },
  resultatNom: { fontWeight: "600" },
  resultatDetail: { color: "#78716C", fontSize: 12 },
  ligneCodeBarre: { flexDirection: "row", gap: 8, alignItems: "center" },
  boutonSecondaire: { backgroundColor: "#1C1917", borderRadius: 12, paddingVertical: 14, paddingHorizontal: 18 },
  boutonSecondaireTexte: { color: "#fff", fontWeight: "600" },
  panier: { marginTop: 8 },
  itemPanier: {
    flexDirection: "row",
    justifyContent: "space-between",
    backgroundColor: "#fff",
    padding: 12,
    borderRadius: 10,
    marginBottom: 6,
  },
  itemPanierTexte: { flex: 1 },
  supprimer: { color: "#DC2626", paddingHorizontal: 8 },
  erreur: { color: "#DC2626", marginTop: 12, textAlign: "center" },
  boutonValider: {
    position: "absolute",
    bottom: 20,
    left: 20,
    right: 20,
    backgroundColor: "#F97316",
    borderRadius: 12,
    padding: 16,
    alignItems: "center",
  },
  boutonDesactive: { opacity: 0.5 },
  boutonValiderTexte: { color: "#fff", fontWeight: "600", fontSize: 16 },
});
