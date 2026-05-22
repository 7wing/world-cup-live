// public/sw.js
// Service Worker — receives Web Push events and shows notifications.
// Register in src/main.tsx:
//
//   if ('serviceWorker' in navigator) {
//     navigator.serviceWorker.register('/sw.js')
//   }

const CACHE_NAME = "wcl-v1";

// ── Install & activate ────────────────────────────────────────────────────

self.addEventListener("install", () => {
  // Skip waiting so the new SW activates immediately
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  // Take control of all open clients
  event.waitUntil(self.clients.claim());
});

// ── Push ──────────────────────────────────────────────────────────────────

self.addEventListener("push", (event) => {
  let data = {};
  try {
    data = event.data?.json() ?? {};
  } catch {
    data = { body: event.data?.text() ?? "New update" };
  }

  const title   = data.title   ?? "World Cup Live ⚽";
  const body    = data.body    ?? "Something happened!";
  const icon    = data.icon    ?? "/favicon.svg";
  const badge   = data.badge   ?? "/badge-72x72.png";
  const tag     = data.tag     ?? "wcl-default";
  const url     = data.url     ?? "/";
  const actions = data.actions ?? [];   // e.g. [{ action: 'view', title: 'View match' }]

  event.waitUntil(
    self.registration.showNotification(title, {
      body,
      icon,
      badge,
      tag,
      data: { url },
      actions,
      vibrate: [100, 50, 100],
      requireInteraction: data.requireInteraction ?? false,
    })
  );
});

// ── Notification click ────────────────────────────────────────────────────

self.addEventListener("notificationclick", (event) => {
  event.notification.close();

  const targetUrl = event.notification.data?.url ?? "/";

  event.waitUntil(
    self.clients
      .matchAll({ type: "window", includeUncontrolled: true })
      .then((clients) => {
        // Focus an existing open tab if one matches
        for (const client of clients) {
          if (client.url.includes(self.location.origin) && "focus" in client) {
            client.navigate(targetUrl);
            return client.focus();
          }
        }
        // Otherwise open a new tab
        if (self.clients.openWindow) {
          return self.clients.openWindow(targetUrl);
        }
      })
  );
});

// ── Push subscription change ──────────────────────────────────────────────
// Fired if the browser rotates the push subscription automatically.

self.addEventListener("pushsubscriptionchange", (event) => {
  event.waitUntil(
    self.registration.pushManager
      .subscribe({
        userVisibleOnly: true,
        applicationServerKey: self.__VAPID_PUBLIC_KEY__, // injected at build time or replaced at deploy
      })
      .then((subscription) => {
        // Re-POST to your API to update the stored endpoint
        return fetch("/api/push/resubscribe", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ subscription }),
        });
      })
  );
});