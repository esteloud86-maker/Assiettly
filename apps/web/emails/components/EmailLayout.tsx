import { Body, Container, Head, Hr, Html, Preview, Text } from "@react-email/components";
import type { ReactNode } from "react";

/**
 * Habillage commun à tous les e-mails Assiettly : mêmes couleurs de marque
 * que l'app (corail/ivoire/charbon), pour rester cohérent hors du produit.
 */
const COULEURS = {
  fond: "#FBF4EC",
  carte: "#FFFFFF",
  corail: "#F2603C",
  charbon: "#2B2320",
  charbonClair: "#6B615B",
  trait: "#F5E6D8",
};

export function EmailLayout({ apercu, children }: { apercu: string; children: ReactNode }) {
  return (
    <Html lang="fr">
      <Head />
      <Preview>{apercu}</Preview>
      <Body
        style={{
          backgroundColor: COULEURS.fond,
          fontFamily: "Helvetica, Arial, sans-serif",
          padding: "24px 0",
          margin: 0,
        }}
      >
        <Container
          style={{
            backgroundColor: COULEURS.carte,
            borderRadius: 20,
            padding: "32px 28px",
            maxWidth: 480,
          }}
        >
          <Text style={{ fontSize: 22, fontWeight: 700, color: COULEURS.corail, margin: "0 0 4px" }}>
            🔥 Assiettly
          </Text>
          {children}
          <Hr style={{ borderColor: COULEURS.trait, margin: "28px 0 16px" }} />
          <Text style={{ fontSize: 12, color: COULEURS.charbonClair, margin: 0, lineHeight: 1.5 }}>
            Tu reçois cet e-mail parce que tu as un compte Assiettly.{" "}
            <a href="https://assiettly.fr/profil" style={{ color: COULEURS.charbonClair }}>
              Gérer mes préférences
            </a>
          </Text>
        </Container>
      </Body>
    </Html>
  );
}
