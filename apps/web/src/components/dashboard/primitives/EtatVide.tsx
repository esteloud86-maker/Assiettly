import Link from "next/link";

export function EtatVide({
  icone,
  titre,
  message,
  actionHref,
  actionLabel,
}: {
  icone: string;
  titre: string;
  message: string;
  actionHref?: string;
  actionLabel?: string;
}) {
  return (
    <div className="flex flex-col items-center rounded-2xl bg-creme-50 px-6 py-10 text-center shadow-sm">
      <span className="text-4xl">{icone}</span>
      <p className="mt-3 font-titre text-lg font-semibold text-charbon-800">{titre}</p>
      <p className="mt-1 text-sm text-charbon-400">{message}</p>
      {actionHref && actionLabel ? (
        <Link
          href={actionHref}
          className="mt-4 rounded-xl bg-corail-500 px-5 py-2.5 text-sm font-semibold text-white hover:bg-corail-600"
        >
          {actionLabel}
        </Link>
      ) : null}
    </div>
  );
}
