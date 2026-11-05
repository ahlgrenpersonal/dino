import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import vm from 'node:vm';
import {BUILD} from '../levels.js';
const SKY_CACHE=`skyspark-${BUILD}`;
import path from 'node:path';

// Execute the actual workers against one shared-origin Cache Storage model.
// Optional argument: a clean release checkout containing the parent worker.
const release=process.argv[2];
const store=new Map(),deleted=[];
const cacheApi={
  keys:async()=>[...store.keys()],
  delete:async key=>{deleted.push(key);return store.delete(key);},
  open:async name=>{
    if(!store.has(name))store.set(name,new Map());const entries=store.get(name);
    return {addAll:async()=>{},put:async(key,value)=>entries.set(String(key),await value.text()),match:async key=>entries.has(String(key))?new Response(entries.get(String(key))):undefined};
  },
  match:async key=>{for(const entries of store.values())if(entries.has(String(key)))return new Response(entries.get(String(key)));}
};
function worker(source,url){
  const events={},self={location:new URL(url),addEventListener:(n,f)=>events[n]=f,skipWaiting:async()=>{},clients:{claim:async()=>{}}};
  vm.runInNewContext(source,{self,caches:cacheApi,URL,fetch:async req=>new Response(`network:${typeof req==='string'?req:req.url}`)});
  return {
    async fire(name,request){
      const waits=[];let response;events[name]({request,waitUntil:p=>waits.push(p),respondWith:p=>{response=p;}});
      const value=response?await response:undefined;await Promise.all(waits);return value;
    }
  };
}
const sky=worker(await readFile(new URL('../sw.js',import.meta.url),'utf8'),'https://example.invalid/dino/skyspark/sw.js');
store.set('dino-world91',new Map([['index.html','Dino']]));store.set('bot-adventure-world89',new Map());store.set('skyspark-old',new Map());store.set(SKY_CACHE,new Map());
await sky.fire('activate');assert(deleted.includes('skyspark-old'));assert(store.has('dino-world91'));assert(store.has('bot-adventure-world89'));
const nav={url:'https://example.invalid/dino/skyspark/index.html',method:'GET',mode:'navigate'};
assert(await sky.fire('fetch',nav));assert(store.get(SKY_CACHE).get('index.html').includes('skyspark'));
assert.equal(await sky.fire('fetch',{...nav,url:'https://example.invalid/dino/'}),undefined);
assert.equal(store.get('dino-world91').get('index.html'),'Dino');
if(release){
  const parent=worker(await readFile(path.join(release,'sw.js'),'utf8'),'https://example.invalid/dino/sw.js');
  store.set('dino-v37',new Map([['./index.html','old cached shell']]));
  await parent.fire('activate');assert(!store.has('dino-v37'));assert(store.has(SKY_CACHE));assert(store.has('bot-adventure-world89'));
  assert.equal(await parent.fire('fetch',nav),undefined,'Parent worker must ignore a first SkySpark navigation');
  assert.equal(await parent.fire('fetch',{...nav,url:'https://example.invalid/dino/bot-adventure/index.html'}),undefined,'Parent ignores other nested games too');
  assert(await parent.fire('fetch',{...nav,url:'https://example.invalid/dino/index.html'}));
  assert(!store.get('dino-world91').get('./index.html').includes('skyspark'),'Parent cached homepage remains Dino');
}
console.log(`Passed shared-cache preservation, scope boundaries, navigation caching${release?', parent first-visit isolation and parent cache cleanup':''}.`);
