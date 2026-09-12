export type TendancePoids = "progression_stable" | "ralentissement" | "stable_maintien" | "pas_assez_de_donnees";

const MESSAGES: Record<TendancePoids, string> = {
  progression_stable: "Belle régularité 👏 Ta courbe suit bien la direction de ton objectif, continue comme ça.",
  ralentissement:
    "Le rythme ralentit un peu ces derniers jours, et c'est tout à fait normal — le corps a parfois besoin de faire des paliers. Reste régulier·ère, ça repart.",
  stable_maintien: "Ton poids reste stable, exactement ce qu'il faut pour un objectif de maintien 🎯",
  pas_assez_de_donnees: "Ajoute quelques pesées de plus pour voir apparaître ta tendance ici.",
};

export function MessageEncouragement({ tendance }: { tendance: TendancePoids }) {
  return (
    <div className="rounded-2xl bg-sarcelle-50 p-4 text-sm font-medium text-sarcelle-600">{MESSAGES[tendance]}</div>
  );
}
