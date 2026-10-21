import { CarteLienParrainage } from "@/components/dashboard/CarteLienParrainage";
import { PARRAINAGE_MOIS_OFFERTS, PARRAINAGE_REPAS_REQUIS } from "@/lib/pricing";
import { obtenirLienParrainage } from "@/server/actions/parrainage";

export default async function ParrainagePage() {
  const { url, moisGagnes, filleulsEnAttente } = await obtenirLienParrainage();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-titre text-2xl font-semibold text-charbon-800">Invite un ami</h1>
        <p className="mt-1 text-charbon-400">
          Quand ton invité·e finit son inscription et enregistre {PARRAINAGE_REPAS_REQUIS} repas, vous recevez
          chacun {PARRAINAGE_MOIS_OFFERTS} mois de Premium offert.
        </p>
      </div>

      <CarteLienParrainage url={url} />

      <div className="grid grid-cols-2 gap-3">
        <div className="rounded-2xl bg-creme-50 p-4 text-center shadow-sm">
          <p className="font-titre text-2xl font-bold text-charbon-800">{moisGagnes}</p>
          <p className="text-xs text-charbon-400">mois Premium gagnés</p>
        </div>
        <div className="rounded-2xl bg-creme-50 p-4 text-center shadow-sm">
          <p className="font-titre text-2xl font-bold text-charbon-800">{filleulsEnAttente}</p>
          <p className="text-xs text-charbon-400">invité·e·s en cours</p>
        </div>
      </div>
    </div>
  );
}
