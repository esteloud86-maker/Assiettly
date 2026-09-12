"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { createClient } from "@/lib/supabase/client";

export default function ReinitialiserMotDePassePage() {
  const router = useRouter();
  const [motDePasse, setMotDePasse] = useState("");
  const [erreur, setErreur] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [succes, setSucces] = useState(false);

  async function enregistrer(e: React.FormEvent) {
    e.preventDefault();
    setErreur(null);
    if (motDePasse.length < 6) {
      setErreur("Le mot de passe doit contenir au moins 6 caractères.");
      return;
    }
    setLoading(true);
    const supabase = createClient();
    const { error } = await supabase.auth.updateUser({ password: motDePasse });
    setLoading(false);
    if (error) {
      setErreur(error.message);
      return;
    }
    setSucces(true);
    setTimeout(() => {
      router.push("/accueil");
      router.refresh();
    }, 1500);
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-creme-100 px-4">
      <form onSubmit={enregistrer} className="w-full max-w-sm space-y-4">
        <div className="mb-6 text-center">
          <h1 className="font-titre text-3xl font-bold text-charbon-800">Nouveau mot de passe</h1>
          <p className="mt-1 text-charbon-400">Choisis un nouveau mot de passe pour ton compte.</p>
        </div>

        <input
          className="w-full rounded-xl border border-creme-200 bg-creme-50 p-3.5"
          placeholder="Nouveau mot de passe"
          type="password"
          autoComplete="new-password"
          value={motDePasse}
          onChange={(e) => setMotDePasse(e.target.value)}
        />

        {erreur ? <p className="text-center text-corail-600">{erreur}</p> : null}
        {succes ? <p className="text-center text-sarcelle-500">Mot de passe mis à jour ✓</p> : null}

        <button
          type="submit"
          disabled={loading || succes}
          className="w-full rounded-xl bg-corail-500 py-3.5 font-titre font-semibold text-white disabled:opacity-50"
        >
          {loading ? "Enregistrement..." : "Enregistrer"}
        </button>
      </form>
    </div>
  );
}
