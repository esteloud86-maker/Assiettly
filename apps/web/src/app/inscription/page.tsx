"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { ChampMotDePasse } from "@/components/auth/ChampMotDePasse";
import { createClient } from "@/lib/supabase/client";

export default function InscriptionPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [erreur, setErreur] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [inscrit, setInscrit] = useState(false);

  async function sInscrire(e: React.FormEvent) {
    e.preventDefault();
    setErreur(null);
    if (password.length < 6) {
      setErreur("Le mot de passe doit contenir au moins 6 caractères.");
      return;
    }
    setLoading(true);
    const supabase = createClient();
    const { data, error } = await supabase.auth.signUp({ email: email.trim(), password });
    setLoading(false);
    if (error) {
      setErreur(error.message);
      return;
    }
    if (data.session) {
      router.push("/onboarding");
      router.refresh();
      return;
    }
    setInscrit(true);
  }

  if (inscrit) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-creme-100 px-4 text-center">
        <div className="max-w-sm space-y-4">
          <h1 className="font-titre text-2xl font-bold text-charbon-800">Vérifie ta boîte mail 📩</h1>
          <p className="text-charbon-400">
            Un e-mail de confirmation vient de t&rsquo;être envoyé. Confirme ton adresse pour commencer.
          </p>
          <Link href="/connexion" className="font-medium text-corail-600">
            Retour à la connexion
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-creme-100 px-4 py-10">
      <div className="w-full max-w-sm space-y-8">
        <div className="text-center">
          <Link href="/" className="font-titre text-3xl font-bold text-charbon-800">
            Assiettly
          </Link>
          <p className="mt-2 text-charbon-400">Crée ton compte en moins de 2 minutes.</p>
        </div>

        <form onSubmit={sInscrire} className="space-y-4">
          <input
            className="w-full rounded-xl border border-creme-200 bg-creme-50 p-3.5"
            placeholder="Adresse e-mail"
            type="email"
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <ChampMotDePasse
            value={password}
            onChange={setPassword}
            placeholder="Mot de passe (6 caractères min.)"
            autoComplete="new-password"
          />

          {erreur ? <p className="text-center text-corail-600">{erreur}</p> : null}

          <button
            type="submit"
            disabled={loading || !email || !password}
            className="w-full rounded-xl bg-corail-500 py-3.5 font-titre font-semibold text-white disabled:opacity-50"
          >
            {loading ? "Création..." : "Créer mon compte"}
          </button>
          <p className="text-center text-xs text-charbon-400">Sans carte bancaire · Prêt en 2 minutes</p>
        </form>

        <p className="text-center text-sm text-charbon-400">
          Déjà un compte ?{" "}
          <Link href="/connexion" className="font-medium text-corail-600">
            Se connecter
          </Link>
        </p>
      </div>
    </div>
  );
}
