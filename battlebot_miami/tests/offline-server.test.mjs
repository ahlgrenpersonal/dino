import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import vm from 'node:vm';
import {createPreviewServer} from '../tools/serve.mjs';
import {BUILD} from '../world.js?v=world16';

test('offline navigation returns the Miami shell from its own cache',async()=>{
 const listeners={},keys=[],shell={body:'cached game'};const context={URL,self:{location:{href:'https://example.test/miami/sw.js'},addEventListener:(n,fn)=>listeners[n]=fn},fetch:async()=>{throw Error('offline');},caches:{open:async key=>{keys.push(key);return {match:async url=>{assert.equal(url.pathname,'/miami/index.html');return shell;}};}}};vm.runInNewContext(await readFile(new URL('../sw.js',import.meta.url),'utf8'),context);let result;listeners.fetch({request:{method:'GET',url:'https://example.test/miami/index.html?fresh=1',mode:'navigate'},respondWith:p=>result=p});assert.equal(await result,shell);assert.deepEqual(keys,[`battlebot-miami-${BUILD}`]);
});

test('service worker never intercepts local configuration, test files or unlisted encoded paths',async()=>{
 const listeners={},assets=[];const context={URL,self:{location:{href:'https://example.test/miami/sw.js'},skipWaiting:async()=>{},addEventListener:(n,fn)=>listeners[n]=fn},caches:{open:async()=>({addAll:async rows=>assets.push(...rows)})}};vm.runInNewContext(await readFile(new URL('../sw.js',import.meta.url),'utf8'),context);let installing;listeners.install({waitUntil:p=>installing=p});await installing;assert(!assets.some(x=>x.includes('local-landmarks.json')));
 for(const rel of ['local-landmarks.json','local-landmarks%2Ejson','tests/adventure.test.mjs','unknown.json']){let touched=false;listeners.fetch({request:{method:'GET',url:'https://example.test/miami/'+rel,mode:'navigate'},respondWith:()=>touched=true});assert(!touched,rel);}
 for(const rel of assets){const file=rel==='./'?'index.html':rel.split('?')[0];await readFile(new URL('../'+file,import.meta.url));}
 assert((await readFile(new URL('../.gitignore',import.meta.url),'utf8')).includes('/local-landmarks.json'));
});

test('loopback preview serves the game, headers and install assets without exposing parent files',async()=>{
 const server=createPreviewServer();await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));const base=`http://127.0.0.1:${server.address().port}`;
 try{const page=await fetch(base);assert.equal(page.status,200);assert((await page.text()).includes('<title>Battle Bot Miami</title>'));for(const rel of ['/world.js','/landmark-art.js','/icon-192.png','/manifest.webmanifest'])assert.equal((await fetch(base+rel)).status,200);const head=await fetch(base+'/index.html',{method:'HEAD'});assert.equal(await head.text(),'');assert.equal((await fetch(base+'/%2e%2e%2fAGENTS.md')).status,403);assert.equal((await fetch(base+'/missing')).status,404);assert.equal((await fetch(base,{method:'POST'})).status,405);
 }finally{await new Promise(resolve=>server.close(resolve));}
});
