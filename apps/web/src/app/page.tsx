import { redirect } from "next/navigation";
import { Comparatif } from "@/components/landing/Comparatif";
import { CommentCaFonctionne } from "@/components/landing/CommentCaFonctionne";
import { Faq } from "@/components/landing/Faq";
import { Fonctionnalites } from "@/components/landing/Fonctionnalites";
import { FooterLanding } from "@/components/landing/FooterLanding";
import { HeaderLanding } from "@/components/landing/HeaderLanding";
import { Hero } from "@/components/landing/Hero";
import { Tarifs } from "@/components/landing/Tarifs";
import { createClient } from "@/lib/supabase/server";

export default async function LandingPage() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (user) redirect("/accueil");

  return (
    <div className="bg-creme-100">
      <HeaderLanding />
      <Hero />
      <CommentCaFonctionne />
      <Fonctionnalites />
      <Comparatif />
      <Tarifs />
      <Faq />
      <FooterLanding />
    </div>
  );
}
