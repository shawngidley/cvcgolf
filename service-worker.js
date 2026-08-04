const CACHE_NAME = 'cvc-golf-v6';
const ASSETS_TO_CACHE = [
  '/',
  '/index.html',
  '/standings.html',
  '/lineup.html',
  '/history.html',
  '/usage.html',
  '/schedule.html',
  '/salaries.html',
  '/rules.html',
  '/admin.html',
  '/account.html',
  '/money.html',
  '/playoffs.html',
  '/live.html',
  '/breakdown.html',
  '/weekly-results.html',
  '/css/styles.css',
  '/js/supabase-client.js',
  '/js/auth.js',
  '/js/login.js',
  '/js/standings.js',
  '/js/lineup.js',
  '/js/history.js',
  '/js/usage.js',
  '/js/schedule.js',
  '/js/salaries.js',
  '/js/admin.js',
  '/js/account.js',
  '/js/money.js',
  '/js/playoffs.js',
  '/js/live.js',
  '/js/breakdown.js',
  '/js/weekly-results.js',
  '/js/weekly-bonus-config.js',
  '/CVC_Golf_Logo.png',
  '/amen-corner.avif',
  '/manifest.json'
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(ASSETS_TO_CACHE))
  );
  self.skipWaiting();
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k)))
    )
  );
  self.clients.claim();
});

self.addEventListener('fetch', event => {
  // Network first for API calls, cache first for assets
  if (event.request.url.includes('supabase.co') ||
      event.request.url.includes('netlify') ||
      event.request.url.includes('espn.com')) {
    // Always go to network for API calls
    event.respondWith(fetch(event.request).catch(() => caches.match(event.request)));
  } else {
    // Cache first for static assets
    event.respondWith(
      caches.match(event.request).then(cached => cached || fetch(event.request))
    );
  }
});
