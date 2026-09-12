import Link from "next/link";

export function PageLegaleStub({ titre }: { titre: string }) {
  return (
    <div className="mx-auto min-h-screen max-w-2xl px-4 py-16">
      <Link href="/" className="font-titre text-lg font-semibold text-charbon-800">
        ← Assiettly
      </Link>
      <h1 className="mt-6 font-titre text-3xl font-bold text-charbon-800">{titre}</h1>
      <p className="mt-4 text-charbon-600">
        Cette page sera complétée avant le lancement public d&rsquo;Assiettly. En attendant, pour toute question
        relative à ce sujet, contacte-nous directement.
      </p>
    </div>
  );
}
