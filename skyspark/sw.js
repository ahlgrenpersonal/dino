const CACHE_NAME='skyspark-world107';
const SHELL=['./','index.html','styles.css?v=world107','app.js?v=world107','engine.js?v=world107','levels.js?v=world107','saves.js?v=world107','world-menu.js?v=world107','art.js?v=world107','audio.js?v=world107','manifest.webmanifest','icon.svg','icon-192.png','icon-512.png'];
self.addEventListener('install',event=>{event.waitUntil(caches.open(CACHE_NAME).then(cache=>cache.addAll(SHELL)).then(()=>self.skipWaiting()));});
self.addEventListener('activate',event=>{event.waitUntil(caches.keys().then(names=>Promise.all(names.filter(n=>n.startsWith('skyspark-')&&n!==CACHE_NAME).map(n=>caches.delete(n)))).then(()=>self.clients.claim()));});
self.addEventListener('fetch',event=>{
  const url=new URL(event.request.url);
  if(url.origin!==self.location.origin||!url.pathname.startsWith(new URL('./',self.location).pathname)||event.request.method!=='GET')return;
  if(url.pathname.endsWith('/version.json')){event.respondWith(fetch(event.request,{cache:'no-store'}));return;}
  if(event.request.mode==='navigate'){
    event.respondWith(fetch(event.request).then(response=>{if(response.ok){const copy=response.clone();event.waitUntil(caches.open(CACHE_NAME).then(cache=>cache.put('index.html',copy)));}return response;}).catch(()=>caches.match('index.html')));return;
  }
  event.respondWith(caches.match(event.request).then(cached=>cached||fetch(event.request)));
});
