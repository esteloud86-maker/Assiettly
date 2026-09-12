"use client";

import {
  calculerObjectifs,
  calculerProjection,
  type NiveauActivite,
  type ObjectifType,
  type Sexe,
} from "@assiettly/shared";
import { useMemo, useState, useTransition } from "react";
import { demanderPermissionEtSabonner } from "@/lib/pushClient";
import { terminerOnboarding } from "@/server/actions/onboarding";
import { enregistrerAbonnementPush } from "@/server/actions/push";

interface Reponses {
  objectifType: ObjectifType | null;
  sexe: Sexe | null;
  dateNaissance: string;
  tailleCm: string;
  poidsKg: string;
  poidsCibleKg: string;
  niveauActivite: NiveauActivite | null;
  frequenceSportParSemaine: string;
}

const OBJECTIFS: { value: ObjectifType; label: string; description: string }[] = [
  { value: "PERTE", label: "Perdre du poids", description: "Un déficit calorique modéré et durable" },
  { value: "MAINTIEN", label: "Maintenir mon poids", description: "Garder l'équilibre actuel" },
  { value: "PRISE_MASSE", label: "Prendre du muscle", description: "Un léger surplus calorique" },
];

const NIVEAUX: { value: NiveauActivite; label: string; description: string }[] = [
  { value: "SEDENTAIRE", label: "Sédentaire", description: "Peu ou pas d'exercice" },
  { value: "LEGER", label: "Légèrement actif", description: "Exercice léger 1 à 3 jours/semaine" },
  { value: "MODERE", label: "Modérément actif", description: "Exercice modéré 3 à 5 jours/semaine" },
  { value: "ACTIF", label: "Actif", description: "Exercice intense 6 à 7 jours/semaine" },
  { value: "TRES_ACTIF", label: "Très actif", description: "Exercice quotidien intense ou travail physique" },
];

function ChoixCartes<T extends string>({
  options,
  value,
  onChange,
}: {
  options: { value: T; label: string; description: string }[];
  value: T | null;
  onChange: (v: T) => void;
}) {
  return (
    <div className="space-y-3">
      {options.map((o) => (
        <button
          key={o.value}
          onClick={() => onChange(o.value)}
          className={`w-full rounded-2xl border p-4 text-left transition-colors ${
            value === o.value
              ? "border-corail-500 bg-corail-50"
              : "border-creme-200 bg-creme-50 hover:border-corail-400"
          }`}
        >
          <p className="font-titre font-semibold text-charbon-800">{o.label}</p>
          <p className="text-sm text-charbon-400">{o.description}</p>
        </button>
      ))}
    </div>
  );
}

function ChampNombre({
  value,
  onChange,
  placeholder,
  suffixe,
}: {
  value: string;
  onChange: (v: string) => void;
  placeholder: string;
  suffixe: string;
}) {
  return (
    <div className="flex items-center gap-2 rounded-2xl border border-creme-200 bg-creme-50 p-4">
      <input
        type="number"
        inputMode="decimal"
        className="w-full bg-transparent text-2xl font-semibold text-charbon-800 outline-none"
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        autoFocus
      />
      <span className="text-charbon-400">{suffixe}</span>
    </div>
  );
}

const TOTAL_ETAPES = 11;

type StatutNotifications = "inconnu" | "en_cours" | "active" | "refuse";

