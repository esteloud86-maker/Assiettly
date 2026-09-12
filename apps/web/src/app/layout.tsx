import type { Metadata } from "next";
import { Fredoka, Inter } from "next/font/google";
import "./globals.css";

const fredoka = Fredoka({ subsets: ["latin"], variable: "--font-fredoka", weight: ["500", "600", "700"] });
const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });

export const metadata: Metadata = {
  title: "Assiettly — Suivi nutritionnel simple et motivant",
  description:
    "Assiettly t'aide à suivre ton alimentation au quotidien, sans culpabiliser, avec une flamme qui t'encourage à tenir tes objectifs.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr" className={`${fredoka.variable} ${inter.variable} scroll-smooth`}>
      <body>{children}</body>
    </html>
  );
}
