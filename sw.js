// Schülerbuch – speichert nur den Programmcode für die Offline-Nutzung. Keine Schülerdaten.
// Holt immer zuerst die neueste Version aus dem Netz. Antwortet das Netz nicht innerhalb
// von 1,5 Sekunden, startet die App sofort aus dem Speicher und aktualisiert im Hintergrund.
const CACHE = "schuelerbuch-v4";
const FILES = ["./", "./index.html", "./manifest.webmanifest", "./icon-180.png", "./icon-192.png", "./icon-512.png", "./jspdf.umd.min.js"];
self.addEventListener("install", e => { e.waitUntil(caches.open(CACHE).then(c => c.addAll(FILES))); self.skipWaiting(); });
self.addEventListener("activate", e => { e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k !== CACHE).map(k => caches.delete(k))))); self.clients.claim(); });
self.addEventListener("fetch", e => {
  if (e.request.method !== "GET" || new URL(e.request.url).origin !== location.origin) return;
  const net = fetch(e.request.url, { cache: "no-cache", credentials: "same-origin" })
    .then(r => { if (r.ok) { const copy = r.clone(); caches.open(CACHE).then(c => c.put(e.request, copy)); } return r; });
  e.waitUntil(net.catch(() => {}));
  const fallback = () => caches.match(e.request).then(r => r || caches.match("./index.html"));
  const slow = new Promise(res => setTimeout(res, 1500)).then(fallback);
  e.respondWith(new Promise(resolve => {
    let done = false;
    net.then(r => { if (!done) { done = true; resolve(r); } }).catch(() => fallback().then(r => { if (!done) { done = true; resolve(r); } }));
    slow.then(r => { if (r && !done) { done = true; resolve(r); } });
  }));
});
