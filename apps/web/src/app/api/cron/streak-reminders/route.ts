import { render } from "@react-email/render";
import { NextResponse } from "next/server";
import { RappelFlamme } from "../../../../../emails/RappelFlamme";
import { prisma } from "@/lib/prisma";
import { RESEND_FROM_EMAIL, resend } from "@/lib/resend";

export const runtime = "nodejs";
export const maxDuration = 60;

/**
 * Appelé une fois par jour par Vercel Cron (voir vercel.json). Envoie un
 * rappel à chaque profil dont la flamme est allumée mais qui n'a encore
 * loggé aucun repas aujourd'hui.
 */
export async function GET(request: Request) {
  const authHeader = request.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  }

  const maintenant = new Date();
  const debutJour = new Date(
    Date.UTC(maintenant.getUTCFullYear(), maintenant.getUTCMonth(), maintenant.getUTCDate()),
  );
  const finJour = new Date(debutJour);
  finJour.setUTCDate(finJour.getUTCDate() + 1);

  const profils = await prisma.profile.findMany({
    where: {
      onboardingTermine: true,
      streakSummary: { streakActuel: { gt: 0 } },
      meals: { none: { date: { gte: debutJour, lt: finJour } } },
    },
    select: {
      email: true,
      nom: true,
      streakSummary: { select: { streakActuel: true } },
    },
  });

  const resultats = await Promise.allSettled(
    profils.map(async (profil) => {
      const streakActuel = profil.streakSummary!.streakActuel;
      const html = await render(RappelFlamme({ prenom: profil.nom, streakActuel }));
      return resend.emails.send({
        from: RESEND_FROM_EMAIL,
        to: profil.email,
        subject: `🔥 Ne perds pas ta flamme de ${streakActuel} jour${streakActuel > 1 ? "s" : ""} !`,
        html,
      });
    }),
  );

  const envoyes = resultats.filter((r) => r.status === "fulfilled").length;
  const echoues = resultats.length - envoyes;

  return NextResponse.json({ profilsCibles: profils.length, envoyes, echoues });
}
