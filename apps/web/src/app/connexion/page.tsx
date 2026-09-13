"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useState } from "react";
import { ChampMotDePasse } from "@/components/auth/ChampMotDePasse";
import { createClient } from "@/lib/supabase/client";

export default function ConnexionPage() {
  return (
    <Suspense>
      <ConnexionForm />
    </Suspense>
  );
}

function ConnexionForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  // /auth/callback redirige ici avec ?erreur=auth quand un lien (confirmation
  // d'e-mail ou réinitialisation de mot de passe) est invalide ou expiré —
  // sans ça, l'utilisateur atterrissait sur /connexion sans aucune
  // explication (échec silencieux).
  const [erreur, setErreur] = useState<string | null>(
    searchParams.get("erreur") === "auth" ? "Ce lien n'est plus valide ou a expiré. Réessaie." : null,
  );
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
    // (app)/layout.tsx redirige lui-même vers /onboarding si le questionnaire n'est pas terminé.
    router.push("/accueil");
    router.refresh();
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-creme-100 px-4 py-10">
      <div className="w-full max-w-sm space-y-8">
        <div className="text-center">
          <Link href="/" className="font-titre text-3xl font-bold text-charbon-800">
            Assiettly
          </Link>
          <p className="mt-2 text-charbon-400">Content de te revoir 👋</p>
        </div>

        <form onSubmit={seConnecter} className="space-y-4">
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
            placeholder="Mot de passe"
            autoComplete="current-password"
          />

          <div className="text-right">
            <Link href="/mot-de-passe-oublie" className="text-sm font-medium text-corail-600">
              Mot de passe oublié ?
            </Link>
          </div>

          {erreur ? <p className="text-center text-corail-600">{erreur}</p> : null}

          <button
            type="submit"
            disabled={loading || !email || !password}
            className="w-full rounded-xl bg-corail-500 py-3.5 font-titre font-semibold text-white disabled:opacity-50"
          >
            {loading ? "Connexion..." : "Se connecter"}
          </button>
        </form>

        <p className="text-center text-sm text-charbon-400">
          Pas encore de compte ?{" "}
          <Link href="/inscription" className="font-medium text-corail-600">
            Créer un compte
          </Link>
        </p>
      </div>
    </div>
  );
}
