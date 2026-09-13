"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { IllustrationEnveloppe } from "@/components/auth/IllustrationEnveloppe";
import { createClient } from "@/lib/supabase/client";

const DUREE_COOLDOWN_S = 45;
// Poll de secours en plus de onAuthStateChange (qui réagit déjà aux
// changements de session faits par un autre onglet du même navigateur via
// l'événement `storage`) — filet de sécurité si cet événement ne se
// déclenche pas de façon fiable sur certains navigateurs mobiles.
const INTERVALLE_POLL_MS = 4000;

/**
 * Écran affiché après l'inscription, en attendant que l'utilisateur
 * confirme son adresse. Détecte automatiquement la confirmation si elle a
 * lieu dans le même navigateur (session partagée via le stockage local) et
 * redirige sans action manuelle — cf. PROGRESS.md pour la limite connue
 * (confirmation depuis un autre appareil : pas de détection possible sans
 * backend poussant l'état, non implémenté au MVP).
 */
export function EcranVerificationEmail({ email }: { email: string }) {
  const router = useRouter();
  const [secondesRestantes, setSecondesRestantes] = useState(DUREE_COOLDOWN_S);
  const [renvoiEnCours, setRenvoiEnCours] = useState(false);
  const [renvoye, setRenvoye] = useState(false);
  const [erreur, setErreur] = useState<string | null>(null);
  const redirectionEnClenchee = useRef(false);

  function surSessionDetectee() {
    if (redirectionEnClenchee.current) return;
    redirectionEnClenchee.current = true;
    // (app)/layout.tsx redirige lui-même vers /onboarding si besoin.
    router.push("/accueil");
    router.refresh();
  }

  useEffect(() => {
    const supabase = createClient();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event) => {
      if (event === "SIGNED_IN") surSessionDetectee();
    });

    const intervalle = setInterval(async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (session) surSessionDetectee();
    }, INTERVALLE_POLL_MS);

    return () => {
      subscription.unsubscribe();
      clearInterval(intervalle);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (secondesRestantes <= 0) return;
    const timer = setTimeout(() => setSecondesRestantes((s) => s - 1), 1000);
    return () => clearTimeout(timer);
  }, [secondesRestantes]);

  async function renvoyerEmail() {
    setErreur(null);
    setRenvoiEnCours(true);
    const supabase = createClient();
    const { error } = await supabase.auth.resend({
      type: "signup",
      email,
      options: { emailRedirectTo: `${window.location.origin}/auth/callback` },
    });
    setRenvoiEnCours(false);
    if (error) {
      setErreur(error.message);
      return;
    }
    setRenvoye(true);
    setSecondesRestantes(DUREE_COOLDOWN_S);
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-creme-100 px-4 text-center">
      <div className="w-full max-w-sm space-y-5">
        <IllustrationEnveloppe />

        <div>
          <h1 className="font-titre text-2xl font-bold text-charbon-800">Vérifie ta boîte mail 📩</h1>
          <p className="mt-2 text-charbon-600">
            Envoyé à <span className="font-semibold text-charbon-800">{email}</span>
          </p>
          <p className="mt-1 text-charbon-400">Clique sur le lien reçu pour confirmer ton adresse et continuer.</p>
        </div>

        <p className="text-xs text-charbon-400">Pense à vérifier tes spams s&rsquo;il n&rsquo;arrive pas tout de suite.</p>

        <div className="space-y-3 pt-2">
          <button
            onClick={renvoyerEmail}
            disabled={renvoiEnCours || secondesRestantes > 0}
            className="w-full rounded-xl border border-creme-200 bg-creme-50 py-3 font-semibold text-charbon-800 disabled:opacity-50"
          >
            {renvoiEnCours
              ? "Envoi..."
              : secondesRestantes > 0
                ? `Renvoyer l'email (${secondesRestantes}s)`
                : "Renvoyer l'email"}
          </button>
          {renvoye ? <p className="text-sm text-sarcelle-500">Email renvoyé ✓</p> : null}
          {erreur ? <p className="text-sm text-corail-600">{erreur}</p> : null}
        </div>

        <Link href="/connexion" className="block font-medium text-corail-600">
          Retour à la connexion
        </Link>
      </div>
    </div>
  );
}
