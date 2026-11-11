const CACHE_NAME='bot-miami-world97';
const ASSETS=["./","./index.html","./styles.css?v=world97","./layout.css?v=world97","./adventure-data.js?v=world97","./adventure-pantheon.js?v=world97","./adventure-saves.js?v=world97","./app.js?v=world97","./art.js?v=world97","./atlas-progress.js?v=world97","./atlas.js?v=world97","./boat-art.js?v=world97","./boats.js?v=world97","./content.js?v=world97","./data.js?v=world97","./engine.js?v=world97","./halloween-art.js?v=world97","./halloween.js?v=world97","./hold-confirm.js?v=world97","./mausoleum-art.js?v=world97","./miami-environment.js?v=world97","./miami-geography.js?v=world97","./miami-landmarks.js?v=world97","./miami-layout.js?v=world97","./pantheon-art.js?v=world97","./pantheon.js?v=world97","./patrols.js?v=world97","./power-control.js?v=world97","./quiet-ui.js?v=world97","./replay-colors.js?v=world97","./replay-variants.js?v=world97","./replay.js?v=world97","./royal-court.js?v=world97","./topology.js?v=world97","./manifest.webmanifest","./version.json","./refresh.html","./assets/adventure-theme.mp3","./assets/icon-192.png","./assets/icon-512.png","./assets/icon.svg","./assets/pantheon-preview.jpg","./assets/pantheon-staircase.jpg"];
self.addEventListener('install',event=>event.waitUntil(caches.open(CACHE_NAME).then(cache=>cache.addAll(ASSETS)).then(()=>self.skipWaiting())));
self.addEventListener('activate',event=>event.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(key=>key.startsWith('bot-miami-')&&key!==CACHE_NAME).map(key=>caches.delete(key)))).then(()=>self.clients.claim())));
self.addEventListener('fetch',event=>{
  const url=new URL(event.request.url);
  if(event.request.method!=='GET'||url.origin!==self.location.origin||!url.pathname.startsWith(new URL('./',self.location.href).pathname))return;
  if(url.pathname===new URL('./assets/adventure-theme.mp3',self.location.href).pathname&&event.request.headers?.get('range')){event.respondWith(audioRange(event.request));return;}
  if(url.pathname.endsWith('/version.json')){event.respondWith(fetch(event.request,{cache:'no-store'}));return;}
  if(event.request.mode==='navigate'){
    const base=new URL('./',self.location.href),isShell=url.pathname===base.pathname||url.pathname===new URL('./index.html',base).pathname;
    event.respondWith(fetch(event.request).then(async response=>{if(response.ok){const cache=await caches.open(CACHE_NAME);await cache.put(isShell?'./index.html':event.request,response.clone());}return response;}).catch(()=>caches.match(isShell?'./index.html':event.request)));return;
  }
  event.respondWith(caches.match(event.request).then(cached=>cached||fetch(event.request).then(async response=>{if(response.ok){const cache=await caches.open(CACHE_NAME);cache.put(event.request,response.clone());}return response;})));
});
async function audioRange(request){
  const cached=await caches.match(request.url);if(!cached)return fetch(request);
  const bytes=await cached.arrayBuffer(),length=bytes.byteLength;
  const match=/^bytes=(\d*)-(\d*)$/.exec(request.headers.get('range'));
  if(!match||(!match[1]&&!match[2]))return fetch(request);
  const start=match[1]?Number(match[1]):Math.max(0,length-Number(match[2]));
  const end=match[1]&&match[2]?Math.min(length-1,Number(match[2])):length-1;
  if(!Number.isSafeInteger(start)||!Number.isSafeInteger(end)||start>end||start>=length)return new Response(null,{status:416,headers:{'Content-Range':`bytes */${length}`}});
  return new Response(bytes.slice(start,end+1),{status:206,headers:{'Content-Type':'audio/mpeg','Accept-Ranges':'bytes','Content-Range':`bytes ${start}-${end}/${length}`,'Content-Length':String(end-start+1)}});
}
