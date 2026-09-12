import { StyleSheet, Text, View } from "react-native";

export function BarreProgression({
  label,
  valeur,
  objectif,
  unite,
  couleur,
}: {
  label: string;
  valeur: number;
  objectif: number;
  unite: string;
  couleur: string;
}) {
  const pct = objectif > 0 ? Math.min(100, (valeur / objectif) * 100) : 0;
  return (
    <View style={styles.container}>
      <View style={styles.ligne}>
        <Text style={styles.label}>{label}</Text>
        <Text style={styles.valeur}>
          {Math.round(valeur)} / {Math.round(objectif)} {unite}
        </Text>
      </View>
      <View style={styles.piste}>
        <View style={[styles.remplissage, { width: `${pct}%`, backgroundColor: couleur }]} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { marginBottom: 14 },
  ligne: { flexDirection: "row", justifyContent: "space-between", marginBottom: 4 },
  label: { fontSize: 13, fontWeight: "600", color: "#44403C" },
  valeur: { fontSize: 13, color: "#78716C" },
  piste: { height: 8, borderRadius: 4, backgroundColor: "#E7E5E4", overflow: "hidden" },
  remplissage: { height: "100%", borderRadius: 4 },
});