export function OnboardingWizard() {
  const [etape, setEtape] = useState(0);
  const [isPending, startTransition] = useTransition();
  const [erreur, setErreur] = useState<string | null>(null);
  const [statutNotif, setStatutNotif] = useState<StatutNotifications>("inconnu");
  const [reponses, setReponses] = useState<Reponses>({
    objectifType: null,
    sexe: null,
    dateNaissance: "",
    tailleCm: "",
    poidsKg: "",
    poidsCibleKg: "",
    niveauActivite: null,
    frequenceSportParSemaine: "",
  });

  function majReponse<K extends keyof Reponses>(cle: K, valeur: Reponses[K]) {
    setReponses((r) => ({ ...r, [cle]: valeur }));
  }

  async function activerNotifications() {
    setStatutNotif("en_cours");
    try {
      const abonnement = await demanderPermissionEtSabonner();
      if (!abonnement) {
        setStatutNotif("refuse");
        return;
      }
      await enregistrerAbonnementPush(abonnement);
      setStatutNotif("active");
    } catch {
      setStatutNotif("refuse");
    }
  }

  const profilComplet =
    reponses.objectifType &&
    reponses.sexe &&
    reponses.dateNaissance &&
    reponses.tailleCm &&
    reponses.poidsKg &&
    reponses.niveauActivite;

  const objectifsCalcules = useMemo(() => {
    if (!profilComplet) return null;
    return calculerObjectifs({
      sexe: reponses.sexe!,
      dateNaissance: reponses.dateNaissance,
      tailleCm: Number(reponses.tailleCm),
      poidsKg: Number(reponses.poidsKg),
      niveauActivite: reponses.niveauActivite!,
      objectifType: reponses.objectifType!,
    });
  }, [profilComplet, reponses]);

  const projection = useMemo(() => {
    if (!profilComplet || !reponses.poidsCibleKg) return null;
    return calculerProjection(
      {
        sexe: reponses.sexe!,
        dateNaissance: reponses.dateNaissance,
        tailleCm: Number(reponses.tailleCm),
        poidsKg: Number(reponses.poidsKg),
        niveauActivite: reponses.niveauActivite!,
        objectifType: reponses.objectifType!,
      },
      Number(reponses.poidsCibleKg),
    );
  }, [profilComplet, reponses]);

  const etapes: { titre: string; peutContinuer: boolean; contenu: React.ReactNode }[] = [
    {
      titre: "Quel est ton objectif ?",
      peutContinuer: !!reponses.objectifType,
      contenu: (
        <ChoixCartes options={OBJECTIFS} value={reponses.objectifType} onChange={(v) => majReponse("objectifType", v)} />
      ),
    },
    {
      titre: "Tu es...",
      peutContinuer: !!reponses.sexe,
      contenu: (
        <ChoixCartes
          options={[
            { value: "FEMME" as Sexe, label: "Une femme", description: "" },
            { value: "HOMME" as Sexe, label: "Un homme", description: "" },
          ]}
          value={reponses.sexe}
          onChange={(v) => majReponse("sexe", v)}
        />
      ),
    },
    {
      titre: "Quelle est ta date de naissance ?",
      peutContinuer: !!reponses.dateNaissance,
      contenu: (
        <input
          type="date"
          className="w-full rounded-2xl border border-creme-200 bg-creme-50 p-4 text-lg"
          value={reponses.dateNaissance}
          onChange={(e) => majReponse("dateNaissance", e.target.value)}
        />
      ),
    },
    {
      titre: "Quelle est ta taille ?",
      peutContinuer: !!reponses.tailleCm,
      contenu: <ChampNombre value={reponses.tailleCm} onChange={(v) => majReponse("tailleCm", v)} placeholder="170" suffixe="cm" />,
    },
    {
      titre: "Quel est ton poids actuel ?",
      peutContinuer: !!reponses.poidsKg,
      contenu: <ChampNombre value={reponses.poidsKg} onChange={(v) => majReponse("poidsKg", v)} placeholder="70" suffixe="kg" />,
    },
    {
      titre: "Quel est ton poids cible ?",
      peutContinuer: !!reponses.poidsCibleKg,
      contenu: (
        <ChampNombre value={reponses.poidsCibleKg} onChange={(v) => majReponse("poidsCibleKg", v)} placeholder="65" suffixe="kg" />
      ),
    },
    {
      titre: "Quel est ton niveau d'activité au quotidien ?",
      peutContinuer: !!reponses.niveauActivite,
      contenu: (
        <ChoixCartes options={NIVEAUX} value={reponses.niveauActivite} onChange={(v) => majReponse("niveauActivite", v)} />
      ),
    },
    {
      titre: "Combien de fois fais-tu du sport par semaine ?",
      peutContinuer: reponses.frequenceSportParSemaine !== "",
      contenu: (
        <ChampNombre
          value={reponses.frequenceSportParSemaine}
          onChange={(v) => majReponse("frequenceSportParSemaine", v)}
          placeholder="3"
          suffixe="fois/semaine"
        />
      ),
    },
    {
      titre: "Tes objectifs quotidiens",
      peutContinuer: true,
      contenu: objectifsCalcules ? (
        <div className="space-y-4">
          <div className="rounded-2xl bg-corail-50 p-6 text-center">
            <p className="font-titre text-4xl font-bold text-corail-600">{objectifsCalcules.caloriesKcal}</p>
            <p className="text-charbon-400">kcal / jour</p>
          </div>
          <div className="grid grid-cols-3 gap-3 text-center">
            <div className="rounded-xl bg-creme-50 p-3">
              <p className="font-titre font-bold text-charbon-800">{objectifsCalcules.proteinesG}g</p>
              <p className="text-xs text-charbon-400">Protéines</p>
            </div>
            <div className="rounded-xl bg-creme-50 p-3">
              <p className="font-titre font-bold text-charbon-800">{objectifsCalcules.glucidesG}g</p>
              <p className="text-xs text-charbon-400">Glucides</p>
            </div>
            <div className="rounded-xl bg-creme-50 p-3">
              <p className="font-titre font-bold text-charbon-800">{objectifsCalcules.lipidesG}g</p>
              <p className="text-xs text-charbon-400">Lipides</p>
            </div>
          </div>
          <p className="text-sm text-charbon-400">
            On calcule ton métabolisme de base avec la formule de Mifflin-St Jeor (à partir de ton poids, ta
            taille, ton âge et ton sexe), qu&rsquo;on ajuste selon ton niveau d&rsquo;activité et ton objectif.
          </p>
        </div>
      ) : null,
    },
    {
      titre: "Ta projection",
      peutContinuer: true,
      contenu: (
        <div className="space-y-4">
          {projection?.dateEstimee ? (
            <div className="rounded-2xl bg-sarcelle-50 p-6 text-center">
              <p className="text-charbon-600">À ce rythme, objectif atteint vers le</p>
              <p className="mt-1 font-titre text-2xl font-bold text-sarcelle-600">
                {new Date(projection.dateEstimee).toLocaleDateString("fr-FR", {
                  day: "numeric",
                  month: "long",
                  year: "numeric",
                })}
              </p>
            </div>
          ) : (
            <div className="rounded-2xl bg-sarcelle-50 p-6 text-center text-charbon-600">
              Tu es déjà proche de ton objectif de poids — on va surtout t&rsquo;aider à le maintenir.
            </div>
          )}
          <p className="text-sm text-charbon-400">
            Essai gratuit de 7 jours pour découvrir Assiettly en entier, sans engagement.
          </p>
        </div>
      ),
    },
    {
      titre: "Active les rappels",
      peutContinuer: true,
      contenu: (
        <div className="space-y-4">
          <div className="rounded-2xl bg-creme-50 p-6 text-center">
            <p className="text-4xl">🔔</p>
            <p className="mt-2 font-titre font-semibold text-charbon-800">Ne perds jamais ta flamme</p>
            <p className="mt-1 text-sm text-charbon-400">
              Active les notifications pour recevoir un rappel si ta flamme risque de s&rsquo;éteindre en fin
              de journée.
            </p>
          </div>
          {statutNotif === "active" ? (
            <p className="text-center font-medium text-sarcelle-600">Notifications activées ✓</p>
          ) : statutNotif === "refuse" ? (
            <p className="text-center text-sm text-charbon-400">
              Pas de souci, tu pourras les activer plus tard depuis ton profil.
            </p>
          ) : (
            <button
              onClick={activerNotifications}
              disabled={statutNotif === "en_cours"}
              className="w-full rounded-2xl bg-corail-500 py-3.5 font-titre font-semibold text-white disabled:opacity-50"
            >
              {statutNotif === "en_cours" ? "..." : "Activer les notifications"}
            </button>
          )}
        </div>
      ),
    },
  ];

  const etapeActuelle = etapes[etape];
  const derniereEtape = etape === TOTAL_ETAPES - 1;

  function suivant() {
    if (derniereEtape) {
      startTransition(async () => {
        try {
          await terminerOnboarding({
            objectifType: reponses.objectifType!,
            sexe: reponses.sexe!,
            dateNaissance: reponses.dateNaissance,
            tailleCm: Number(reponses.tailleCm),
            poidsKg: Number(reponses.poidsKg),
            poidsCibleKg: Number(reponses.poidsCibleKg),
            niveauActivite: reponses.niveauActivite!,
            frequenceSportParSemaine: Number(reponses.frequenceSportParSemaine),
          });
        } catch (e) {
          setErreur(e instanceof Error ? e.message : "Erreur lors de l'enregistrement");
        }
      });
      return;
    }
    setEtape((e) => e + 1);
  }

  return (
    <div className="mx-auto flex min-h-screen max-w-md flex-col px-4 py-8">
      <div className="mb-8 h-1.5 w-full overflow-hidden rounded-full bg-creme-200">
        <div
          className="h-full rounded-full bg-corail-500 transition-all duration-300"
          style={{ width: `${((etape + 1) / TOTAL_ETAPES) * 100}%` }}
        />
      </div>

      <h1 className="mb-6 font-titre text-2xl font-semibold text-charbon-800">{etapeActuelle.titre}</h1>

      <div className="flex-1">{etapeActuelle.contenu}</div>

      {erreur ? <p className="mt-4 text-corail-600">{erreur}</p> : null}

      <div className="mt-8 flex gap-3">
        {etape > 0 ? (
          <button
            onClick={() => setEtape((e) => e - 1)}
            className="rounded-2xl border border-creme-200 px-6 py-3.5 font-medium text-charbon-600"
          >
            Précédent
          </button>
        ) : null}
        <button
          onClick={suivant}
          disabled={!etapeActuelle.peutContinuer || isPending}
          className="flex-1 rounded-2xl bg-corail-500 py-3.5 font-titre font-semibold text-white disabled:opacity-50"
        >
          {isPending ? "..." : derniereEtape ? "Commencer mon essai gratuit" : "Suivant"}
        </button>
      </div>
    </div>
  );
}
