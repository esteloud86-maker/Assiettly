"use client";

import Link from "next/link";
import { useState } from "react";
import { createClient } from "@/lib/supabase/client";

export default function MotDePasseOubliePage() {
  const [email, setEmail] = useState("");
  const [envoye, setEnvoye] = useState(false);
  const [erreur, setErreur] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function envoyer(e: React.FormEvent) {
    e.preventDefault();
    setErreur(null);
    setLoading(true);
    const supabase = createClient();
    const { error } = await supabase.auth.resetPasswordForEmail(email.trim(), {
      redirectTo: `${window.location.origin}/auth/callback?next=/reinitialiser-mot-de-passe`,
    });
    setLoading(false);
    if (error) {
      setErreur(error.message);
      return;
    }
    setEnvoye(true);
  }

  if (envoye) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-creme-100 px-4 text-center">
        <div className="max-w-sm space-y-4">
          <h1 className="font-titre text-2xl font-bold text-charbon-800">Vérifie ta boîte mail 📩</h1>
          <p className="text-charbon-400">
            Si un compte existe pour {email}, un lien de réinitialisation vient de t&rsquo;être envoyé.
          </p>
          <Link href="/connexion" className="font-medium text-corail-600">
            Retour à la connexion
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-creme-100 px-4">
      <form onSubmit={envoyer} className="w-full max-w-sm space-y-4">
        <div className="mb-6 text-center">
          <h1 className="font-titre text-3xl font-bold text-charbon-800">Mot de passe oublié</h1>
          <p className="mt-1 text-charbon-400">On t&rsquo;envoie un lien pour en choisir un nouveau.</p>
        </div>

        <input
          className="w-full rounded-xl border border-creme-200 bg-creme-50 p-3.5"
          placeholder="Adresse e-mail"
          type="email"
          autoComplete="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />

        {erreur ? <p className="text-center text-corail-600">{erreur}</p> : null}

        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-xl bg-corail-500 py-3.5 font-titre font-semibold text-white disabled:opacity-50"
        >
          {loading ? "Envoi..." : "Envoyer le lien"}
        </button>

        <p className="text-center text-sm text-charbon-400">
          <Link href="/connexion" className="font-medium text-corail-600">
            Retour à la connexion
          </Link>
        </p>
      </form>
    </div>
  );
}
