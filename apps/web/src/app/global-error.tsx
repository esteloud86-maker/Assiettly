"use client";

import { useEffect } from "react";

/**
 * Filet de sécurité pour une exception dans `layout.tsx` lui-même (error.tsx
 * ne peut pas la capturer, car il est rendu À L'INTÉRIEUR du layout racine).
 * Doit fournir son propre <html>/<body> et éviter toute dépendance qui
 * pourrait elle-même échouer si le layout a planté sur un problème de
 * configuration — donc du CSS inline, pas de classes Tailwind/polices.
 */
export default function GlobalError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    console.error("[global-error.tsx]", error);
  }, [error]);

  return (
    <html lang="fr">
      <body
        style={{
          margin: 0,
          minHeight: "100vh",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          gap: "1rem",
          backgroundColor: "#FBF4EC",
          color: "#2B2320",
          fontFamily: "system-ui, sans-serif",
          textAlign: "center",
          padding: "1.5rem",
        }}
      >
        <p style={{ fontSize: "2.5rem", margin: 0 }} aria-hidden="true">
          😕
        </p>
        <h1 style={{ fontSize: "1.25rem", fontWeight: 700, margin: 0 }}>Un problème est survenu</h1>
        <p style={{ fontSize: "0.9rem", maxWidth: "24rem", color: "#6B615B" }}>
          Quelque chose s&rsquo;est mal passé de notre côté. Réessaie — si ça persiste, reviens un peu plus tard.
        </p>
        {error.digest ? <p style={{ fontSize: "0.75rem", color: "#6B615B" }}>Référence : {error.digest}</p> : null}
        <div style={{ display: "flex", gap: "0.75rem", marginTop: "0.5rem" }}>
          <button
            type="button"
            onClick={reset}
            style={{
              borderRadius: "1rem",
              backgroundColor: "#F2603C",
              color: "#fff",
              padding: "0.75rem 1.5rem",
              fontWeight: 600,
              border: "none",
              cursor: "pointer",
            }}
          >
            Réessayer
          </button>
          <a
            href="/"
            style={{
              borderRadius: "1rem",
              backgroundColor: "#fff",
              color: "#2B2320",
              padding: "0.75rem 1.5rem",
              fontWeight: 600,
              border: "1px solid rgba(43,35,32,0.2)",
              textDecoration: "none",
            }}
          >
            Retour à l&rsquo;accueil
          </a>
        </div>
      </body>
    </html>
  );
}
