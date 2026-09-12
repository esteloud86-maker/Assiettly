"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { enregistrerPoids } from "@/server/actions/weight";

export function PoidsForm() {
  const router = useRouter();
  const [valeur, setValeur] = useState("");
  const [isPending, startTransition] = useTransition();

  function enregistrer() {
    const poidsKg = Number(valeur.replace(",", "."));
    if (!poidsKg || poidsKg <= 0) return;
    startTransition(async () => {
      await enregistrerPoids({ poidsKg, date: new Date().toISOString().slice(0, 10) });
      setValeur("");
      router.refresh();
    });
  }

  return (
    <div className="flex gap-2">
      <input
        className="flex-1 rounded-xl border border-creme-200 bg-creme-50 p-3"
        placeholder="Nouveau poids (kg)"
        value={valeur}
        onChange={(e) => setValeur(e.target.value)}
      />
      <button
        onClick={enregistrer}
        disabled={isPending}
        className="rounded-xl bg-corail-500 px-5 font-semibold text-white disabled:opacity-50"
      >
        Enregistrer
      </button>
    </div>
  );
}
