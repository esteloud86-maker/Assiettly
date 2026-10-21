import { SCANS_GRATUITS_PAR_JOUR, TARIFS } from "@/lib/pricing";

const QUESTIONS = [
  {
    question: "Quelle est la précision du scan de repas par photo ?",
    reponse:
      "Ça dépend du plat : élevée pour un plat simple et bien identifiable (quiche, poulet-riz), plus incertaine pour un plat très composite en sauce. On affiche toujours le niveau de confiance, et tu corriges en 2 taps si besoin.",
  },
  {
    question: "Ça marche aussi pour les plats français complexes (bourguignon, blanquette...) ?",
    reponse:
      "Oui, c'est le point de départ d'Assiettly — reconnaître ces plats-là, pas seulement les burgers et les salades que les autres apps connaissent déjà.",
  },
  {
    question: "Quelle est la différence entre l'offre gratuite et Premium ?",
    reponse: `Le gratuit te donne le journal et la flamme en illimité, avec ${SCANS_GRATUITS_PAR_JOUR} scans de repas par photo par jour. Premium lève cette limite sur les scans.`,
  },
  {
    question: "Comment fonctionne la flamme, et que se passe-t-il si je rate un jour ?",
    reponse:
      "Ta flamme avance chaque jour où tu restes dans une marge de ±10 % autour de ton objectif calorique. Un jour manqué l'éteint — mais tu as 2 freezes (jours de grâce) par mois pour la préserver si besoin, sans te sentir pénalisé·e pour un écart ponctuel.",
  },
  {
    question: "Puis-je annuler mon abonnement à tout moment ?",
    reponse: "Oui, en un clic depuis ton profil — pas d'engagement, pas d'appel à passer.",
  },
  {
    question: `Que se passe-t-il après les ${TARIFS.essaiJours} jours d'essai si je ne m'abonne pas ?`,
    reponse: `Rien de dramatique : l'app repasse en mode gratuit (${SCANS_GRATUITS_PAR_JOUR} scans par jour), tes données et ta flamme restent intactes.`,
  },
  {
    question: "Mes données sont-elles en sécurité ?",
    reponse:
      "Oui : elles sont hébergées en Europe et le traitement est conforme au RGPD. Tu restes propriétaire de tes données et peux en demander l'export ou la suppression à tout moment depuis ton profil.",
  },
  {
    question: "Assiettly fonctionne-t-il sur iOS et Android ?",
    reponse:
      "Assiettly est une application web qui fonctionne directement depuis le navigateur de ton téléphone, iOS comme Android — sans passer par un store. Tu peux l'ajouter à ton écran d'accueil pour y accéder comme une app installée.",
  },
];

export function Faq() {
  return (
    <section id="faq" className="mx-auto max-w-3xl px-4 py-16 sm:px-6">
      <h2 className="text-center font-titre text-3xl font-bold text-charbon-800">Questions fréquentes</h2>

      <div className="mt-8 space-y-3">
        {QUESTIONS.map((item) => (
          <details key={item.question} className="group rounded-2xl bg-creme-50 p-5 shadow-sm">
            <summary className="flex cursor-pointer list-none items-center justify-between font-titre font-semibold text-charbon-800">
              {item.question}
              <span className="ml-4 shrink-0 text-corail-500 transition-transform group-open:rotate-45">+</span>
            </summary>
            <p className="mt-3 text-sm text-charbon-600">{item.reponse}</p>
          </details>
        ))}
      </div>
    </section>
  );
}
