import Link from "next/link";
import { MockupDashboard } from "./MockupDashboard";

export function Hero() {
  return (
    <section className="mx-auto max-w-6xl px-4 py-12 sm:px-6 sm:py-20">
      <div className="grid items-center gap-10 lg:grid-cols-2 lg:gap-16">
        <div className="text-center lg:text-left">
          <h1 className="font-titre text-4xl font-bold leading-tight text-charbon-800 sm:text-5xl">
            Le seul suivi alimentaire qui reconnaît vraiment la cuisine française.
          </h1>
          <p className="mt-4 text-lg text-charbon-600">
            Et grâce à la flamme quotidienne, c&rsquo;est aussi le seul que tu continueras après deux semaines.
          </p>

          <div className="mt-8 flex flex-col items-center gap-3 sm:flex-row lg:justify-start">
            <Link
              href="/inscription"
              className="w-full rounded-2xl bg-corail-500 px-8 py-4 text-center font-titre font-semibold text-white shadow-sm hover:bg-corail-600 sm:w-auto"
            >
              Essayer gratuitement
            </Link>
            <a
              href="#comment-ca-marche"
              className="w-full rounded-2xl border border-creme-200 bg-creme-50 px-8 py-4 text-center font-titre font-semibold text-charbon-800 hover:bg-creme-200 sm:w-auto"
            >
              Voir comment ça marche
            </a>
          </div>
          <p className="mt-3 text-sm text-charbon-400">Sans carte bancaire · Prêt en 2 minutes</p>
        </div>

        <div className="flex justify-center">
          <MockupDashboard />
        </div>
      </div>
    </section>
  );
}
