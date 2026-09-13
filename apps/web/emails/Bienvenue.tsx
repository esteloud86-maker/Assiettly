import { Button, Heading, Section, Text } from "@react-email/components";
import { EmailLayout } from "./components/EmailLayout";

export interface BienvenueProps {
  prenom: string | null;
}

/** Envoyé une fois, juste après que l'utilisateur a terminé l'onboarding. */
export function Bienvenue({ prenom }: BienvenueProps) {
  const salutation = prenom ? `Bienvenue ${prenom} !` : "Bienvenue !";

  return (
    <EmailLayout apercu="Ton compte Assiettly est prêt, à toi de jouer.">
      <Heading style={{ fontSize: 20, color: "#2B2320", margin: "20px 0 12px" }}>{salutation} 🎉</Heading>
      <Text style={{ fontSize: 15, color: "#463C36", lineHeight: 1.5, margin: "0 0 12px" }}>
        Ton profil est configuré et tes objectifs caloriques sont calculés. Il ne te reste plus qu&rsquo;à
        ajouter ton premier repas pour allumer ta flamme.
      </Text>
      <Text style={{ fontSize: 15, color: "#463C36", lineHeight: 1.5, margin: 0 }}>
        Un repas ajouté chaque jour suffit à la garder allumée, même les jours où ton alimentation s&rsquo;écarte
        un peu de tes objectifs.
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
          Ajouter mon premier repas
        </Button>
      </Section>
    </EmailLayout>
  );
}

export default Bienvenue;
