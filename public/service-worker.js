/* Service Worker de Trueque de Favores
   Se encarga de recibir notificaciones push (con la app cerrada) y mostrarlas,
   lo que hace que Android/desktop pongan el numerito sobre el icono, igual que WhatsApp. */

self.addEventListener("install", () => {
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(self.clients.claim());
});

// Se recibe la notificación push enviada desde el backend
self.addEventListener("push", (event) => {
  let datos = {};
  try {
    datos = event.data ? event.data.json() : {};
  } catch (err) {
    datos = { title: "Trueque de Favores", body: event.data ? event.data.text() : "Tienes una novedad" };
  }

  const titulo = datos.title || "Trueque de Favores";
  const opciones = {
    body: datos.body || "Tienes una red de trueque nueva",
    icon: "/logo192.png",
    badge: "/logo192.png",
    data: { url: datos.url || "/" }
  };

  event.waitUntil(self.registration.showNotification(titulo, opciones));
});

// Al tocar la notificación, se abre (o enfoca) la app
self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  const url = event.notification.data?.url || "/";
  event.waitUntil(
    self.clients.matchAll({ type: "window", includeUncontrolled: true }).then((clientList) => {
      for (const client of clientList) {
        if (client.url.includes(self.location.origin) && "focus" in client) {
          return client.focus();
        }
      }
      if (self.clients.openWindow) {
        return self.clients.openWindow(url);
      }
    })
  );
});