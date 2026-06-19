const CACHE = 'sabrflow-v2';
const STATIC_ASSETS = [
  '/',
  '/dashboard',
  '/analytics',
  '/settings',
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE).then((cache) => cache.addAll(STATIC_ASSETS))
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k)))
    )
  );
  self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);

  // Only handle same-origin requests — skip external URLs (images, fonts, etc.)
  if (url.origin !== self.location.origin) return;

  const { pathname } = url;
  // Never cache API responses
  if (pathname.startsWith('/api/')) return;
  // Never cache Next.js internal routes
  if (pathname.startsWith('/_next/')) return;

  event.respondWith(
    caches.match(event.request).then((cached) => cached || fetch(event.request).then((res) => {
      const clone = res.clone();
      caches.open(CACHE).then((cache) => cache.put(event.request, clone));
      return res;
    }))
  );
});

self.addEventListener('push', (event) => {
  let data = { title: 'SabrFlow', body: '', icon: '/icon-192.png' };
  try {
    const payload = event.data?.json();
    if (payload) {
      data = { ...data, ...payload };
    }
  } catch {
    data.body = event.data?.text() || data.body;
  }

  const options = {
    body: data.body,
    icon: data.icon || '/icon-192.png',
    badge: '/icon-192.png',
    actions: [
      { action: 'view', title: 'View task' },
      { action: 'dismiss', title: 'Dismiss' },
    ],
    tag: 'sabrflow-reminder',
    renotify: true,
  };

  event.waitUntil(self.registration.showNotification(data.title, options));
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();

  if (event.action === 'dismiss') return;

  const urlToOpen = '/dashboard';

  event.waitUntil(
    self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clients) => {
      for (const client of clients) {
        if (client.url.includes(urlToOpen) && 'focus' in client) {
          return client.focus();
        }
      }
      return self.clients.openWindow(urlToOpen);
    })
  );
});
