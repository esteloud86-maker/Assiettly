"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { createClient } from "@/lib/supabase/client";

export default function ConnexionPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [erreur, setErreur] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function seConnecter(e: React.FormEvent) {
    e.preventDefault();
    setErreur(null);
    setLoading(true);
    const supabase = createClient();
    const { error } = await supabase.auth.signInWithPassword({ email: email.trim(), password });
    setLoading(false);
    if (error) {
      setErreur(error.message);
      return;
    }
    router.push("/accueil");
    router.refresh();
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-creme-100 px-4">
      <form onSubmit={seConnecter} className="w-full max-w-sm space-y-4">
        <div className="mb-6 text-center">
          <h1 className="font-titre text-3xl font-bold text-charbon-800">Assiettly</h1>
          <p className="mt-1 text-charbon-400">Suis ton alimentation, sans jamais culpabiliser.</p>
        </div>

        <input
          className="w-full rounded-xl border border-creme-200 bg-creme-50 p-3.5"
          placeholder="Adresse e-mail"
          type="email"
          autoComplete="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <input
          className="w-full rounded-xl border border-creme-200 bg-creme-50 p-3.5"
          placeholder="Mot de passe"
          type="password"
          autoComplete="current-password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />

        {erreur ? <p className="text-center text-corail-600">{erreur}</p> : null}

        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-xl bg-corail-500 py-3.5 font-titre font-semibold text-white disabled:opacity-50"
        >
          {loading ? "Connexion..." : "Se connecter"}
        </button>

        <p className="text-center text-sm text-charbon-400">
          Pas encore de compte ?{" "}
          <Link href="/inscription" className="font-medium text-corail-600">
            Créer un compte
          </Link>
        </p>
      </form>
    </div>
  );
}
