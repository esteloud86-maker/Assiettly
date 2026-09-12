import { EcranScan } from "@/components/dashboard/scan/EcranScan";
import { requireProfile } from "@/server/auth";

export default async function ScannerPage() {
  await requireProfile();
  return <EcranScan />;
}
