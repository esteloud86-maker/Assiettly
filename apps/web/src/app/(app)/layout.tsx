import { redirect } from "next/navigation";
import { EnTeteApp } from "@/components/EnTeteApp";
import { requireProfile } from "@/server/auth";

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const profile = await requireProfile();

  if (!profile.onboardingTermine) {
    redirect("/onboarding");
  }

  return (
    <div className="min-h-screen bg-creme-100">
      <EnTeteApp streakActuel={profile.streakSummary?.streakActuel ?? 0} />
      <main className="mx-auto max-w-4xl px-4 py-6 sm:px-6">{children}</main>
    </div>
  );
}
