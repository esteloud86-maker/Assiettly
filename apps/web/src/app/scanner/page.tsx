import { EcranScanMock } from "@/components/dashboard/scan/EcranScanMock";
import { requireProfile } from "@/server/auth";

export default async function ScannerPage() {
  await requireProfile();
  return <EcranScanMock />;
}
