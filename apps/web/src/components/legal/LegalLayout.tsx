import Link from "next/link";
import type { ReactNode } from "react";

interface LegalLayoutProps {
  titre: string;
  misAJourLe: string;
  children: ReactNode;
}

/**
 * Mise en page partagée par les trois pages légales (mentions légales, CGU,
 * confidentialité). Ne porte que la structure/typographie commune — le
 * contenu de chaque page reste spécifique et rédigé en clair, pas générique.
 */
export function LegalLayout({ titre, misAJourLe, children }: LegalLayoutProps) {
  return (
    <div className="mx-auto min-h-screen max-w-3xl px-4 py-16 sm:px-6">
      <Link href="/" className="font-titre text-lg font-semibold text-charbon-800">
        ← Assiettly
      </Link>

      <h1 className="mt-6 font-titre text-3xl font-bold text-charbon-800 sm:text-4xl">{titre}</h1>
      <p className="mt-2 text-sm text-charbon-400">Dernière mise à jour : {misAJourLe}</p>

      <div
        className="
          mt-8 space-y-8 text-charbon-600
          [&_h2]:font-titre [&_h2]:text-xl [&_h2]:font-semibold [&_h2]:text-charbon-800
          [&_h3]:font-titre [&_h3]:text-base [&_h3]:font-semibold [&_h3]:text-charbon-800
          [&_p]:mt-3 [&_p]:leading-relaxed
          [&_ul]:mt-3 [&_ul]:list-disc [&_ul]:space-y-1.5 [&_ul]:pl-5
          [&_li]:leading-relaxed
          [&_a]:font-medium [&_a]:text-corail-600 [&_a]:underline [&_a]:underline-offset-2
          [&_strong]:font-semibold [&_strong]:text-charbon-800
          [&_section]:scroll-mt-6
        "
      >
        {children}
      </div>

      <p className="mt-12 border-t border-charbon-400/20 pt-6 text-sm text-charbon-400">
        Une question sur cette page ? Écris-nous à{" "}
        <a href="mailto:contact@assiettly.fr" className="font-medium text-corail-600 underline underline-offset-2">
          contact@assiettly.fr
        </a>
        .
      </p>
    </div>
  );
}
