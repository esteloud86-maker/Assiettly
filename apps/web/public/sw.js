// Service worker Assiettly — deux rôles :
// 1) mise en cache légère du shell de l'app pour un chargement rapide et
//    l'installabilité PWA (pas d'objectif hors-ligne complet : le scan et
//    le calcul nutritionnel nécessitent une connexion, cf. PROGRESS.md)
// 2) réception des notifications push (rappels de flamme)

// v2 : ajout des photos de la démo du hero au précache (cf. bug "emoji
// avant les images" — en les ayant déjà en cache, elles s'affichent
// instantanément dès la 2e visite, sans round-trip réseau). Le changement
// de liste exige un bump de version pour que les clients déjà installés
// réinstallent le service worker et récupèrent ces fichiers.
const CACHE_VERSION = "assiettly-shell-v2";
const APP_SHELL = [
  "/manifest.webmanifest",
  "/icons/icon-192.png",
  "/icons/icon-512.png",
  "/icon-flamme-192.png",
  "/landing/demo/quiche-lorraine.webp",
  "/landing/demo/boeuf-bourguignon.webp",
  "/landing/demo/croissant.webp",
  "/landing/demo/croque-monsieur.webp",
  "/landing/demo/poulet-riz.webp",
  "/landing/demo/ratatouille.webp",
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches
      .open(CACHE_VERSION)
      .then((cache) => cache.addAll(APP_SHELL))
      .then(() => self.skipWaiting()),
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((clefs) => Promise.all(clefs.filter((c) => c !== CACHE_VERSION).map((c) => caches.delete(c))))
      .then(() => self.clients.claim()),
  );
});

self.addEventListener("fetch", (event) => {
  const { request } = event;
  if (request.method !== "GET") return;

  const url = new URL(request.url);
  if (url.origin !== self.location.origin) return;

  // Navigation (changement de page) : réseau d'abord pour toujours avoir le
  // contenu à jour, secours sur le cache uniquement si hors-ligne — jamais
  // de page figée en cache par défaut.
  if (request.mode === "navigate") {
    event.respondWith(fetch(request).catch(() => caches.match(request).then((r) => r ?? caches.match("/"))));
    return;
  }

  // Assets statiques versionnés (JS/CSS buildés, polices, icônes, photos de
  // la démo) : cache d'abord, ils ne changent jamais de contenu sous une
  // même URL.
  if (
    url.pathname.startsWith("/_next/static/") ||
    url.pathname.startsWith("/icons/") ||
    url.pathname.startsWith("/landing/")
  ) {
    event.respondWith(
      caches.match(request).then(
        (cached) =>
          cached ??
          fetch(request).then((reponse) => {
            const copie = reponse.clone();
            caches.open(CACHE_VERSION).then((cache) => cache.put(request, copie));
            return reponse;
          }),
      ),
    );
  }
});

self.addEventListener("push", (event) => {
  if (!event.data) return;

  let payload;
  try {
    payload = event.data.json();
  } catch {
    payload = { title: "Assiettly", body: event.data.text() };
  }

  const titre = payload.title ?? "🔥 Assiettly";
  const options = {
    body: payload.body ?? "",
    icon: "/icon-flamme-192.png",
    badge: "/icon-flamme-192.png",
    data: { url: payload.url ?? "/journal/ajouter" },
  };

  event.waitUntil(self.registration.showNotification(titre, options));
});

self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  const url = event.notification.data?.url ?? "/";

  event.waitUntil(
    self.clients.matchAll({ type: "window", includeUncontrolled: true }).then((clientsList) => {
      for (const client of clientsList) {
        if (client.url.includes(url) && "focus" in client) {
          return client.focus();
        }
      }
      if (self.clients.openWindow) {
        return self.clients.openWindow(url);
      }
    }),
  );
});
