"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { MenuActionRapide } from "./MenuActionRapide";

const ONGLETS = [
  { href: "/accueil", icone: "🏠", label: "Accueil" },
  { href: "/progres", icone: "📈", label: "Progrès" },
  { href: "/groupes", icone: "👥", label: "Groupes" },
  { href: "/profil", icone: "👤", label: "Profil" },
];

export function BarreNavigation() {
  const pathname = usePathname();

  return (
    <nav className="fixed inset-x-0 bottom-0 z-40 border-t border-creme-200 bg-creme-50/95 backdrop-blur">
      <div className="mx-auto flex max-w-4xl items-center justify-between px-4">
        {ONGLETS.slice(0, 2).map((onglet) => (
          <OngletLien key={onglet.href} onglet={onglet} actif={pathname.startsWith(onglet.href)} />
        ))}

        <MenuActionRapide />

        {ONGLETS.slice(2).map((onglet) => (
          <OngletLien key={onglet.href} onglet={onglet} actif={pathname.startsWith(onglet.href)} />
        ))}
      </div>
    </nav>
  );
}

function OngletLien({
  onglet,
  actif,
}: {
  onglet: { href: string; icone: string; label: string };
  actif: boolean;
}) {
  return (
    <Link
      href={onglet.href}
      className={`flex flex-1 flex-col items-center gap-0.5 py-2.5 text-xs font-medium ${
        actif ? "text-corail-600" : "text-charbon-400"
      }`}
    >
      <span className="text-lg">{onglet.icone}</span>
      {onglet.label}
    </Link>
  );
}
