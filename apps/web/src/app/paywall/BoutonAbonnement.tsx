"use client";

import { useFormStatus } from "react-dom";

interface BoutonAbonnementProps {
  children: React.ReactNode;
  className: string;
}

/**
 * Bouton de soumission désactivé pendant la redirection vers Stripe
 * Checkout — évite qu'un double-clic déclenche deux `demarrerAbonnement`
 * en parallèle (deux sessions Stripe Checkout créées pour le même choix).
 */
export function BoutonAbonnement({ children, className }: BoutonAbonnementProps) {
  const { pending } = useFormStatus();

  return (
    <button type="submit" disabled={pending} className={`${className} disabled:opacity-50`}>
      {pending ? "Redirection..." : children}
    </button>
  );
}
