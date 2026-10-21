"use client";

import Link from "next/link";
import { useState } from "react";

export function MenuMobile({ avisVisibles }: { avisVisibles: boolean }) {
  const [ouvert, setOuvert] = useState(false);

  return (
    <div className="sm:hidden">
      <button
        onClick={() => setOuvert((o) => !o)}
        aria-label="Menu"
        aria-expanded={ouvert}
        className="flex h-11 w-11 items-center justify-center text-2xl text-charbon-800"
      >
        {ouvert ? "✕" : "☰"}
      </button>
      {ouvert ? (
        <div className="absolute inset-x-0 top-full z-40 space-y-3 border-t border-creme-200 bg-creme-50 p-4 shadow-sm">
          <a href="#plats-testes" onClick={() => setOuvert(false)} className="block font-medium text-charbon-800">
            Les plats testés
          </a>
          {avisVisibles ? (
            <a href="#avis" onClick={() => setOuvert(false)} className="block font-medium text-charbon-800">
              Avis
            </a>
          ) : null}
          <a href="#tarifs" onClick={() => setOuvert(false)} className="block font-medium text-charbon-800">
            Tarifs
          </a>
          <a href="#faq" onClick={() => setOuvert(false)} className="block font-medium text-charbon-800">
            FAQ
          </a>
          <Link href="/connexion" onClick={() => setOuvert(false)} className="block font-medium text-charbon-800">
            Se connecter
          </Link>
          <Link
            href="/inscription"
            onClick={() => setOuvert(false)}
            className="block rounded-xl bg-corail-500 py-2.5 text-center font-titre font-semibold text-white"
          >
            Commencer gratuitement
          </Link>
        </div>
      ) : null}
    </div>
  );
}
