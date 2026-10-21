import { redirect } from "next/navigation";
import { CommentCaFonctionne } from "@/components/landing/CommentCaFonctionne";
import { CtaFinal } from "@/components/landing/CtaFinal";
import { DansLApp } from "@/components/landing/DansLApp";
import { Faq } from "@/components/landing/Faq";
import { FooterLanding } from "@/components/landing/FooterLanding";
import { HeaderLanding } from "@/components/landing/HeaderLanding";
import { Hero } from "@/components/landing/Hero";
import { LivreOr } from "@/components/landing/LivreOr";
import { PlatsTestes } from "@/components/landing/PlatsTestes";
import { Tarifs } from "@/components/landing/Tarifs";
import { obtenirAvisAffiches } from "@/lib/avis";
import { createClient } from "@/lib/supabase/server";

export default async function LandingPage() {
  // Si Supabase est mal configuré ou injoignable, la landing (page la plus
  // visitée du site) ne doit jamais planter pour autant — au pire un
  // utilisateur déjà connecté revoit la page publique au lieu d'être
  // redirigé vers /accueil, ce qui reste sans commune mesure avec un écran
  // "Application error" pour tout le monde (cf. middleware.ts, même règle).
  let user = null;
  try {
    const supabase = createClient();
    const { data } = await supabase.auth.getUser();
    user = data.user;
  } catch (erreur) {
    console.error("[LandingPage] Supabase injoignable ou mal configuré :", erreur);
  }

  if (user) redirect("/accueil");

  // Même garde que LivreOr.tsx (moins de 3 avis valides = section masquée)
  // — calculée ici pour que la nav n'affiche jamais un lien vers une
  // section qui ne se rend pas.
  const avisVisibles = obtenirAvisAffiches().length > 0;

  return (
    <div className="bg-creme-100">
      <HeaderLanding avisVisibles={avisVisibles} />
      <Hero />
      <CommentCaFonctionne />
      <PlatsTestes />
      <LivreOr />
      <DansLApp />
      <Tarifs />
      <Faq />
      <CtaFinal />
      <FooterLanding />
    </div>
  );
}
