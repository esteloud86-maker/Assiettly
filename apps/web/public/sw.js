// Service worker Assiettly — reçoit les notifications push (rappels de flamme)
// et ouvre l'app quand on clique dessus.

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
