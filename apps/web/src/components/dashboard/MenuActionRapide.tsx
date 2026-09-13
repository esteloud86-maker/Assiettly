"use client";

import Link from "next/link";
import { useState } from "react";

const ACTIONS = [
  { href: "/scanner", icone: "📷", label: "Scanner un repas" },
  { href: "/journal/ajouter?mode=code-barres", icone: "📦", label: "Code-barres" },
  { href: "/journal/ajouter", icone: "🔎", label: "Recherche manuelle" },
  { href: "/journal/ajouter?mode=manuel", icone: "✍️", label: "Saisie manuelle" },
];

export function MenuActionRapide() {
  const [ouvert, setOuvert] = useState(false);

  return (
    <>
      <button
        onClick={() => setOuvert(true)}
        aria-label="Ajouter"
        className="flex h-14 w-14 -translate-y-4 items-center justify-center rounded-full bg-corail-500 text-2xl font-bold text-white shadow-lg transition-transform hover:scale-105"
      >
        +
      </button>

      {ouvert ? (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-charbon-800/40" onClick={() => setOuvert(false)}>
          <div
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-md space-y-2 rounded-t-3xl bg-creme-50 p-5 pb-[calc(2rem+env(safe-area-inset-bottom))]"
          >
            <div className="mx-auto mb-2 h-1 w-10 rounded-full bg-creme-200" />
            <p className="mb-3 text-center font-titre font-semibold text-charbon-800">Ajouter un repas</p>
            {ACTIONS.map((action) => (
              <Link
                key={action.href}
                href={action.href}
                className="flex items-center gap-3 rounded-2xl bg-creme-100 p-4 font-medium text-charbon-800 hover:bg-creme-200"
              >
                <span className="text-xl">{action.icone}</span>
                {action.label}
              </Link>
            ))}
          </div>
        </div>
      ) : null}
    </>
  );
}
