import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile,readdir} from 'node:fs/promises';
import vm from 'node:vm';
import {BUILD,freshSave} from '../world.js?v=world25';
import {MiamiPainter} from '../painter.js?v=world25';
import {MiamiAdventure} from '../engine.js?v=world25';
const read=name=>readFile(new URL('../'+name,import.meta.url),'utf8');

test('build references, install icons, local module files and save namespaces agree',async()=>{
 const index=await read('index.html'),app=await read('app.js'),sw=await read('sw.js'),manifest=JSON.parse(await read('manifest.webmanifest')),version=JSON.parse(await read('version.json'));
 assert.equal(version.build,BUILD);assert(index.includes(`app.js?v=${BUILD}`));assert(index.includes(`styles.css?v=${BUILD}`));assert(app.includes(`const buildVersion='${BUILD}'`));assert(sw.includes(`battlebot-miami-${BUILD}`));assert(manifest.start_url.includes(BUILD));assert.equal(manifest.scope,'./');assert(index.includes('apple-touch-icon'));assert(manifest.icons.some(i=>i.sizes==='512x512'));
 for(const name of await readdir(new URL('../',import.meta.url))){if(!name.endsWith('.js'))continue;for(const match of (await read(name)).matchAll(/from ['"]\.\/([^'"?]+)(?:\?v=([^'"]+))?['"]/g)){await read(match[1]);assert.equal(match[2],BUILD);}}
 assert(app.includes("battlebot-miami-save-v1"));assert(!app.includes("bot-adventure-save-v1"));assert(app.includes('if(r.scope===scope)'));assert(sw.includes("k.startsWith('battlebot-miami-')"));
});

test('container-only size changes preserve square pixels, pointer mapping and zero-size safety',()=>{
 globalThis.devicePixelRatio=2;globalThis.matchMedia=()=>({matches:false});let width=390,height=550;
 const context=new Proxy({}, {get:(o,k)=>k==='createLinearGradient'?()=>({addColorStop(){}}):()=>{}});
 const canvas={width:1,height:1,getContext:()=>context,getBoundingClientRect:()=>({width,height})};
 const painter=new MiamiPainter(canvas),g=new MiamiAdventure(freshSave());
 for(const size of [[390,550],[390,420],[844,220],[1200,700],[0,0],[390,550]]){[width,height]=size;painter.draw(g,.016);assert(Number.isFinite(painter.scale));assert(painter.scale>0);assert.equal(canvas.width,Math.round(width*2));assert.equal(canvas.height,Math.round(height*2));if(width){const p=painter.worldPoint(width/2,height*.51);assert.deepEqual(p,painter.camera);}}
});

test('service worker removes only Miami caches and uses network-first navigation',async()=>{
 const listeners={},deleted=[],claimed=[];const context={URL,self:{location:{href:'https://example.test/battlebot_miami/sw.js'},addEventListener:(name,fn)=>listeners[name]=fn,clients:{claim:()=>claimed.push(true)}},caches:{keys:async()=>['battlebot-miami-world0',`battlebot-miami-${BUILD}`,'bot-adventure-world94','another-app'],delete:async k=>deleted.push(k)}};
 vm.runInNewContext(await read('sw.js'),context);let work;listeners.activate({waitUntil:p=>work=p});await work;assert.deepEqual(deleted,['battlebot-miami-world0']);assert.equal(claimed.length,1);
 let response;context.fetch=async()=>({ok:true,clone:()=>({})});context.caches.open=async()=>({put:async()=>{}});listeners.fetch({request:{method:'GET',url:'https://example.test/battlebot_miami/',mode:'navigate'},respondWith:p=>response=p});assert((await response).ok);
 let foreign=false;listeners.fetch({request:{method:'GET',url:'https://example.test/bot-adventure/app.js'},respondWith:()=>foreign=true});assert.equal(foreign,false);
});

test('new-version checks reload once, preserve saves and clear only their own app scope',async()=>{
 const app=await read('app.js'),fn=app.slice(app.indexOf('async function checkVersion'),app.indexOf("if('serviceWorker'in navigator)"));
 const removed=[],deleted=[],redirects=[];let persists=0;
 const context={URL,URLSearchParams,Date,buildVersion:BUILD,fetch:async()=>({ok:true,json:async()=>({build:'world999'})}),persist:()=>persists++,location:{href:'https://example.test/battlebot_miami/index.html',search:'',replace:url=>redirects.push(url)},navigator:{serviceWorker:{getRegistrations:async()=>[{scope:'https://example.test/',unregister:async()=>removed.push('root')},{scope:'https://example.test/battlebot_miami/',unregister:async()=>removed.push('miami')},{scope:'https://example.test/bot-adventure/',unregister:async()=>removed.push('adventure')}]}},caches:{keys:async()=>[`battlebot-miami-${BUILD}`,'bot-adventure-world94'],delete:async key=>deleted.push(key)}};
 vm.runInNewContext(fn+';this.check=checkVersion;',context);await context.check();assert.equal(persists,1);assert.deepEqual(removed,['miami']);assert.deepEqual(deleted,[`battlebot-miami-${BUILD}`]);assert.equal(redirects.length,1);assert(redirects[0].includes('update=world999'));
 context.location.search='?'+redirects[0].split('?')[1];await context.check();assert.equal(redirects.length,1,'stale app cannot enter a reload loop');
});
