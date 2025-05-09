self.addEventListener("install", (event) => {
  console.log("Service Worker Installed");
});

self.addEventListener("fetch", (event) => {
  console.log("Fetching:", event.request.url);
});

self.addEventListener('push', (event) => {
  const data = event.data.json();
  const options = {
    body: data.body,
    icon: '/JaraFiblue.png',
    badge: '/badge.png',
  };

  event.waitUntil(
    self.registration.showNotification(data.title, options)
  );
});