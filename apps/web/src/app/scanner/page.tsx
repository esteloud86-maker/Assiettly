import { EcranScan } from "@/components/dashboard/scan/EcranScan";
import { requireProfile } from "@/server/auth";
import { estPremium } from "@/server/billing";

export default async function ScannerPage() {
  const profile = await requireProfile();
  return <EcranScan premium={estPremium(profile.subscription)} streakActuel={profile.streakSummary?.streakActuel ?? 0} />;
}
