/** Utilitaires côté navigateur pour l'abonnement aux notifications push. */

export function pushEstSupporte(): boolean {
  return typeof window !== "undefined" && "serviceWorker" in navigator && "PushManager" in window;
}

function urlBase64VersUint8Array(base64: string): Uint8Array {
  const padding = "=".repeat((4 - (base64.length % 4)) % 4);
  const base64Url = (base64 + padding).replace(/-/g, "+").replace(/_/g, "/");
  const brut = window.atob(base64Url);
  return Uint8Array.from([...brut].map((c) => c.charCodeAt(0)));
}

export interface AbonnementPushJSON {
  endpoint: string;
  keys: { p256dh: string; auth: string };
}

/**
 * Demande la permission de notification au navigateur, puis crée un
 * abonnement push. Retourne `null` si la permission est refusée ou si le
 * navigateur ne supporte pas les push (l'appelant doit gérer ce cas sans
 * bloquer le reste du parcours).
 */
export async function demanderPermissionEtSabonner(): Promise<AbonnementPushJSON | null> {
  if (!pushEstSupporte()) return null;

  const permission = await Notification.requestPermission();
  if (permission !== "granted") return null;

  const registration = await navigator.serviceWorker.register("/sw.js");
  await navigator.serviceWorker.ready;

  const vapidPublicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY!;
  const subscription = await registration.pushManager.subscribe({
    userVisibleOnly: true,
    applicationServerKey: urlBase64VersUint8Array(vapidPublicKey) as BufferSource,
  });

  return subscription.toJSON() as AbonnementPushJSON;
}
