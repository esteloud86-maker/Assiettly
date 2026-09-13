"use client";

import { useState } from "react";

interface ChampMotDePasseProps {
  value: string;
  onChange: (valeur: string) => void;
  placeholder: string;
  autoComplete: "current-password" | "new-password";
}

/** Champ mot de passe avec bouton œil pour afficher/masquer la saisie. */
export function ChampMotDePasse({ value, onChange, placeholder, autoComplete }: ChampMotDePasseProps) {
  const [visible, setVisible] = useState(false);

  return (
    <div className="relative">
      <input
        className="w-full rounded-xl border border-creme-200 bg-creme-50 p-3.5 pr-12"
        placeholder={placeholder}
        type={visible ? "text" : "password"}
        autoComplete={autoComplete}
        value={value}
        onChange={(e) => onChange(e.target.value)}
      />
      <button
        type="button"
        onClick={() => setVisible((v) => !v)}
        aria-label={visible ? "Masquer le mot de passe" : "Afficher le mot de passe"}
        aria-pressed={visible}
        className="absolute inset-y-0 right-0 flex w-11 items-center justify-center text-charbon-400"
      >
        {visible ? <IconeOeilBarre className="h-5 w-5" /> : <IconeOeil className="h-5 w-5" />}
      </button>
    </div>
  );
}

function IconeOeil({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M1.5 12S5 5 12 5s10.5 7 10.5 7-3.5 7-10.5 7S1.5 12 1.5 12Z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  );
}

function IconeOeilBarre({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M9.9 5.2A10.6 10.6 0 0 1 12 5c7 0 10.5 7 10.5 7a13.6 13.6 0 0 1-3.1 3.9M6.7 6.7C3.7 8.6 1.5 12 1.5 12S5 19 12 19a10.5 10.5 0 0 0 5.3-1.4" />
      <path d="M9.9 14.1A3 3 0 0 1 14.1 9.9" />
      <path d="M2 2l20 20" />
    </svg>
  );
}
