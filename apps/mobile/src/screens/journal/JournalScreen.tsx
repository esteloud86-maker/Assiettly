import { useCallback, useState } from "react";
import { useFocusEffect } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { api } from "@/api/client";
import type { JournalStackParamList } from "@/navigation/types";

const LIBELLES_TYPE: Record<string, string> = {
  PETIT_DEJ: "Petit-déjeuner",
  DEJEUNER: "Déjeuner",
  DINER: "Dîner",
  COLLATION: "Collation",
};

interface MealItem {
  id: string;
  nomLibre: string | null;
  quantiteG: string;
  caloriesKcal: string;
  food: { nom: string } | null;
}

interface Meal {
  id: string;
  type: string;
  items: MealItem[];
}

interface MealsResponse {
  meals: Meal[];
  totaux: { caloriesKcal: number; proteinesG: number; glucidesG: number; lipidesG: number };
}

type Nav = NativeStackNavigationProp<JournalStackParamList, "Journal">;

export function JournalScreen({ navigation }: { navigation: Nav }) {
  const [data, setData] = useState<MealsResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const aujourdHui = new Date().toISOString().slice(0, 10);

  const charger = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.get<MealsResponse>(`/meals?date=${aujourdHui}`);
      setData(res);
    } finally {
      setLoading(false);
    }
  }, [aujourdHui]);

  useFocusEffect(
    useCallback(() => {
      charger();
    }, [charger]),
  );

  async function supprimerRepas(id: string) {
    await api.delete(`/meals/${id}`);
    charger();
  }

  if (loading && !data) {
    return (
      <View style={styles.centre}>
        <ActivityIndicator size="large" color="#F97316" />
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.titre}>Journal du jour</Text>
      <Text style={styles.totalCalories}>{Math.round(data?.totaux.caloriesKcal ?? 0)} kcal loggées</Text>

      {(data?.meals.length ?? 0) === 0 ? (
        <Text style={styles.vide}>Aucun repas loggé pour l'instant.</Text>
      ) : (
        data?.meals.map((meal) => (
          <View key={meal.id} style={styles.carteRepas}>
            <View style={styles.enteteRepas}>
              <Text style={styles.typeRepas}>{LIBELLES_TYPE[meal.type] ?? meal.type}</Text>
              <Pressable onPress={() => supprimerRepas(meal.id)}>
                <Text style={styles.supprimer}>Supprimer</Text>
              </Pressable>
            </View>
            {meal.items.map((item) => (
              <Text key={item.id} style={styles.item}>
                • {item.food?.nom ?? item.nomLibre} ({Number(item.quantiteG)} g) —{" "}
                {Math.round(Number(item.caloriesKcal))} kcal
              </Text>
            ))}
          </View>
        ))
      )}

      <Pressable style={styles.boutonAjouter} onPress={() => navigation.navigate("AjouterRepas")}>
        <Text style={styles.boutonAjouterTexte}>+ Ajouter un repas</Text>
      </Pressable>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#FFF7ED", padding: 20 },
  centre: { flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: "#FFF7ED" },
  titre: { fontSize: 24, fontWeight: "700" },
  totalCalories: { color: "#78716C", marginBottom: 20 },
  vide: { color: "#78716C", marginBottom: 20 },
  carteRepas: { backgroundColor: "#fff", borderRadius: 14, padding: 16, marginBottom: 12 },
  enteteRepas: { flexDirection: "row", justifyContent: "space-between", marginBottom: 8 },
  typeRepas: { fontWeight: "700", fontSize: 15 },
  supprimer: { color: "#DC2626", fontSize: 13 },
  item: { color: "#44403C", marginBottom: 2 },
  boutonAjouter: {
    backgroundColor: "#F97316",
    borderRadius: 12,
    padding: 16,
    alignItems: "center",
    marginVertical: 20,
  },
  boutonAjouterTexte: { color: "#fff", fontWeight: "600", fontSize: 16 },
});
