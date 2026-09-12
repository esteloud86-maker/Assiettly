"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { FlammeIcon } from "@/components/FlammeIcon";
import { createClient } from "@/lib/supabase/client";

const LIENS = [
  { href: "/accueil", label: "Accueil" },
  { href: "/journal", label: "Journal" },
  { href: "/poids", label: "Poids" },
  { href: "/streaks/calendrier", label: "Calendrier" },
  { href: "/profil", label: "Profil" },
];

export function EnTeteApp({ streakActuel }: { streakActuel: number }) {
  const pathname = usePathname();
  const router = useRouter();

  async function seDeconnecter() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/connexion");
    router.refresh();
  }

  return (
    <header className="border-b border-creme-200 bg-creme-50">
      <div className="mx-auto flex max-w-4xl flex-wrap items-center justify-between gap-4 px-4 py-3 sm:px-6">
        <div className="flex items-center gap-6">
          <Link href="/accueil" className="font-titre text-lg font-semibold text-charbon-800">
            Assiettly
          </Link>
          <nav className="hidden gap-1 sm:flex">
            {LIENS.map((lien) => (
              <Link
                key={lien.href}
                href={lien.href}
                className={`rounded-full px-3 py-1.5 text-sm font-medium transition-colors ${
                  pathname === lien.href
                    ? "bg-corail-500 text-white"
                    : "text-charbon-600 hover:bg-creme-200"
                }`}
              >
                {lien.label}
              </Link>
            ))}
          </nav>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 rounded-full bg-creme-200 px-3 py-1.5">
            <FlammeIcon className="h-5 w-5" eteinte={streakActuel === 0} />
            <span className="font-titre text-sm font-semibold text-charbon-800">{streakActuel}</span>
          </div>
          <button
            onClick={seDeconnecter}
            className="text-sm font-medium text-charbon-400 hover:text-charbon-800"
          >
            Déconnexion
          </button>
        </div>
      </div>
      <nav className="flex gap-1 overflow-x-auto px-4 pb-2 sm:hidden">
        {LIENS.map((lien) => (
          <Link
            key={lien.href}
            href={lien.href}
            className={`whitespace-nowrap rounded-full px-3 py-1.5 text-sm font-medium ${
              pathname === lien.href ? "bg-corail-500 text-white" : "text-charbon-600 hover:bg-creme-200"
            }`}
          >
            {lien.label}
          </Link>
        ))}
      </nav>
    </header>
  );
}
