import { FluxGroupesMock } from "@/components/dashboard/social/FluxGroupesMock";

export default function GroupesPage() {
  return (
    <div className="space-y-6">
      <h1 className="font-titre text-2xl font-semibold text-charbon-800">Groupes</h1>
      <FluxGroupesMock />
    </div>
  );
}
