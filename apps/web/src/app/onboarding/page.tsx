import { redirect } from "next/navigation";
import { OnboardingWizard } from "@/components/OnboardingWizard";
import { requireProfile } from "@/server/auth";

export default async function OnboardingPage() {
  const profile = await requireProfile();
  if (profile.onboardingTermine) redirect("/accueil");

  return <OnboardingWizard />;
}
