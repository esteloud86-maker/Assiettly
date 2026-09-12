"use client";

import Link from "next/link";
import { useState } from "react";

type Mode = "SCANNER" | "CODE_BARRES" | "ETIQUETTE";

const MODES: { valeur: Mode; label: string }[] = [
  { valeur: "SCANNER", label: "Scanner" },
  { valeur: "CODE_BARRES", label: "Code-barres" },
  { valeur: "ETIQUETTE", label: "Étiquette" },
];

// Coordonnées en pourcentage du conteneur, ancrées sur le point du plat visé.
const BULLES_DEMO = [
  { label: "Riz", x: 30, y: 38, delai: 400 },
  { label: "Poulet grillé", x: 65, y: 56, delai: 900 },
  { label: "Brocolis", x: 38, y: 70, delai: 1400 },
];
const CENTRE_PLAT = { x: 50, y: 50 };

/**
 * Aperçu de l'écran de scan caméra — l'intégration réelle de l'IA vision
 * (Claude) arrive dans une prochaine étape. Ici, la capture déclenche une
 * analyse simulée pour donner le ton du produit final (bulles d'ingrédients
 * qui apparaissent progressivement), clairement présentée comme un aperçu.
 */
export function EcranScanMock() {
  const [mode, setMode] = useState<Mode>("SCANNER");
  const [analyseEnCours, setAnalyseEnCours] = useState(false);
  const [bullesVisibles, setBullesVisibles] = useState(0);

  function declencher() {
    setAnalyseEnCours(true);
    setBullesVisibles(0);
    BULLES_DEMO.forEach((_, i) => {
      setTimeout(() => setBullesVisibles((n) => n + 1), BULLES_DEMO[i].delai);
    });
  }

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-charbon-800 text-creme-50">
      <div className="flex items-center justify-between p-4">
        <Link href="/accueil" aria-label="Fermer" className="text-2xl">
          ✕
        </Link>
        <span className="font-titre font-semibold">Assiettly</span>
        <button aria-label="Aide" className="text-xl">
          ?
        </button>
      </div>

      <div className="relative mx-4 flex-1 overflow-hidden rounded-3xl bg-gradient-to-br from-charbon-600 to-charbon-800">
        {!analyseEnCours ? (
          <div className="flex h-full items-center justify-center text-center text-charbon-400">
            <p className="px-8 text-sm">
              Aperçu — la caméra et la détection par IA vision arrivent bientôt.
              <br />
              Appuie sur le déclencheur pour voir une démo.
            </p>
          </div>
        ) : (
          <>
            <div className="flex h-full items-center justify-center text-6xl">🍛</div>
            <svg className="absolute inset-0 h-full w-full" viewBox="0 0 100 100" preserveAspectRatio="none">
              {BULLES_DEMO.map((bulle, i) =>
                i < bullesVisibles ? (
                  <line
                    key={bulle.label}
                    x1={CENTRE_PLAT.x}
                    y1={CENTRE_PLAT.y}
                    x2={bulle.x}
                    y2={bulle.y}
                    stroke="#FBF4EC"
                    strokeWidth="0.3"
                    opacity="0.8"
                  />
                ) : null,
              )}
            </svg>
            {BULLES_DEMO.map((bulle, i) =>
              i < bullesVisibles ? (
                <div
                  key={bulle.label}
                  className="absolute flex -translate-x-1/2 -translate-y-1/2 items-center gap-2 rounded-full bg-creme-50 px-3 py-1 text-xs font-semibold text-charbon-800 shadow-lg"
                  style={{ top: `${bulle.y}%`, left: `${bulle.x}%` }}
                >
                  <span className="h-1.5 w-1.5 rounded-full bg-corail-500" />
                  {bulle.label}
                </div>
              ) : null,
            )}
            {bullesVisibles >= BULLES_DEMO.length ? (
              <div className="absolute inset-x-4 bottom-4 rounded-2xl bg-creme-50/95 p-4 text-center text-charbon-800">
                <p className="text-sm">La reconnaissance automatique arrive bientôt.</p>
                <Link href="/journal/ajouter" className="mt-2 inline-block font-semibold text-corail-600 hover:underline">
                  Ajouter ce repas manuellement →
                </Link>
              </div>
            ) : null}
          </>
        )}
      </div>

      <div className="space-y-4 p-4">
        <div className="flex justify-center gap-2 text-xs">
          {["0.5x", "1x"].map((z) => (
            <span key={z} className="rounded-full bg-creme-50/10 px-3 py-1">
              {z}
            </span>
          ))}
        </div>

        <div className="flex items-center justify-between px-6">
          <button aria-label="Flash" className="text-xl opacity-60">
            ⚡
          </button>
          <button
            onClick={declencher}
            aria-label="Déclencher"
            className="h-16 w-16 rounded-full border-4 border-creme-50 bg-transparent"
          />
          <button aria-label="Galerie" className="text-xl opacity-60">
            🖼️
          </button>
        </div>

        <div className="flex justify-center gap-2">
          {MODES.map((m) => (
            <button
              key={m.valeur}
              onClick={() => setMode(m.valeur)}
              className={`rounded-full px-4 py-1.5 text-xs font-medium ${
                mode === m.valeur ? "bg-corail-500 text-white" : "bg-creme-50/10 text-creme-50"
              }`}
            >
              {m.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
