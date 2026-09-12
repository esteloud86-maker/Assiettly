import cors from "@fastify/cors";
import Fastify from "fastify";
import { authPlugin } from "./plugins/auth";
import { foodsRoutes } from "./routes/foods";
import { mealsRoutes } from "./routes/meals";
import { profileRoutes } from "./routes/profile";
import { streaksRoutes } from "./routes/streaks";
import { weightRoutes } from "./routes/weight";

export async function buildApp() {
  const app = Fastify({ logger: true });

  await app.register(cors, { origin: true });

  app.get("/health", { config: { public: true } }, async () => ({ status: "ok" }));

  await app.register(authPlugin);

  await app.register(profileRoutes);
  await app.register(weightRoutes);
  await app.register(foodsRoutes);
  await app.register(mealsRoutes);
  await app.register(streaksRoutes);

  return app;
}
