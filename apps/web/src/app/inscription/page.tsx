"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { Suspense, useState } from "react";
import { BoutonGoogle } from "@/components/auth/BoutonGoogle";
import { CaptureParrainageCookie } from "@/components/auth/CaptureParrainageCookie";
import { ChampMotDePasse } from "@/components/auth/ChampMotDePasse";
import { EcranVerificationEmail } from "@/components/auth/EcranVerificationEmail";
import { createClient } from "@/lib/supabase/client";
import { messageErreurAuth } from "@/lib/messagesErreurAuth";

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
    const { data, error } = await supabase.auth.signUp({
      email: email.trim(),
      password,
      // Sans ça, le lien de confirmation ramène sur "/" avec un `code`
      // jamais échangé contre une session : l'utilisateur ne se retrouve
      // jamais connecté. /auth/callback échange le code puis redirige vers
      // /accueil, qui renvoie lui-même vers /onboarding si besoin.
      options: { emailRedirectTo: `${window.location.origin}/auth/callback` },
    });
    setLoading(false);
    if (error) {
      setErreur(messageErreurAuth(error));
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
    return <EcranVerificationEmail email={email.trim()} />;
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-creme-100 px-4 py-10">
      <Suspense fallback={null}>
        <CaptureParrainageCookie />
      </Suspense>
      <div className="w-full max-w-sm space-y-8">
        <div className="text-center">
          <Link href="/" className="font-titre text-3xl font-bold text-charbon-800">
            Assiettly
          </Link>
          <p className="mt-2 text-charbon-400">Crée ton compte en moins de 2 minutes.</p>
        </div>

        <div className="space-y-4">
          <BoutonGoogle />
          <div className="flex items-center gap-3 text-xs text-charbon-400">
            <span className="h-px flex-1 bg-creme-200" aria-hidden="true" />
            ou avec ton e-mail
            <span className="h-px flex-1 bg-creme-200" aria-hidden="true" />
          </div>
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
