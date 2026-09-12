import { useCallback, useState } from "react";
import { useFocusEffect } from "@react-navigation/native";
import { ActivityIndicator, RefreshControl, ScrollView, StyleSheet, Text, View } from "react-native";
import { api } from "@/api/client";
import { BarreProgression } from "@/components/BarreProgression";
import { FlammeBadge } from "@/components/FlammeBadge";
import type { Goal } from "@/hooks/useProfile";

interface StreakSummaryResponse {
  streakActuel: number;
  streakMax: number;
  freezesRestantsCeMois: number;
  prochainPalier: number | null;
}

interface MealsResponse {
  totaux: { caloriesKcal: number; proteinesG: number; glucidesG: number; lipidesG: number };
}

export function HomeScreen() {
  const [streak, setStreak] = useState<StreakSummaryResponse | null>(null);
  const [goal, setGoal] = useState<Goal | null>(null);
  const [totaux, setTotaux] = useState<MealsResponse["totaux"] | null>(null);
  const [loading, setLoading] = useState(true);

  const charger = useCallback(async () => {
    setLoading(true);
    try {
      const aujourdHui = new Date().toISOString().slice(0, 10);
      const [streakData, goalData, mealsData] = await Promise.all([
        api.get<StreakSummaryResponse>("/streaks/summary"),
        api.get<Goal | null>("/me/goals"),
        api.get<MealsResponse>(`/meals?date=${aujourdHui}`),
      ]);
      setStreak(streakData);
      setGoal(goalData);
      setTotaux(mealsData.totaux);
    } finally {
      setLoading(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      charger();
    }, [charger]),
  );

  if (loading && !streak) {
    return (
      <View style={styles.centre}>
        <ActivityIndicator size="large" color="#F97316" />
      </View>
    );
  }

  return (
    <ScrollView
      style={styles.container}
      refreshControl={<RefreshControl refreshing={loading} onRefresh={charger} />}
    >
      <FlammeBadge streak={streak?.streakActuel ?? 0} />

      {streak?.prochainPalier ? (
        <Text style={styles.prochainPalier}>
          Encore {streak.prochainPalier - streak.streakActuel} jour(s) avant le badge {streak.prochainPalier} jours 🏅
        </Text>
      ) : null}

      <Text style={styles.freezes}>❄️ {streak?.freezesRestantsCeMois ?? 0} freeze(s) restant(s) ce mois-ci</Text>

      <View style={styles.carte}>
        <Text style={styles.carteTitre}>Aujourd'hui</Text>
        {goal ? (
          <>
            <BarreProgression
              label="Calories"
              valeur={totaux?.caloriesKcal ?? 0}
              objectif={goal.objectifCaloriesKcal}
              unite="kcal"
              couleur="#F97316"
            />
            <BarreProgression
              label="Protéines"
              valeur={totaux?.proteinesG ?? 0}
              objectif={goal.objectifProteinesG}
              unite="g"
              couleur="#DC2626"
            />
            <BarreProgression
              label="Glucides"
              valeur={totaux?.glucidesG ?? 0}
              objectif={goal.objectifGlucidesG}
              unite="g"
              couleur="#2563EB"
            />
            <BarreProgression
              label="Lipides"
              valeur={totaux?.lipidesG ?? 0}
              objectif={goal.objectifLipidesG}
              unite="g"
              couleur="#CA8A04"
            />
          </>
        ) : (
          <Text style={styles.texteMuted}>Aucun objectif défini pour le moment.</Text>
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#FFF7ED", padding: 20 },
  centre: { flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: "#FFF7ED" },
  prochainPalier: { textAlign: "center", color: "#78716C", marginBottom: 8 },
  freezes: { textAlign: "center", color: "#78716C", marginBottom: 20 },
  carte: { backgroundColor: "#fff", borderRadius: 16, padding: 18 },
  carteTitre: { fontSize: 18, fontWeight: "700", marginBottom: 16 },
  texteMuted: { color: "#78716C" },
});
