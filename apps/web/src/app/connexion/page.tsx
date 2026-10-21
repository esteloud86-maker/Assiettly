"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useState } from "react";
import { BoutonGoogle } from "@/components/auth/BoutonGoogle";
import { ChampMotDePasse } from "@/components/auth/ChampMotDePasse";
import { createClient } from "@/lib/supabase/client";
import { messageErreurAuth } from "@/lib/messagesErreurAuth";

const MESSAGES_ERREUR: Record<string, string> = {
  auth: "Ce lien n'est plus valide ou a expiré. Réessaie.",
  oauth_annule: "Connexion annulée.",
  oauth_echec: "La connexion avec Google a échoué. Réessaie, ou utilise ton e-mail ci-dessous.",
  // Posé par le middleware quand un cookie de session existait mais n'a
  // pas pu être rafraîchi (ex: refresh token invalidé par Supabase après
  // une rotation) — sans ce message, l'utilisateur atterrissait sur
  // /connexion sans comprendre pourquoi il avait été déconnecté.
  session_expiree: "Ta session a expiré. Reconnecte-toi pour continuer.",
};

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
  // /auth/callback redirige ici avec ?erreur=... quand un lien (confirmation
  // d'e-mail, réinitialisation de mot de passe, ou connexion Google) est
  // invalide, expiré ou annulé — sans ça, l'utilisateur atterrissait sur
  // /connexion sans aucune explication (échec silencieux).
  const [erreur, setErreur] = useState<string | null>(
    MESSAGES_ERREUR[searchParams.get("erreur") ?? ""] ?? null,
  );
  const [loading, setLoading] = useState(false);
  // Affiché uniquement sur l'erreur "email_not_confirmed" — permet de
  // renvoyer l'e-mail de confirmation sans quitter l'écran de connexion.
  const [emailNonConfirme, setEmailNonConfirme] = useState(false);
  const [renvoiEnCours, setRenvoiEnCours] = useState(false);
  const [renvoye, setRenvoye] = useState(false);

  async function seConnecter(e: React.FormEvent) {
    e.preventDefault();
    setErreur(null);
    setEmailNonConfirme(false);
    setRenvoye(false);
    setLoading(true);
    const supabase = createClient();
    const { error } = await supabase.auth.signInWithPassword({ email: email.trim(), password });
    setLoading(false);
    if (error) {
      setErreur(messageErreurAuth(error));
      setEmailNonConfirme(error.code === "email_not_confirmed");
      return;
    }
    // (app)/layout.tsx redirige lui-même vers /onboarding si le questionnaire n'est pas terminé.
    router.push("/accueil");
    router.refresh();
  }

  async function renvoyerEmail() {
    setRenvoiEnCours(true);
    const supabase = createClient();
    const { error } = await supabase.auth.resend({
      type: "signup",
      email: email.trim(),
      options: { emailRedirectTo: `${window.location.origin}/auth/callback` },
    });
    setRenvoiEnCours(false);
    if (!error) setRenvoye(true);
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

        <div className="space-y-4">
          <BoutonGoogle />
          <div className="flex items-center gap-3 text-xs text-charbon-400">
            <span className="h-px flex-1 bg-creme-200" aria-hidden="true" />
            ou avec ton e-mail
            <span className="h-px flex-1 bg-creme-200" aria-hidden="true" />
          </div>
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
          {emailNonConfirme ? (
            <button
              type="button"
              onClick={renvoyerEmail}
              disabled={renvoiEnCours || renvoye}
              className="w-full rounded-xl border border-creme-200 bg-creme-50 py-2.5 text-sm font-semibold text-charbon-800 disabled:opacity-50"
            >
              {renvoye ? "E-mail renvoyé ✓" : renvoiEnCours ? "Envoi..." : "Renvoyer l'e-mail de confirmation"}
            </button>
          ) : null}

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
