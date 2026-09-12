import type { FastifyInstance, FastifyReply, FastifyRequest } from "fastify";
import fp from "fastify-plugin";
import { jwtVerify } from "jose";

declare module "fastify" {
  interface FastifyRequest {
    auth: {
      profileId: string;
      email: string;
    };
  }
  interface FastifyContextConfig {
    /** Marque une route comme accessible sans JWT (ex: /health). */
    public?: boolean;
  }
}

/**
 * Vérifie le JWT émis par Supabase Auth (HS256, signé avec SUPABASE_JWT_SECRET)
 * et attache `request.auth.profileId` / `request.auth.email` — le profileId
 * réutilise l'UUID `sub` du token, identique à auth.users.id côté Supabase.
 *
 * Enveloppé avec fastify-plugin pour que le hook `onRequest` s'applique à
 * TOUTES les routes enregistrées sur l'instance racine (et pas seulement à
 * un contexte encapsulé isolé), y compris celles enregistrées après ce plugin.
 */
export const authPlugin = fp(async function authPlugin(app: FastifyInstance): Promise<void> {
  const secret = process.env.SUPABASE_JWT_SECRET;
  if (!secret) {
    throw new Error("SUPABASE_JWT_SECRET manquant dans l'environnement");
  }
  const secretKey = new TextEncoder().encode(secret);

  app.decorateRequest("auth", null);

  app.addHook("onRequest", async (request: FastifyRequest, reply: FastifyReply) => {
    if (request.routeOptions?.config?.public) return;

    const authHeader = request.headers.authorization;
    if (!authHeader?.startsWith("Bearer ")) {
      return reply.code(401).send({ error: "Authentification requise" });
    }

    const token = authHeader.slice("Bearer ".length);
    try {
      const { payload } = await jwtVerify(token, secretKey);
      if (typeof payload.sub !== "string" || typeof payload.email !== "string") {
        return reply.code(401).send({ error: "Token invalide" });
      }
      request.auth = { profileId: payload.sub, email: payload.email };
    } catch {
      return reply.code(401).send({ error: "Token invalide ou expiré" });
    }
  });
});
