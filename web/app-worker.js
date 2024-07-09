// -----------------------------------------------------------------------------
// PWA
// -----------------------------------------------------------------------------
const cacheName = "app-" + "228b5b530c4c3c68ccc1e150fb8961c3cef1a9b1";
const resourcesToCache = ["/kidandcat/escama/web","/kidandcat/escama/web/app.css","/kidandcat/escama/web/app.js","/kidandcat/escama/web/manifest.webmanifest","/kidandcat/escama/web/wasm_exec.js","/kidandcat/escama/web/web/app.wasm","https://raw.githubusercontent.com/maxence-charriere/go-app/master/docs/web/icon.png"];

self.addEventListener("install", (event) => {
  console.log("installing app worker 228b5b530c4c3c68ccc1e150fb8961c3cef1a9b1");
  event.waitUntil(installWorker());
});

async function installWorker() {
  const cache = await caches.open(cacheName);
  await cache.addAll(resourcesToCache);
  await self.skipWaiting(); // Use this new service worker
}

self.addEventListener("activate", (event) => {
  event.waitUntil(deletePreviousCaches());
  console.log("app worker 228b5b530c4c3c68ccc1e150fb8961c3cef1a9b1 is activated");
});

async function deletePreviousCaches() {
  keys = await caches.keys();
  keys.forEach(async (key) => {
    if (key != cacheName) {
      console.log("deleting", key, "cache");
      await caches.delete(key);
    }
  });
}

self.addEventListener("fetch", (event) => {
  event.respondWith(fetchWithCache(event.request));
});

async function fetchWithCache(request) {
  cachedResponse = await caches.match(request);
  if (cachedResponse) {
    return cachedResponse;
  }
  return fetch(request);
}

// -----------------------------------------------------------------------------
// Push Notifications
// -----------------------------------------------------------------------------
self.addEventListener("push", (event) => {
  if (!event.data || !event.data.text()) {
    return;
  }

  const notification = JSON.parse(event.data.text());
  if (!notification) {
    return;
  }

  const title = notification.title;
  delete notification.title;

  if (!notification.data) {
    notification.data = {};
  }
  let actions = [];
  for (let i in notification.actions) {
    const action = notification.actions[i];

    actions.push({
      action: action.action,
      path: action.path,
    });

    delete action.path;
  }
  notification.data.goapp = {
    path: notification.path,
    actions: actions,
  };
  delete notification.path;

  event.waitUntil(self.registration.showNotification(title, notification));
});

self.addEventListener("notificationclick", (event) => {
  event.notification.close();

  const notification = event.notification;
  let path = notification.data.goapp.path;

  for (let i in notification.data.goapp.actions) {
    const action = notification.data.goapp.actions[i];
    if (action.action === event.action) {
      path = action.path;
      break;
    }
  }

  event.waitUntil(
    clients
      .matchAll({
        type: "window",
      })
      .then((clientList) => {
        for (var i = 0; i < clientList.length; i++) {
          let client = clientList[i];
          if ("focus" in client) {
            client.focus();
            client.postMessage({
              goapp: {
                type: "notification",
                path: path,
              },
            });
            return;
          }
        }

        if (clients.openWindow) {
          return clients.openWindow(path);
        }
      })
  );
});
