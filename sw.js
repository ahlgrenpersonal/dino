const CACHE_NAME = "dino-world91";
const ASSETS = [
  "./", "./index.html", "./styles.css?v=world91", "./app.js?v=world91",
  "./version.json", "./manifest.webmanifest", "./assets/icon.svg",
  "./assets/icon-192.png", "./assets/icon-512.png"
];
const INDEX_FALLBACK = "./index.html";
const APP_ROOT = new URL("./", self.location.href);
const isDinoCache = (name) => /^dino-(?:v|world)\d+$/.test(name);
self.addEventListener("install", (event) => {
  event.waitUntil(caches.open(CACHE_NAME).then((cache) => cache.addAll(ASSETS)).then(() => self.skipWaiting()));
});
self.addEventListener("activate", (event) => {
  event.waitUntil(caches.keys().then((names) => Promise.all(
    names.filter((name) => isDinoCache(name) && name !== CACHE_NAME).map((name) => caches.delete(name))
  )).then(() => self.clients.claim()));
});
self.addEventListener("message", (event) => {
  if (event.data && event.data.type === "SKIP_WAITING") self.skipWaiting();
});
self.addEventListener("fetch", (event) => {
  const url = new URL(event.request.url);
  if (event.request.method !== "GET" || url.origin !== APP_ROOT.origin || !url.pathname.startsWith(APP_ROOT.pathname)) return;
  const relative = url.pathname.slice(APP_ROOT.pathname.length);
  // Nested games own their requests, workers and offline shells.
  if (relative.includes("/") && !relative.startsWith("assets/")) return;
  if (event.request.mode === "navigate") {
    // Helpers and other documents must never replace the game's cached homepage.
    if (relative !== "" && relative !== "index.html") return;
    event.respondWith(fetch(event.request).then((response) => {
      if (response.ok) {
        const home = response.clone(), index = response.clone();
        event.waitUntil(caches.open(CACHE_NAME).then((cache) => Promise.all([
          cache.put("./", home), cache.put(INDEX_FALLBACK, index)
        ])));
      }
      return response;
    }).catch(() => caches.match(INDEX_FALLBACK).then((match) => match || caches.match("./"))));
    return;
  }
  event.respondWith(fetch(event.request).then((response) => {
    if (response.ok) {
      const copy = response.clone();
      event.waitUntil(caches.open(CACHE_NAME).then((cache) => cache.put(event.request, copy)));
    }
    return response;
  }).catch(() => caches.match(event.request)));
});
