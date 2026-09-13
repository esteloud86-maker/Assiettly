import type { Metadata, Viewport } from "next";
import { Fredoka, Inter } from "next/font/google";
import "./globals.css";

const fredoka = Fredoka({ subsets: ["latin"], variable: "--font-fredoka", weight: ["500", "600", "700"] });
const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });

export const metadata: Metadata = {
  title: "Assiettly — Suivi nutritionnel simple et motivant",
  description:
    "Assiettly t'aide à suivre ton alimentation au quotidien, sans culpabiliser, avec une flamme qui t'encourage à tenir tes objectifs.",
};

// viewport-fit=cover est nécessaire pour que les env(safe-area-inset-*)
// (encoche, Dynamic Island, barre de gestes) renvoient de vraies valeurs
// plutôt que 0 — sans ça le contenu ignore ces zones. maximumScale reste
// volontairement absent : on ne désactive jamais le pinch-to-zoom
// (accessibilité), on évite seulement le zoom involontaire au focus d'un
// champ en gardant tous les inputs à 16px minimum (cf. globals.css).
export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: "#FBF4EC",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr" className={`${fredoka.variable} ${inter.variable} scroll-smooth`}>
      <body>{children}</body>
    </html>
  );
}
