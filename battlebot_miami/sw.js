const CACHE_NAME='battlebot-miami-world17';
const ROOT=new URL('./',self.location.href);
const ASSETS=['./','index.html','styles.css?v=world17','adventure.css?v=world17','adventure-layout.css?v=world17','app.js?v=world17','world.js?v=world17','engine.js?v=world17','painter.js?v=world17','bot-art.js?v=world17','miami-weapon-art.js?v=world17','costumes.js?v=world17','landmark-art.js?v=world17','ui-art.js?v=world17','wildlife-art.js?v=world17','equipment.js?v=world17','workshop.js?v=world17','audio.js?v=world17','power-control.js?v=world17','atlas.js?v=world17','world-input.js?v=world17','assets/miami-theme.mp3','icon.svg','icon-192.png','icon-512.png','manifest.webmanifest','version.json'];
const PUBLIC_ASSETS=new Set(ASSETS.map(asset=>new URL(asset,ROOT).href));
const NAVIGATIONS=new Set([ROOT.pathname,new URL('index.html',ROOT).pathname]);
self.addEventListener('install',e=>{e.waitUntil(caches.open(CACHE_NAME).then(c=>c.addAll(ASSETS)).then(()=>self.skipWaiting()));});
self.addEventListener('activate',e=>e.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(k=>k.startsWith('battlebot-miami-')&&k!==CACHE_NAME).map(k=>caches.delete(k)))).then(()=>self.clients.claim())));
self.addEventListener('fetch',e=>{if(e.request.method!=='GET')return;const u=new URL(e.request.url);if(u.origin!==ROOT.origin||!u.pathname.startsWith(ROOT.pathname))return;if(u.pathname.endsWith('/local-landmarks.json'))return;if(u.pathname.endsWith('/version.json')){e.respondWith(fetch(e.request,{cache:'no-store'}));return;}
 if(u.href===new URL('assets/miami-theme.mp3',ROOT).href&&e.request.headers?.get('range')){e.respondWith(audioRange(e.request));return;}
 if(e.request.mode==='navigate'&&NAVIGATIONS.has(u.pathname)){e.respondWith(fetch(e.request).then(async r=>{if(r.ok){const c=await caches.open(CACHE_NAME);await c.put(new URL('index.html',ROOT),r.clone());}return r;}).catch(async()=>{const c=await caches.open(CACHE_NAME);return c.match(new URL('index.html',ROOT));}));return;}
 if(!PUBLIC_ASSETS.has(u.href))return;
 e.respondWith(caches.open(CACHE_NAME).then(async cache=>(await cache.match(e.request))||fetch(e.request).then(async r=>{if(r.ok)await cache.put(e.request,r.clone());return r;})));
});
// Standard Adventure byte-range playback, restricted to this game's own cache.
async function audioRange(request){
 const cache=await caches.open(CACHE_NAME),cached=await cache.match(request.url);if(!cached)return fetch(request);
 const bytes=await cached.arrayBuffer(),length=bytes.byteLength,match=/^bytes=(\d*)-(\d*)$/.exec(request.headers.get('range'));
 if(!match||(!match[1]&&!match[2]))return fetch(request);
 const start=match[1]?Number(match[1]):Math.max(0,length-Number(match[2])),end=match[1]&&match[2]?Math.min(length-1,Number(match[2])):length-1;
 if(!Number.isSafeInteger(start)||!Number.isSafeInteger(end)||start>end||start>=length)return new Response(null,{status:416,headers:{'Content-Range':`bytes */${length}`}});
 return new Response(bytes.slice(start,end+1),{status:206,headers:{'Content-Type':'audio/mpeg','Accept-Ranges':'bytes','Content-Range':`bytes ${start}-${end}/${length}`,'Content-Length':String(end-start+1)}});
}
