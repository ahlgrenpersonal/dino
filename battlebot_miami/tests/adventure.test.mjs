import test from 'node:test';
import assert from 'node:assert/strict';
import {AREAS,HOME,BRIDGES,WEAPONS,freshSave,readSave,regionAt,canWalk,pathfind,visibleAreas,dist,FINAL_AREA,chapterForRegion,weaponFor} from '../world.js?v=world17';
import {MiamiAdventure} from '../engine.js?v=world17';

test('all missions are reachable as each district unlocks, future land stays locked',()=>{
 const s=freshSave();assert.deepEqual(visibleAreas(s).map(a=>a.id),[0,1]);
 for(let r=1;r<=FINAL_AREA;r++){
  s.unlocked=r;const a=AREAS[r];
  for(const p of [a.entry,...a.camps,a.arena]){assert.equal(chapterForRegion(regionAt(p)),r,`${a.name} owns objective`);const route=pathfind(s,HOME,p);assert(route.length,`${a.name} reachable`);assert(route.every(p=>canWalk(s,p)));}
  for(const locked of AREAS.filter(a=>a.id>r)){assert(!canWalk(s,locked.arena));assert.equal(pathfind(s,HOME,locked.arena).length,0);}
 }
 assert.equal(regionAt(HOME),0);assert(AREAS[5].entry.y<HOME.y);assert(AREAS[6].entry.y<AREAS[5].entry.y);assert(AREAS[2].entry.x<HOME.x);assert(AREAS[1].entry.x>HOME.x);
 assert(BRIDGES.some(b=>b.name==='Bear Cut Bridge'));
});

test('full campaign can be played with ordinary movement, auto attacks and Power',()=>{
 const g=new MiamiAdventure(freshSave());const events=[];g.onEvent=e=>events.push(e.type);let rescues=0;g.onEvent=e=>{events.push(e.type);if(e.type==='rescue')rescues++;};
 function playUntil(done,destination){g.goNext();for(let tick=0;tick<22000&&!done();tick++){
   if(!g.route.length&&g.isHome())g.goNext();
   if(g.powerCd===0)g.power();if(g.tapCd===0){const boss=g.enemies.find(e=>e.boss&&e.hp>0&&g.awake(e));if(boss&&dist(g.player,boss)<weaponFor(g.save.weapon).range)g.tap(boss);}g.update(.05);
  }assert(done(),`completed objective at ${JSON.stringify(destination)}`);}
 assert(g.enemies.some(e=>e.area===0),'Brickell has easy enemies outside home');
 for(const a of AREAS.slice(1)){
  const boss=g.enemies.find(e=>e.id===`boss-${a.id}`);assert(boss);assert(!g.awake(boss));const original=boss.hp;g.hit(boss,9999);assert.equal(boss.hp,original,'locked bosses ignore damage');
  for(let i=0;i<3;i++)playUntil(()=>g.save.camps.includes(`camp-${a.id}-${i}`),a.camps[i]);
  assert(g.awake(boss));playUntil(()=>g.save.cleared.includes(`boss-${a.id}`),a.arena);
  assert(g.save.owned.includes(a.reward));assert.equal(g.save.weapon,a.reward);assert(g.save.unlocked>=Math.min(FINAL_AREA,a.id+1));
  g.goHome();
 }
 assert(g.save.king,'the Miami Beach boss is the King');
 assert(g.save.champion);assert.equal(g.save.weapon,'firejet');assert(AREAS.slice(1).every(a=>g.save.owned.includes(a.reward)));assert(!g.save.owned.includes('bubble'),'landmarks do not award extra weapons');assert.equal(g.save.camps.length,21);assert(events.includes('victory'));assert(rescues<12,'gentle mode remains forgiving');
 const saved=readSave(JSON.parse(JSON.stringify(g.snapshot())));assert.equal(saved.weapon,'firejet');assert(saved.king);assert.equal(new MiamiAdventure(saved).enemies.filter(e=>e.hp>0).length,0);
 const owned=[...g.save.owned],scrap=g.save.scrap;g.save.armor=2;g.save.wheels=2;assert(g.replay());assert.equal(g.save.cycle,2);assert.equal(g.save.scrap,scrap);assert.deepEqual(g.save.owned,owned);assert.equal(g.save.armor,2);assert.equal(g.save.wheels,2);assert.equal(g.save.weapon,'firejet');assert.equal(g.save.camps.length,0);assert.equal(visibleAreas(g.save).length,8);assert(g.enemies.some(e=>e.king&&!g.awake(e)));assert(!g.replay(),'cannot skip a round');
 // All beach camps can be cleared early after victory, but the King stays locked.
 for(const e of [...g.enemies].filter(e=>e.area===FINAL_AREA&&!e.boss))g.hit(e,10000);
 for(const e of [...g.enemies].filter(e=>e.area===6&&!e.boss))g.hit(e,10000);
 g.hit(g.enemies.find(e=>e.id==='boss-6'),10000,{powered:true,targeted:true});const nextKing=g.enemies.find(e=>e.king);assert(nextKing);assert(!g.awake(nextKing));
 for(const r of [5,3,1,4,2]){for(const e of [...g.enemies].filter(e=>(e.chapter??e.area)===r&&!e.boss))g.hit(e,10000);g.hit(g.enemies.find(e=>e.id===`boss-${r}`),10000);}
 assert(g.awake(nextKing),'every other boss unlocks King on replay');g.hit(nextKing,10000,{powered:true,targeted:true});assert(g.save.king);assert(g.replay());assert.equal(g.save.cycle,3);
});

