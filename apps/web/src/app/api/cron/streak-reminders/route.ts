import { render } from "@react-email/render";
import { NextResponse } from "next/server";
import { RappelFlamme } from "../../../../../emails/RappelFlamme";
import { prisma } from "@/lib/prisma";
import { RESEND_FROM_EMAIL, resend } from "@/lib/resend";
import { webpush } from "@/lib/webpush";

export const runtime = "nodejs";
export const maxDuration = 60;

/**
 * Appelé une fois par jour par Vercel Cron (voir vercel.json). Envoie un
 * rappel (e-mail + notification push) à chaque profil dont la flamme est
 * allumée mais qui n'a encore ajouté aucun repas aujourd'hui.
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
      pushSubscriptions: { select: { endpoint: true, p256dh: true, auth: true } },
    },
  });

  const resultatsEmail = await Promise.allSettled(
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

  const abonnementsAExpirer: string[] = [];

  const resultatsPush = await Promise.allSettled(
    profils.flatMap((profil) => {
      const streakActuel = profil.streakSummary!.streakActuel;
      const payload = JSON.stringify({
        title: `🔥 Ne perds pas ta flamme de ${streakActuel} jour${streakActuel > 1 ? "s" : ""} !`,
        body: "Un seul repas ajouté avant minuit suffit pour la garder allumée.",
        url: "/journal/ajouter",
      });

      return profil.pushSubscriptions.map(async (abonnement) => {
        try {
          await webpush.sendNotification(
            { endpoint: abonnement.endpoint, keys: { p256dh: abonnement.p256dh, auth: abonnement.auth } },
            payload,
          );
        } catch (err) {
          const statusCode = (err as { statusCode?: number }).statusCode;
          if (statusCode === 404 || statusCode === 410) {
            abonnementsAExpirer.push(abonnement.endpoint);
          }
          throw err;
        }
      });
    }),
  );

  if (abonnementsAExpirer.length > 0) {
    await prisma.pushSubscription.deleteMany({ where: { endpoint: { in: abonnementsAExpirer } } });
  }

  const emailsEnvoyes = resultatsEmail.filter((r) => r.status === "fulfilled").length;
  const pushEnvoyes = resultatsPush.filter((r) => r.status === "fulfilled").length;

  return NextResponse.json({
    profilsCibles: profils.length,
    emails: { envoyes: emailsEnvoyes, echoues: resultatsEmail.length - emailsEnvoyes },
    push: { envoyes: pushEnvoyes, echoues: resultatsPush.length - pushEnvoyes, expires: abonnementsAExpirer.length },
  });
}
