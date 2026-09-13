import type { Metadata, Viewport } from "next";
import { Fredoka, Inter } from "next/font/google";
import { PwaInit } from "@/components/PwaInit";
import "./globals.css";

const fredoka = Fredoka({ subsets: ["latin"], variable: "--font-fredoka", weight: ["500", "600", "700"] });
const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });

export const metadata: Metadata = {
  title: "Assiettly — Suivi nutritionnel simple et motivant",
  description:
    "Assiettly t'aide à suivre ton alimentation au quotidien, sans culpabiliser, avec une flamme qui t'encourage à tenir tes objectifs.",
  manifest: "/manifest.webmanifest",
  icons: {
    icon: [
      { url: "/icons/icon-192.png", sizes: "192x192", type: "image/png" },
      { url: "/icons/icon-512.png", sizes: "512x512", type: "image/png" },
    ],
    // apple-touch-icon : Safari iOS ne lit pas toujours le manifest de la
    // même façon qu'Android/Chrome, cette balise dédiée reste nécessaire.
    apple: [{ url: "/icons/apple-touch-icon.png", sizes: "180x180", type: "image/png" }],
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Assiettly",
  },
};

// viewport-fit=cover est nécessaire pour que les env(safe-area-inset-*)
// (encoche, Dynamic Island, barre de gestes) renvoient de vraies valeurs
// plutôt que 0 — sans ça le contenu ignore ces zones. maximumScale reste
// volontairement absent : on ne désactive jamais le pinch-to-zoom
// (accessibilité), on évite seulement le zoom involontaire au focus d'un
// champ en gardant tous les inputs à 16px minimum (cf. globals.css).
// themeColor = corail, aligné sur theme_color du manifest PWA (couleur de
// la barre de statut/navigateur une fois l'app installée).
export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: "#F2603C",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr" className={`${fredoka.variable} ${inter.variable} scroll-smooth`}>
      <body>
        <PwaInit />
        {children}
      </body>
    </html>
  );
}
