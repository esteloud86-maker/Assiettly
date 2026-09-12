import Link from "next/link";
import { MenuMobile } from "./MenuMobile";

export function HeaderLanding() {
  return (
    <header className="relative border-b border-creme-200 bg-creme-100">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4 sm:px-6">
        <Link href="/" className="font-titre text-xl font-bold text-charbon-800">
          Assiettly
        </Link>

        <nav className="hidden gap-6 sm:flex">
          <a href="#fonctionnalites" className="text-sm font-medium text-charbon-600 hover:text-charbon-800">
            Fonctionnalités
          </a>
          <a href="#tarifs" className="text-sm font-medium text-charbon-600 hover:text-charbon-800">
            Tarifs
          </a>
        </nav>

        <div className="hidden items-center gap-3 sm:flex">
          <Link href="/connexion" className="text-sm font-medium text-charbon-600 hover:text-charbon-800">
            Se connecter
          </Link>
          <Link
            href="/inscription"
            className="rounded-xl bg-corail-500 px-4 py-2 text-sm font-titre font-semibold text-white hover:bg-corail-600"
          >
            Commencer gratuitement
          </Link>
        </div>

        <MenuMobile />
      </div>
    </header>
  );
}
