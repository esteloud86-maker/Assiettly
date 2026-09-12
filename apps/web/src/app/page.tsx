import Link from "next/link";
import { redirect } from "next/navigation";
import { FlammeIcon } from "@/components/FlammeIcon";
import { createClient } from "@/lib/supabase/server";

export default async function LandingPage() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (user) redirect("/accueil");

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-creme-100 px-4 text-center">
      <FlammeIcon className="h-16 w-16" />
      <h1 className="mt-4 font-titre text-4xl font-bold text-charbon-800">Assiettly</h1>
      <p className="mt-3 max-w-md text-lg text-charbon-600">
        Le suivi nutritionnel simple, chaleureux et motivant — pensé pour la cuisine française.
      </p>
      <div className="mt-8 flex gap-3">
        <Link href="/inscription" className="rounded-xl bg-corail-500 px-6 py-3 font-titre font-semibold text-white">
          Commencer gratuitement
        </Link>
        <Link href="/connexion" className="rounded-xl bg-creme-50 px-6 py-3 font-titre font-semibold text-charbon-800">
          Se connecter
        </Link>
      </div>
    </div>
  );
}
