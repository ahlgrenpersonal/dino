import assert from 'node:assert/strict';
import { readFile, readdir } from 'node:fs/promises';
import { SkyGame, freshSave, readSave, BUILD, WORLD, LANDMARKS, HERO_FEET, roofSurface, ROOFS, eyePosition } from '../engine.js';
import { Renderer } from '../art.js';

const tick=(g,seconds=1,keys={})=>{for(let i=0;i<Math.ceil(seconds/.02);i++)g.update(.02,keys);};
const events=[];
const g=new SkyGame(freshSave(),e=>events.push(e));
assert.equal(g.enemies.length,6);
assert.equal(g.travel('roofs'),false,'Unrevealed map destinations cannot be selected');
g.moveTo(400,800);tick(g,1);assert.equal(g.player.y,WORLD.ground-HERO_FEET);assert(g.player.landed,'Ground taps snap feet to the street');
g.moveTo(170,530);tick(g,2);assert.equal(g.player.y,roofSurface(ROOFS[0])-HERO_FEET);assert(g.player.landed,'Roof taps land on the marked roof');
g.moveTo(600,220);tick(g,2);assert.equal(g.player.y,220);assert(!g.player.landed,'Sky taps take off and hover');
g.blast();const before=JSON.stringify(g.snapshot()),time=g.time,cd=g.blastCd;
g.paused=true;tick(g,3,{right:true});assert.equal(g.time,time);assert.equal(g.blastCd,cd);assert.equal(JSON.stringify(g.snapshot()),before,'Pause freezes simulation and progress');g.paused=false;

// Complete the campaign by actual map-guided movement, proximity sparks and deliberate attacks.
let seconds=0;
while(g.save.stage<3&&seconds<120){
  if(!g.target)g.travel(LANDMARKS[Math.min(2,g.save.stage)].id);
  if(g.nearest(650)){g.laser();g.blast();}
  tick(g,.1);seconds+=.1;
}
assert.equal(g.save.stage,3,'A fresh adventure completes using normal controls');
assert.equal(g.save.bossHits,4,'The giant loses all four panels');
assert.equal(events.filter(e=>e.type==='milestone').length,3);
assert(events.some(e=>e.type==='restore-ready'&&e.stage===0));
assert(events.some(e=>e.type==='restore-ready'&&e.stage===1));
const done=new SkyGame(g.snapshot());assert.equal(done.save.stage,3);assert.equal(done.enemies.length,0,'Restored city stays restored after reload');
assert(done.startReplay());assert.equal(done.enemies.length,8);
assert(!done.startReplay(),'Repeated replay request is refused');assert.equal(done.enemies.length,8);
for(let i=0;i<100;i++)done.startReplay();assert.equal(done.enemies.length,8,'Replay requests cannot stack enemies');
let rounds=0;
while(done.replay&&rounds<400){if(!done.target){const e=done.nearest(Infinity);if(e)done.moveTo(e.x,e.y);}done.blast();done.laser();tick(done,.1);rounds++;}
assert(!done.replay);assert.equal(done.save.stage,3,'Optional battle preserves the restored city');assert(done.startReplay(),'Another wave remains available after winning');

// A laser-to-sphere combo must work against the giant, including during its visual flash.
const titanGame=new SkyGame({...freshSave(),stage:2});const titan=titanGame.enemies.find(e=>e.type==='titan');
titanGame.player.x=titan.x-150;titanGame.player.y=titan.y;
titanGame.damage(titan,'laser');titanGame.blast();tick(titanGame,.5);
assert(titan.hp<=2,'Sphere after laser still damages the giant');
assert.equal(titanGame.save.bossHits,4-titan.hp);

// Partial saves keep defeated robots defeated and preserve a damaged giant.
const partial=new SkyGame({...freshSave(),stage:2,bossHits:2,cleared:['s2-0','s2-2']});
assert.equal(partial.enemies.find(e=>e.type==='titan').hp,2);
assert(!partial.enemies.some(e=>['s2-0','s2-2'].includes(e.id)));
const restoredPartial=new SkyGame(partial.snapshot());assert.equal(restoredPartial.enemies.length,partial.enemies.length);
for(const invalid of [null,{},[],{schema:1,stage:999,total:-1,position:{x:Infinity,y:NaN},cleared:[{},'secret','s0-1','s0-1']},{schema:1,stage:'bad',best:Infinity}]){
  const s=readSave(invalid);assert(s.stage>=0&&s.stage<=3);assert(Number.isFinite(s.position.x)&&Number.isFinite(s.position.y));assert(s.total>=0);assert(new Set(s.cleared).size===s.cleared.length);
}

const rings=new SkyGame({...freshSave(),stage:3});rings.ringFlight();
for(const r of rings.rings){rings.moveTo(r.x,r.y);tick(rings,4);}
assert.equal(rings.ringsTaken,8);assert(!rings.ringRun,'All eight rings can be collected without a timer');

// Container-only resizes must preserve aspect ratio and touch coordinate mapping.
let box={width:390,height:600};const canvas={width:300,height:150,getContext:()=>({}),getBoundingClientRect:()=>box};
const painter=new Renderer(canvas);
for(const [width,height,dpr] of [[390,600,3],[390,480,3],[320,370,2],[844,260,2],[1024,650,1.5],[390,600,2]]){
  box={width,height};globalThis.devicePixelRatio=dpr;painter.resize();painter.follow(g,0,true);
  assert.equal(canvas.width,Math.round(width*Math.min(2,dpr)));assert.equal(canvas.height,Math.round(height*Math.min(2,dpr)));
  const point={x:1234,y:432},screen=painter.worldToScreen(point.x,point.y),world=painter.screenToWorld(screen.x,screen.y);
  assert(Math.hypot(point.x-world.x,point.y-world.y)<1e-8);
  const eye=eyePosition({...g.player,vx:500,facing:1,landed:false});assert(Number.isFinite(eye.x)&&Number.isFinite(eye.y));
}

const folder=new URL('../',import.meta.url);
const version=JSON.parse(await readFile(new URL('version.json',folder),'utf8'));
assert.equal(version.build,BUILD);
for(const file of ['app.js','engine.js','art.js','index.html','manifest.webmanifest','sw.js']){
  const text=await readFile(new URL(file,folder),'utf8');assert(text.includes(BUILD),`${file} uses the release build`);
  const ids=[...text.matchAll(/world\d+/g)].map(m=>m[0]);assert(ids.every(x=>x===BUILD),`${file} contains no stale build ids`);
}
const sw=await readFile(new URL('sw.js',folder),'utf8');
const assets=[...sw.matchAll(/'([^']+\.(?:js|css|html|svg|png|webmanifest)(?:\?[^']*)?)'/g)].map(m=>m[1].split('?')[0]);
for(const asset of assets)await readFile(new URL(asset,folder));
const manifest=JSON.parse(await readFile(new URL('manifest.webmanifest',folder),'utf8'));assert.equal(manifest.scope,'./');assert.equal(manifest.display,'standalone');
for(const icon of manifest.icons)await readFile(new URL(icon.src,folder));
assert(!sw.includes('caches.keys().then(names=>Promise.all(names.map'),'Cache cleanup must stay isolated');
assert(!(await readdir(folder)).some(f=>/photo|screenshot|AGENTS|secret/i.test(f)));
console.log(`Passed campaign (${seconds.toFixed(1)}s scripted), three restorations, all powers, safe landings, pause, partial/reloaded saves, replay guards, ring route and isolated PWA release checks.`);