test('one mission press reaches a displaced boss with the short-range hammer',()=>{
 const s=freshSave();s.unlocked=3;s.cleared=['boss-1','boss-2'];s.camps=[0,1,2].map(i=>`camp-3-${i}`);s.owned.push('drum');s.weapon='drum';s.position={...AREAS[3].arena};const g=new MiamiAdventure(s),boss=g.enemies.find(e=>e.id==='boss-3');boss.y-=3.9;
 g.goNext();for(let tick=0;tick<600&&boss.hp>0;tick++)g.update(.05);
 assert(boss.hp<=0,'the mission helper closes the hammer range without another movement tap');assert(g.save.cleared.includes('boss-3'));assert.equal(g.save.weapon,'vine');
});

test('pause freezes walking, monster damage, projectiles, effects and cooldowns',()=>{
 const g=new MiamiAdventure(freshSave());g.moveTo(AREAS[1].entry);g.power();g.projectiles.push({x:94,y:81,life:2,vx:3,vy:0});g.effects.push({life:.5});g.paused=true;const before=JSON.stringify({p:g.player,time:g.time,q:g.projectiles,f:g.effects,cd:g.powerCd});for(let i=0;i<100;i++)g.update(.05,{x:1,y:1});g.power();assert.equal(JSON.stringify({p:g.player,time:g.time,q:g.projectiles,f:g.effects,cd:g.powerCd}),before);
});

test('upgraded wheels arrive at route nodes without oscillation',()=>{
 const save=freshSave();save.wheels=2;save.position={x:94.1,y:81.5};const g=new MiamiAdventure(save);g.enemies=[];g.moveTo({x:95.5,y:81.5});for(let i=0;i<500;i++)g.update(.05);assert.equal(g.route.length,0);assert(dist(g.player,{x:95.5,y:81.5})<.15);
});

test('rescue and home preserve equipment, scrap, camps and bridge travel saves',()=>{
 const s=freshSave();s.unlocked=4;s.position={x:108,y:103};s.scrap=51;s.camps=['camp-1-0'];s.owned.push('neon');s.weapon='neon';const loaded=readSave(s);assert.deepEqual(loaded.position,s.position);const g=new MiamiAdventure(loaded);g.player.invincible=0;g.hurt(10000);assert.deepEqual({x:g.player.x,y:g.player.y},HOME);assert.equal(g.player.hp,g.maxHp());assert.equal(g.save.scrap,51);assert.deepEqual(g.save.camps,['camp-1-0']);assert(g.save.owned.includes('neon'));
});

test('malformed saves fall back to safe values and never load other games',()=>{
 assert.deepEqual(readSave(null),freshSave());const s=readSave({schema:1,unlocked:100,position:{x:999,y:999},owned:['invalid'],weapon:'invalid',armor:-3,wheels:Infinity,hp:NaN,camps:'bad',color:'<script>'});assert.equal(s.unlocked,FINAL_AREA);assert.deepEqual(s.position,HOME);assert.equal(s.weapon,'bumper');assert.equal(s.armor,0);assert.equal(s.wheels,0);assert.equal(s.hp,70);assert.deepEqual(s.camps,[]);
});
