"use client";

import { useEffect, useState } from "react";
import { detecterPlateforme, estDejaInstallee, type Plateforme } from "@/lib/detectionPlateforme";
import { abonnerPromptInstallation, declencherInstallation, promptInstallationDisponible } from "@/lib/pwaInstallPrompt";

type EtatInstallation = "inactif" | "en_cours";

/**
 * Bloc d'installation réutilisé par l'écran d'onboarding et par le profil
 * (pour re-proposer l'installation plus tard). Détecte la plateforme et
 * adapte entièrement le contenu : bouton natif sur Android, tutoriel en 3
 * étapes sur iOS (aucun moyen de déclencher l'installation automatiquement
 * là-bas — contrainte du navigateur, pas un choix), message + QR code sur
 * desktop.
 */
export function CarteInstallationPwa() {
  const [plateforme, setPlateforme] = useState<Plateforme | null>(null);
  const [dejaInstallee, setDejaInstallee] = useState(false);
  const [promptDispo, setPromptDispo] = useState(false);
  const [etat, setEtat] = useState<EtatInstallation>("inactif");
  const [qrDataUrl, setQrDataUrl] = useState<string | null>(null);

  useEffect(() => {
    setPlateforme(detecterPlateforme());
    setDejaInstallee(estDejaInstallee());
    setPromptDispo(promptInstallationDisponible());

    const desabonner = abonnerPromptInstallation(() => setPromptDispo(promptInstallationDisponible()));
    const surAppInstalled = () => setDejaInstallee(true);
    window.addEventListener("appinstalled", surAppInstalled);
    return () => {
      desabonner();
      window.removeEventListener("appinstalled", surAppInstalled);
    };
  }, []);

  useEffect(() => {
    if (plateforme !== "desktop" || qrDataUrl) return;
    import("qrcode")
      .then((QRCode) =>
        QRCode.toDataURL(window.location.origin, {
          margin: 1,
          width: 168,
          color: { dark: "#2B2320", light: "#FBF4EC" },
        }),
      )
      .then(setQrDataUrl)
      .catch(() => {});
  }, [plateforme, qrDataUrl]);

  async function installer() {
    setEtat("en_cours");
    const resultat = await declencherInstallation();
    if (resultat === "accepted") {
      setDejaInstallee(true);
    } else {
      setEtat("inactif");
    }
  }

  if (plateforme === null) return null;

  if (dejaInstallee) {
    return (
      <div className="rounded-2xl bg-sarcelle-50 p-4 text-center text-sm font-medium text-sarcelle-600">
        ✓ Assiettly est installée sur cet appareil
      </div>
    );
  }

  if (plateforme === "android") {
    return (
      <div className="space-y-3">
        {promptDispo ? (
          <button
            onClick={installer}
            disabled={etat === "en_cours"}
            className="w-full rounded-2xl bg-corail-500 py-3.5 font-titre font-semibold text-white disabled:opacity-50"
          >
            {etat === "en_cours" ? "..." : "Ajouter à l'écran d'accueil"}
          </button>
        ) : (
          <div className="rounded-2xl bg-creme-100 p-4 text-sm text-charbon-600">
            Ouvre le menu <strong>⋮</strong> de ton navigateur, puis appuie sur{" "}
            <strong>« Ajouter à l&rsquo;écran d&rsquo;accueil »</strong>.
          </div>
        )}
      </div>
    );
  }

  if (plateforme === "ios") {
    return (
      <div className="space-y-3">
        <EtapeTutoriel numero={1} texte="Appuie sur l'icône de partage, en bas de Safari.">
          <IconePartageIOS />
        </EtapeTutoriel>
        <EtapeTutoriel numero={2} texte="Fais défiler et appuie sur « Sur l'écran d'accueil ».">
          <IconeAjoutEcran />
        </EtapeTutoriel>
        <EtapeTutoriel numero={3} texte="Appuie sur « Ajouter » en haut à droite.">
          <IconeConfirmer />
        </EtapeTutoriel>
      </div>
    );
  }

  return (
    <div className="space-y-3 rounded-2xl bg-creme-100 p-5 text-center">
      <p className="text-sm text-charbon-600">
        Assiettly est pensée pour le mobile. Ouvre ce lien depuis ton téléphone pour l&rsquo;installer, ou scanne ce
        code :
      </p>
      {qrDataUrl ? (
        // eslint-disable-next-line @next/next/no-img-element -- data URL générée localement, pas d'optimisation Next utile ici
        <img src={qrDataUrl} alt="QR code vers Assiettly" width={168} height={168} className="mx-auto rounded-xl" />
      ) : (
        <div className="mx-auto h-[168px] w-[168px] animate-pulse rounded-xl bg-creme-200" />
      )}
    </div>
  );
}

function EtapeTutoriel({ numero, texte, children }: { numero: number; texte: string; children: React.ReactNode }) {
  return (
    <div className="flex items-center gap-3 rounded-2xl bg-creme-100 p-3">
      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-corail-500 font-titre text-sm font-bold text-white">
        {numero}
      </div>
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-creme-50">{children}</div>
      <p className="text-sm text-charbon-600">{texte}</p>
    </div>
  );
}

// Schémas stylisés dans l'identité Assiettly — volontairement pas des
// captures de l'interface Apple (droits d'image), juste des pictogrammes
// génériques qui illustrent le geste.
function IconePartageIOS() {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="#F2603C" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 3v12" />
      <path d="M7.5 7.5 12 3l4.5 4.5" />
      <rect x="5" y="10" width="14" height="10" rx="2" />
    </svg>
  );
}

function IconeAjoutEcran() {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="#F2603C" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="4" y="4" width="16" height="16" rx="4" />
      <path d="M12 9v6M9 12h6" />
    </svg>
  );
}

function IconeConfirmer() {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="#1F7A6C" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M5 13l4 4L19 7" />
    </svg>
  );
}
