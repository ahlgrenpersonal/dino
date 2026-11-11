const CACHE_NAME='battlebot-miami-world10';
const ROOT=new URL('./',self.location.href);
const ASSETS=['./','index.html','styles.css?v=world10','app.js?v=world10','world.js?v=world10','engine.js?v=world10','painter.js?v=world10','bot-art.js?v=world10','costumes.js?v=world10','landmark-art.js?v=world10','ui-art.js?v=world10','wildlife-art.js?v=world10','icon.svg','icon-192.png','icon-512.png','manifest.webmanifest','version.json'];
const PUBLIC_ASSETS=new Set(ASSETS.map(asset=>new URL(asset,ROOT).href));
const NAVIGATIONS=new Set([ROOT.pathname,new URL('index.html',ROOT).pathname]);
self.addEventListener('install',e=>{e.waitUntil(caches.open(CACHE_NAME).then(c=>c.addAll(ASSETS)).then(()=>self.skipWaiting()));});
self.addEventListener('activate',e=>e.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(k=>k.startsWith('battlebot-miami-')&&k!==CACHE_NAME).map(k=>caches.delete(k)))).then(()=>self.clients.claim())));
self.addEventListener('fetch',e=>{if(e.request.method!=='GET')return;const u=new URL(e.request.url);if(u.origin!==ROOT.origin||!u.pathname.startsWith(ROOT.pathname))return;if(u.pathname.endsWith('/local-landmarks.json'))return;if(u.pathname.endsWith('/version.json')){e.respondWith(fetch(e.request,{cache:'no-store'}));return;}
 if(e.request.mode==='navigate'&&NAVIGATIONS.has(u.pathname)){e.respondWith(fetch(e.request).then(async r=>{if(r.ok){const c=await caches.open(CACHE_NAME);await c.put(new URL('index.html',ROOT),r.clone());}return r;}).catch(async()=>{const c=await caches.open(CACHE_NAME);return c.match(new URL('index.html',ROOT));}));return;}
 if(!PUBLIC_ASSETS.has(u.href))return;
 e.respondWith(caches.open(CACHE_NAME).then(async cache=>(await cache.match(e.request))||fetch(e.request).then(async r=>{if(r.ok)await cache.put(e.request,r.clone());return r;})));
});
