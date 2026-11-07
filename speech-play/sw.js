const BUILD = 'world17';
const BASE = new URL('./', self.location.href);
const PREFIX = `speech-play:${BASE.pathname}:`;
const CACHE = `${PREFIX}${BUILD}`;
const SHELL = [
  './', './index.html', './styles.css?v=world17', './app.js?v=world17',
  './bubbles.js?v=world17', './core.js?v=world17', './art.js?v=world17', './audio.js?v=world17', './updates.js?v=world17',
  './manifest.webmanifest', './assets/icon.svg', './assets/icon-192.png', './assets/icon-512.png',
  ...['duck-quack','puppet-ma','puppy-woof','ball-go','hello-wave'].flatMap(clip => [`./assets/video/${clip}.mp4`, `./assets/video/${clip}.jpg`]),
  ...['moo', 'baa', 'woof', 'pop', 'more', 'ready-set', 'go', 'beep', 'boo', 'hi', 'ball', 'up', 'down', 'mama', 'dada', 'ma', 'ba', 'oh'].map(word => `./assets/audio/${word}.wav`)
].map(file => new URL(file, BASE).href);
const ALLOWED = new Set(SHELL);
const DOCUMENT = new URL('./index.html', BASE).href;

self.addEventListener('install', event => {
  // Media keeps stable filenames; a new build must bypass older HTTP-cache copies.
  event.waitUntil(caches.open(CACHE).then(cache => cache.addAll(SHELL.map(url => new Request(url, { cache: 'reload' })))));
});
self.addEventListener('activate', event => {
  event.waitUntil((async () => {
    const names = await caches.keys();
    await Promise.all(names.filter(name => name.startsWith(PREFIX) && name !== CACHE).map(name => caches.delete(name)));
    await self.clients.claim();
  })());
});
self.addEventListener('message', event => { if (event.data?.type === 'ACTIVATE') self.skipWaiting(); });
self.addEventListener('fetch', event => {
  const { request } = event;
  const url = new URL(request.url);
  if (request.method !== 'GET' || url.origin !== BASE.origin || !url.pathname.startsWith(BASE.pathname)) return;
  // Optional media, receipts, tools, and other PWAs never enter the shell cache.
  if (request.mode === 'navigate' && (url.pathname === BASE.pathname || url.pathname === new URL(DOCUMENT).pathname)) {
    event.respondWith((async () => {
      const cache = await caches.open(CACHE);
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 4000);
      try {
        const response = await fetch(request, { signal: controller.signal });
        if (!response.ok) throw new Error('Navigation unavailable');
        // Update installation owns the shell snapshot. Never mix newer HTML into an older shell.
        return response;
      } catch { return await cache.match(DOCUMENT) || Response.error(); }
      finally { clearTimeout(timeout); }
    })());
    return;
  }
  if (!ALLOWED.has(url.href)) return;
  event.respondWith((async () => {
    const cache = await caches.open(CACHE);
    const response = await cache.match(request);
    if (!response) return fetch(request);
    const range = request.headers.get('range');
    // Safari probes and seeks into complete cached audio/video with byte ranges.
    if (range && /\.(?:wav|mp4)$/.test(url.pathname)) {
      const bytes = await response.arrayBuffer();
      const match = /^bytes=(\d*)-(\d*)$/.exec(range);
      const start = match?.[1] ? Number(match[1]) : Math.max(0, bytes.byteLength - Number(match?.[2]));
      const end = match?.[1] ? (match[2] ? Math.min(Number(match[2]), bytes.byteLength - 1) : bytes.byteLength - 1) : bytes.byteLength - 1;
      if (!match || (!match[1] && !match[2]) || !Number.isSafeInteger(start) || !Number.isSafeInteger(end) || start < 0 || start > end || start >= bytes.byteLength) return new Response(null, { status: 416, headers: { 'Content-Range': `bytes */${bytes.byteLength}` } });
      return new Response(bytes.slice(start, end + 1), { status: 206, headers: { 'Content-Type': url.pathname.endsWith('.mp4') ? 'video/mp4' : 'audio/wav', 'Accept-Ranges': 'bytes', 'Content-Range': `bytes ${start}-${end}/${bytes.byteLength}`, 'Content-Length': String(end - start + 1) } });
    }
    return response;
  })());
});
