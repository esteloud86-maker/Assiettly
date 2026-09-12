import { StyleSheet, Text, View } from "react-native";

export function FlammeBadge({ streak }: { streak: number }) {
  const allumee = streak > 0;
  return (
    <View style={styles.container}>
      <Text style={[styles.emoji, !allumee && styles.emojiEteint]}>🔥</Text>
      <Text style={styles.nombre}>{streak}</Text>
      <Text style={styles.libelle}>{streak > 1 ? "jours de suite" : "jour"}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { alignItems: "center", justifyContent: "center", paddingVertical: 16 },
  emoji: { fontSize: 56 },
  emojiEteint: { opacity: 0.35 },
  nombre: { fontSize: 40, fontWeight: "800", color: "#1C1917" },
  libelle: { fontSize: 14, color: "#78716C" },
});
