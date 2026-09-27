// Service worker de ManosCerca: recibe notificaciones push y abre su enlace al tocarlas.
// El payload lo envía la Edge Function `send-push`: { title, body, link, tag }.

self.addEventListener("install", () => self.skipWaiting());
self.addEventListener("activate", (event) => event.waitUntil(self.clients.claim()));

self.addEventListener("push", (event) => {
  let data = {};
  try {
    data = event.data ? event.data.json() : {};
  } catch {
    data = { title: event.data?.text() };
  }

  event.waitUntil(
    self.registration.showNotification(data.title || "ManosCerca", {
      body: data.body || undefined,
      icon: "/icons/icon-192.png",
      badge: "/icons/badge-96.png",
      tag: data.tag,
      data: { link: data.link || "/notificaciones" },
    }),
  );
});

self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  const url = new URL(event.notification.data?.link || "/notificaciones", self.location.origin);

  event.waitUntil(
    (async () => {
      const windows = await self.clients.matchAll({ type: "window", includeUncontrolled: true });
      // Reutiliza una pestaña abierta de la app si la hay.
      const client = windows.find((w) => new URL(w.url).origin === url.origin);
      if (client) {
        await client.focus();
        return client.navigate(url.href);
      }
      return self.clients.openWindow(url.href);
    })(),
  );
});
