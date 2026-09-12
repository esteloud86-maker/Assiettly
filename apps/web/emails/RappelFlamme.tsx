import { Button, Heading, Section, Text } from "@react-email/components";
import { EmailLayout } from "./components/EmailLayout";

export interface RappelFlammeProps {
  prenom: string | null;
  streakActuel: number;
}

/** Rappel envoyé en fin de journée quand la flamme d'un utilisateur est en danger. */
export function RappelFlamme({ prenom, streakActuel }: RappelFlammeProps) {
  const salutation = prenom ? `Salut ${prenom},` : "Salut,";
  const jours = streakActuel > 1 ? `${streakActuel} jours` : `${streakActuel} jour`;

  return (
    <EmailLayout apercu={`Ta flamme de ${jours} est en danger !`}>
      <Heading style={{ fontSize: 20, color: "#2B2320", margin: "20px 0 12px" }}>
        {salutation} ta flamme est en danger 🔥
      </Heading>
      <Text style={{ fontSize: 15, color: "#463C36", lineHeight: 1.5, margin: "0 0 12px" }}>
        Tu n&rsquo;as pas encore loggé de repas aujourd&rsquo;hui, et ta série de{" "}
        <strong>{jours}</strong> risque de s&rsquo;arrêter ce soir.
      </Text>
      <Text style={{ fontSize: 15, color: "#463C36", lineHeight: 1.5, margin: 0 }}>
        Un seul repas loggé avant minuit suffit pour la garder allumée.
      </Text>
      <Section style={{ textAlign: "center", margin: "28px 0 8px" }}>
        <Button
          href="https://assiettly.fr/journal/ajouter"
          style={{
            backgroundColor: "#F2603C",
            color: "#FFFFFF",
            padding: "14px 28px",
            borderRadius: 14,
            fontSize: 15,
            fontWeight: 600,
            textDecoration: "none",
          }}
        >
          Logger un repas maintenant
        </Button>
      </Section>
    </EmailLayout>
  );
}

export default RappelFlamme;
