"use client";

export function BoutonPartager({ titre }: { titre: string }) {
  async function partager() {
    if (navigator.share) {
      await navigator.share({ title: titre, text: `${titre} — suivi sur Assiettly` }).catch(() => {});
    }
  }

  return (
    <button
      onClick={partager}
      aria-label="Partager"
      className="flex h-9 w-9 items-center justify-center rounded-full bg-creme-50/90 text-charbon-800 shadow-sm"
    >
      ↗
    </button>
  );
}
