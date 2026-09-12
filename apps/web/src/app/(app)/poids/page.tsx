import { GraphiquePoids } from "@/components/GraphiquePoids";
import { PoidsForm } from "@/components/PoidsForm";
import { obtenirHistoriquePoids } from "@/server/actions/weight";

export default async function PoidsPage() {
  const logs = await obtenirHistoriquePoids();
  const dernierPoids = logs.at(-1);

  return (
    <div className="space-y-6">
      <h1 className="font-titre text-2xl font-semibold text-charbon-800">Suivi du poids</h1>

      <div className="rounded-2xl bg-creme-50 p-6 shadow-sm">
        <GraphiquePoids points={logs.map((l) => ({ date: l.date.toISOString(), poidsKg: Number(l.poidsKg) }))} />
        {dernierPoids ? (
          <p className="mt-3 text-center font-semibold text-charbon-800">
            Dernière pesée : {Number(dernierPoids.poidsKg)} kg
          </p>
        ) : null}
      </div>

      <PoidsForm />
    </div>
  );
}
