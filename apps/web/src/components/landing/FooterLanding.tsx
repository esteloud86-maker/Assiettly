import Link from "next/link";

export function FooterLanding() {
  return (
    <footer className="border-t border-creme-200 px-4 py-8 sm:px-6">
      <div className="mx-auto flex max-w-6xl flex-col items-center gap-4 text-sm text-charbon-400 sm:flex-row sm:justify-between">
        <p>© {new Date().getFullYear()} Assiettly. Tous droits réservés.</p>
        <nav className="flex gap-4">
          <Link href="/mentions-legales" className="hover:text-charbon-800">
            Mentions légales
          </Link>
          <Link href="/cgu" className="hover:text-charbon-800">
            CGU
          </Link>
          <Link href="/confidentialite" className="hover:text-charbon-800">
            Confidentialité
          </Link>
        </nav>
      </div>
    </footer>
  );
}
