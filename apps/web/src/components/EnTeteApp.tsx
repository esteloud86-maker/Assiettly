"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { FlammeIcon } from "@/components/FlammeIcon";
import { createClient } from "@/lib/supabase/client";

export function EnTeteApp({ streakActuel }: { streakActuel: number }) {
  const router = useRouter();

  async function seDeconnecter() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/connexion");
    router.refresh();
  }

  return (
    <header className="border-b border-creme-200 bg-creme-50">
      <div className="mx-auto flex max-w-4xl items-center justify-between px-4 py-3 sm:px-6">
        <Link href="/accueil" className="font-titre text-lg font-semibold text-charbon-800">
          Assiettly
        </Link>

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
    </header>
  );
}
