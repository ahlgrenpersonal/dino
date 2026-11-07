import assert from 'node:assert/strict';
import {readFile,readdir} from 'node:fs/promises';
import {SkyGame,freshSave,readSave,BUILD,WORLD,SITE_COUNT,BOSS_X,LEVELS,HERO_FEET,roofSurface,eyePosition,hitShapes,unlockedLevel} from '../engine.js';
import {Renderer} from '../art.js';
import {loadProgress} from '../saves.js';
const tick=(g,seconds=1,keys={})=>{for(let i=0;i<Math.ceil(seconds/.02);i++)g.update(.02,keys);};
function at(level,checkpoint=0){const save=freshSave();save.completed=Array.from({length:level},(_,i)=>i);save.level=level;save.runs[level].checkpoint=checkpoint;save.runs[level].position={x:checkpoint===SITE_COUNT?BOSS_X-220:290,y:690};return new SkyGame(save);}
const g=new SkyGame(freshSave());assert.equal(WORLD.width,9600);assert.equal(SITE_COUNT,18);assert.equal(BOSS_X,WORLD.width-380);assert(g.enemies.length>=32);assert(!g.selectLevel(1),'Plains unlocks only after the city boss');
g.enemies=[];g.syncEncounters=()=>{};g.moveTo(50,830);tick(g,1);assert.equal(g.player.y,WORLD.ground-HERO_FEET);assert(g.player.landed);
g.moveTo(170,530);tick(g,2);assert.equal(g.player.y,roofSurface(g.roofs[0])-HERO_FEET);assert(g.player.landed);
g.moveTo(600,220);tick(g,2);assert.equal(g.player.y,220);assert(!g.player.landed);
g.blast();g.paused=true;const before=JSON.stringify(g.snapshot()),time=g.time,cd=g.blastCd;tick(g,3,{right:true});assert.equal(g.time,time);assert.equal(g.blastCd,cd);assert.equal(JSON.stringify(g.snapshot()),before);g.paused=false;
// Regression for the actual failure: free flight right, leaving every earlier squad alive.
for(let level=0;level<LEVELS.length;level++){
 const bypass=at(level),seen=new Set();bypass.player.y=105;
 for(let x=0;x<3300;x++){bypass.update(.02,{right:true});for(const e of bypass.enemies)seen.add(e.id);}
 assert(bypass.player.x>BOSS_X-300);
 assert(bypass.enemies.some(e=>e.boss),`${LEVELS[level].name}: boss appears without clearing previous sections or touching a star`);
 assert(seen.size>=LEVELS[level].squad*SITE_COUNT*LEVELS[level].waves,'Flying right reveals the whole army');
 assert(bypass.run.cleared.length<LEVELS[level].squad*SITE_COUNT*LEVELS[level].waves*.2,'The test deliberately leaves most earlier robots alive despite incidental flight impacts');
 assert(bypass.enemies.length<200,'Only nearby sections stay active on mobile');
 const back=new SkyGame(bypass.snapshot());tick(back,20,{left:true});assert(back.enemies.some(e=>!e.boss),'Unbeaten enemies remain when flying back left');
}
const campaign=new SkyGame(freshSave()),events=[];campaign.onEvent=e=>events.push(e);const timings=[],counts=[];
for(let level=0;level<LEVELS.length;level++){
 if(level)assert(campaign.selectLevel(level));let seconds=0;
 while(!campaign.run.complete&&seconds<300){
  const p=campaign.player,bounds={left:p.x-310,right:p.x+310,top:0,bottom:1000};
  campaign.sparks(bounds);campaign.laser(bounds);campaign.blast();campaign.update(.02,{right:p.x<BOSS_X-300},bounds);seconds+=.02;
 }
 assert(campaign.run.complete,`${LEVELS[level].name} completes by flying right and using weapons, without guide travel`);
 assert(campaign.run.kills>=50,`${LEVELS[level].name} has at least 50 defeats during the actual forward flight`);
 assert.equal(campaign.run.bossHits,LEVELS[level].bossHp);assert(campaign.save.completed.includes(level));
 timings.push(Math.round(seconds));counts.push(campaign.run.kills);
}
assert.equal(unlockedLevel(campaign.save),LEVELS.length-1);
const completed=new SkyGame(campaign.snapshot());assert(completed.run.complete);assert.equal(completed.enemies.length,0,'Crash reload does not replay a finished level');
assert.equal(completed.save.runs.length,LEVELS.length,'Every world has a durable independent run slot');
const lastRun=JSON.stringify(completed.save.runs[LEVELS.length-1]);assert(completed.selectLevel(0));assert(!completed.run.complete);assert.equal(completed.run.checkpoint,0);assert(completed.enemies.length>0,'Returning to a finished level immediately starts fresh');
const reloaded=new SkyGame(completed.snapshot());assert.equal(reloaded.run.checkpoint,0);assert(!reloaded.run.complete);assert.equal(JSON.stringify(reloaded.save.runs[LEVELS.length-1]),lastRun,'Replaying one level preserves the other levels');
const firstEnemy=reloaded.enemies[0];reloaded.damage(firstEnemy,'laser');const currentId=firstEnemy.id;const cityCount=reloaded.enemies.filter(e=>e.hp>0).length;
assert(reloaded.selectLevel(1));assert(!reloaded.run.complete,'Selecting completed Plains starts fresh too');reloaded.moveTo(910,310);tick(reloaded,3);const plainPosition={x:reloaded.player.x,y:reloaded.player.y};
assert(reloaded.selectLevel(0));assert(!reloaded.enemies.some(e=>e.id===currentId));assert.equal(reloaded.enemies.filter(e=>e.hp>0).length,cityCount);
assert(reloaded.selectLevel(1));assert.equal(reloaded.player.x,plainPosition.x);assert.equal(reloaded.player.y,plainPosition.y,'An unfinished run resumes rather than restarting');
const locked=new SkyGame(freshSave());assert(!locked.selectLevel(2));assert(!locked.selectLevel(-1));assert(!locked.selectLevel(1.5));
for(let i=0;i<LEVELS.length;i++){
  const bossGame=at(i,SITE_COUNT),boss=bossGame.enemies.find(e=>e.boss);assert.equal(boss.type,LEVELS[i].bossType);
  bossGame.player.x=boss.x-150;bossGame.player.y=boss.y;bossGame.damage(boss,'laser');bossGame.blast();tick(bossGame,.5);assert(boss.hp<=boss.maxHp-2,'Laser plus sphere both damage each boss');
  const saved=bossGame.snapshot(),copy=new SkyGame(saved);assert.equal(copy.enemies.find(e=>e.boss).hp,boss.hp,'Boss damage survives reload');
  const bx=boss.x,by=boss.y;tick(bossGame,2);if(i===2)assert(Math.hypot(boss.x-bx,boss.y-by)>40,'Stormwing visibly flies');
}
const oldDone=readSave({schema:1,stage:3,total:23,best:7,sound:false});assert.equal(oldDone.schema,7);assert.deepEqual(oldDone.completed,[0]);assert(oldDone.runs[0].complete);assert.equal(oldDone.runs[0].bossHits,24);assert.equal(unlockedLevel(oldDone),1);assert.equal(oldDone.total,23);assert.equal(oldDone.sound,false);
const quotaSave=loadProgress(()=>({getItem:key=>key==='save'?JSON.stringify({schema:1,stage:3,total:23,sound:false}):null,setItem(){throw Error('Quota exceeded');}}),'save');assert.deepEqual(quotaSave.completed,[0]);assert.equal(quotaSave.total,23);assert.equal(quotaSave.sound,false,'Failure to write a backup preserves the readable old save');
const oldPartial=readSave({schema:1,stage:2,total:18,bossHits:2,cleared:['s2-0','s2-3'],position:{x:2600,y:650}});assert.equal(oldPartial.runs[0].checkpoint,12);assert.equal(oldPartial.runs[0].bossHits,12);assert(oldPartial.runs[0].cleared.includes('city-12-0-3'));
for(const raw of [null,{},[],{schema:2,level:9,runs:[{checkpoint:Infinity,cleared:[null,'bad'],position:{x:NaN,y:Infinity}}]},{schema:1,stage:'bad',best:Infinity}]){const save=readSave(raw);assert(save.level>=0&&save.level<3);assert(save.total>=0);for(const run of save.runs)assert(Number.isFinite(run.position.x)&&Number.isFinite(run.position.y));}
const ringGame=new SkyGame(campaign.snapshot());assert(ringGame.ringFlight());for(const ring of ringGame.rings){ringGame.moveTo(ring.x,ring.y);tick(ringGame,Math.hypot(ringGame.player.x-ring.x,ringGame.player.y-ring.y)/500+1);assert(ring.taken,'Each ring remains reachable without a roof snapping the target');}assert.equal(ringGame.ringsTaken,12);assert(!ringGame.ringRun);
for(const [level,shapeIndex,direction,label] of [[1,0,1,'excavator wheel'],[2,8,-1,'right wing tip'],[2,5,1,'left wing tip']]){
  const g=at(level,SITE_COUNT),e=g.enemies.find(e=>e.boss);g.enemies=[e];const [sx,sy,r]=hitShapes(e,g.time)[shapeIndex],cx=e.x+sx,cy=e.y+sy,clearance=r+29;
  g.player.x=cx-direction*clearance;g.player.y=cy;assert(hitShapes(e,g.time).every(([x,y,radius])=>Math.hypot(g.player.x-e.x-x,g.player.y-e.y-y)>=radius+25),'Ram fixture begins beyond every boss hit shape');
  const hp=e.hp;tick(g,.02,{right:direction>0,left:direction<0});assert.equal(e.hp,hp-1,`A forward entry hits the ${label} once`);
}
let bounds={width:390,height:600};const canvas={width:300,height:150,getContext:()=>({}),getBoundingClientRect:()=>bounds};const painter=new Renderer(canvas);
for(const [width,height,dpr] of [[390,600,3],[390,480,3],[320,370,2],[844,260,2],[1024,650,1.5]]){bounds={width,height};globalThis.devicePixelRatio=dpr;painter.resize();painter.follow(g,0,true);assert.equal(canvas.width,Math.round(width*Math.min(dpr,2)));const p={x:8500,y:432},q=painter.worldToScreen(p.x,p.y),r=painter.screenToWorld(q.x,q.y);assert(Math.hypot(p.x-r.x,p.y-r.y)<1e-8);assert(Number.isFinite(eyePosition(g.player).x));}
// Exercise every biome and boss drawing through a finite-coordinate canvas mock.
const gradient={addColorStop(){}};const context=new Proxy({}, {get:(_,name)=>name==='createLinearGradient'||name==='createRadialGradient'?()=>gradient:(...args)=>{for(const n of args)if(typeof n==='number')assert(Number.isFinite(n),`${String(name)} received a non-finite coordinate`);}});
const mockCanvas=()=>({width:390,height:600,getContext:()=>context,getBoundingClientRect:()=>({width:390,height:600})});globalThis.document={createElement:()=>mockCanvas()};
for(let i=0;i<LEVELS.length;i++)for(const checkpoint of [0,2,8,SITE_COUNT]){const scene=at(i,checkpoint),canvas=mockCanvas(),r=new Renderer(canvas);scene.player.x=checkpoint===SITE_COUNT?BOSS_X-220:scene.site.x;scene.player.y=500;for(const enemy of scene.enemies)enemy.cd=0;scene.update(.02);scene.sparks();scene.laser();scene.update(.02);r.follow(scene,0,true);r.draw(scene,.02);}
// A schema-2 save stranded at the far right must recover its boss immediately.
const strandedSave={schema:2,level:0,total:31,runs:[{checkpoint:2,wave:1,cleared:['city-2-1-0'],position:{x:WORLD.width-90,y:650}}]};
const recovered=new SkyGame(strandedSave);assert(recovered.enemies.some(e=>e.boss));assert(recovered.run.cleared.includes('city-2-1-0'));assert(recovered.run.cleared.includes('city-1-0-0'));assert(recovered.run.cleared.includes('city-2-0-0'));
const savedProgress=recovered.snapshot(),roundTrip=new SkyGame(savedProgress);assert.deepEqual(roundTrip.run.cleared,recovered.run.cleared);
const html=await readFile(new URL('../index.html',import.meta.url),'utf8');assert(!html.includes('id="mission"'));assert(!html.includes('id="go"'));assert(!html.includes('id="flightStatus"'));assert.equal(typeof g.travel,'undefined');
const folder=new URL('../',import.meta.url),version=JSON.parse(await readFile(new URL('version.json',folder),'utf8'));assert.equal(version.build,BUILD);
for(const file of ['app.js','engine.js','levels.js','saves.js','art.js','index.html','manifest.webmanifest','sw.js']){const text=await readFile(new URL(file,folder),'utf8');assert(text.includes(BUILD),`${file} uses the release build`);assert([...text.matchAll(/world\d+/g)].every(m=>m[0]===BUILD),`${file} has no stale build references`);}
const sw=await readFile(new URL('sw.js',folder),'utf8');for(const match of sw.matchAll(/'([^']+\.(?:js|css|html|svg|png|webmanifest)(?:\?[^']*)?)'/g))await readFile(new URL(match[1].split('?')[0],folder));assert(sw.includes(`levels.js?v=${BUILD}`));
const manifest=JSON.parse(await readFile(new URL('manifest.webmanifest',folder),'utf8'));assert.equal(manifest.scope,'./');for(const icon of manifest.icons)await readFile(new URL(icon.src,folder));assert(!(await readdir(folder)).some(f=>/photo|screenshot|AGENTS/i.test(f)));
console.log(`Passed ${LEVELS.length} full levels (${timings.join('/')} seconds scripted, not human playtime), ${counts.join('/')} robots per level, spatial encounters, bypassed enemies, bosses, migration, crash reload, automatic replay, partial per-level saves, rings, viewport mapping, all biome drawing and PWA assets.`);
