import Link from "next/link";
import { TARIFS } from "@/lib/pricing";

/** Dernier appel à l'action avant le footer — même CTA que le hero, pour qui a lu jusqu'en bas sans encore cliqué. */
export function CtaFinal() {
  return (
    <section className="mx-auto max-w-2xl px-4 py-16 text-center sm:px-6">
      <h2 className="font-titre text-2xl font-bold text-charbon-800 sm:text-3xl">
        Prêt à arrêter de deviner tes macros&nbsp;?
      </h2>
      <div className="mt-6 flex flex-col items-center gap-3">
        <Link
          href="/inscription"
          className="w-full rounded-2xl bg-corail-500 px-8 py-4 text-center font-titre font-semibold text-white shadow-sm hover:bg-corail-600 sm:w-auto"
        >
          Essayer gratuitement
        </Link>
        <p className="text-sm text-charbon-400">Sans carte bancaire. Essai gratuit de {TARIFS.essaiJours} jours.</p>
      </div>
    </section>
  );
}
