"use client";

import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { ajusterQuantiteRepas } from "@/server/actions/meals";

const PAS_G = 10;

export function AjusteurQuantiteRepas({ mealId, totalGrammes }: { mealId: string; totalGrammes: number }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  function ajuster(delta: number) {
    startTransition(async () => {
      await ajusterQuantiteRepas(mealId, delta);
      router.refresh();
    });
  }

  return (
    <div className="flex items-center gap-4">
      <button
        onClick={() => ajuster(-PAS_G)}
        disabled={isPending}
        aria-label="Réduire la portion"
        className="flex h-11 w-11 items-center justify-center rounded-full bg-creme-200 text-lg font-semibold text-charbon-800 disabled:opacity-50"
      >
        −
      </button>
      <span className="min-w-[4rem] text-center font-titre text-lg font-semibold text-charbon-800">
        {Math.round(totalGrammes)} g
      </span>
      <button
        onClick={() => ajuster(PAS_G)}
        disabled={isPending}
        aria-label="Augmenter la portion"
        className="flex h-11 w-11 items-center justify-center rounded-full bg-creme-200 text-lg font-semibold text-charbon-800 disabled:opacity-50"
      >
        +
      </button>
    </div>
  );
}
