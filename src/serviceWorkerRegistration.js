// Registra el service worker para que la PWA pueda recibir notificaciones push
// incluso con la app cerrada.

export function register() {
  if ("serviceWorker" in navigator) {
    window.addEventListener("load", () => {
      navigator.serviceWorker
        .register("/service-worker.js")
        .then((registration) => {
          console.log("Service worker registrado:", registration.scope);
        })
        .catch((error) => {
          console.error("Error registrando el service worker:", error);
        });
    });
  }
}

export function unregister() {
  if ("serviceWorker" in navigator) {
    navigator.serviceWorker.ready.then((registration) => {
      registration.unregister();
    });
  }
}