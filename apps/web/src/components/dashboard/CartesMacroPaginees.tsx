"use client";

import { useState } from "react";
import { CarteMacro } from "./CarteMacro";
import { PaginationPoints } from "./primitives/PaginationPoints";

interface DefinitionMacro {
  label: string;
  valeur: number;
  objectif: number;
  unite?: string;
  couleur: string;
}

export function CartesMacroPaginees({ pages }: { pages: DefinitionMacro[][] }) {
  const [page, setPage] = useState(0);

  return (
    <div>
      <div className="grid grid-cols-3 gap-3">
        {pages[page].map((macro) => (
          <CarteMacro key={macro.label} {...macro} />
        ))}
      </div>
      <div className="mt-3">
        <PaginationPoints total={pages.length} actif={page} onChange={setPage} />
      </div>
    </div>
  );
}
