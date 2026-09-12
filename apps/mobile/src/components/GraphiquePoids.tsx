import Svg, { Circle, Line, Polyline } from "react-native-svg";
import { StyleSheet, Text, View } from "react-native";

interface Point {
  date: string;
  poidsKg: number;
}

const LARGEUR = 320;
const HAUTEUR = 160;
const MARGE = 20;

export function GraphiquePoids({ points }: { points: Point[] }) {
  if (points.length < 2) {
    return (
      <View style={styles.vide}>
        <Text style={styles.videTexte}>Ajoute au moins deux pesées pour voir ta tendance.</Text>
      </View>
    );
  }

  const poids = points.map((p) => p.poidsKg);
  const min = Math.min(...poids);
  const max = Math.max(...poids);
  const echelle = max - min || 1;

  const coordonnees = points.map((p, i) => {
    const x = MARGE + (i / (points.length - 1)) * (LARGEUR - 2 * MARGE);
    const y = HAUTEUR - MARGE - ((p.poidsKg - min) / echelle) * (HAUTEUR - 2 * MARGE);
    return { x, y };
  });

  const polylinePoints = coordonnees.map((c) => `${c.x},${c.y}`).join(" ");

  return (
    <View>
      <Svg width={LARGEUR} height={HAUTEUR}>
        <Line x1={MARGE} y1={HAUTEUR - MARGE} x2={LARGEUR - MARGE} y2={HAUTEUR - MARGE} stroke="#E7E5E4" />
        <Polyline points={polylinePoints} fill="none" stroke="#F97316" strokeWidth={2} />
        {coordonnees.map((c, i) => (
          <Circle key={i} cx={c.x} cy={c.y} r={3} fill="#F97316" />
        ))}
      </Svg>
      <View style={styles.legende}>
        <Text style={styles.legendeTexte}>{min} kg</Text>
        <Text style={styles.legendeTexte}>{max} kg</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  vide: { height: HAUTEUR, alignItems: "center", justifyContent: "center" },
  videTexte: { color: "#78716C", textAlign: "center" },
  legende: { flexDirection: "row", justifyContent: "space-between", marginTop: 4 },
  legendeTexte: { color: "#78716C", fontSize: 12 },
});
