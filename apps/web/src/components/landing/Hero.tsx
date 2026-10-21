import Link from "next/link";
import { DemoScan } from "./DemoScan";

export function Hero() {
  return (
    <section className="mx-auto max-w-2xl px-4 py-12 text-center sm:px-6 sm:py-16">
      <h1 className="font-titre text-4xl font-semibold leading-[1.05] tracking-tight text-charbon-800 sm:text-5xl">
        Enfin une app qui ne confond pas ta quiche avec une pizza.
      </h1>
      <p className="mt-4 text-lg text-charbon-600">
        Prends ton repas en photo. Calories et macros fiables, même pour un plat 100&nbsp;% français — en
        quelques secondes.
      </p>

      <div className="mt-8 flex flex-col items-center gap-3">
        <Link
          href="/inscription"
          className="w-full rounded-2xl bg-corail-500 px-8 py-4 text-center font-titre font-semibold text-white shadow-sm hover:bg-corail-600 sm:w-auto"
        >
          Essayer gratuitement
        </Link>
        <p className="text-sm text-charbon-400">Sans carte bancaire. Essai gratuit de 7 jours.</p>
      </div>

      <div className="mt-10">
        <DemoScan />
      </div>
    </section>
  );
}
