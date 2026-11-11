import test from 'node:test';
import assert from 'node:assert/strict';
import {AREAS,FINAL_AREA,HOME,KEY_LOOP,LANDMARKS,PRIVATE_ZONES,freshSave,readSave,canWalk,isPrivate,pathfind,dist,visibleLandmarks} from '../world.js?v=world21';
import {MiamiAdventure} from '../engine.js?v=world21';
import {readFile} from 'node:fs/promises';
import {existsSync} from 'node:fs';

function arrive(g,p,dt=.05){g.moveTo(p);assert(g.route.length||dist(g.player,p)<1,`route to ${JSON.stringify(p)}`);for(let i=0;i<8000&&g.route.length;i++)g.update(dt);assert.equal(g.route.length,0,`arrived at ${JSON.stringify(p)}`);assert(dist(g.player,p)<1);}

test('every landmark can be reached by actual walking at each wheel speed',()=>{
 for(let wheels=0;wheels<=2;wheels++){const s=freshSave();s.unlocked=FINAL_AREA;s.wheels=wheels;const g=new MiamiAdventure(s);g.enemies=[];
  for(const l of LANDMARKS){assert(canWalk(s,l),`${l.id} on public land`);if(l.id!=='panorama')arrive(g,l);g.goHome();}
 }
});

test('Brickell Key has a blocked center and a continuous public circuit in both directions',()=>{
 const s=freshSave();assert(isPrivate({x:121,y:72}));assert(!canWalk(s,{x:121,y:72}));assert.equal(pathfind(s,AREAS[1].entry,{x:121,y:72}).length,0);
 for(const direction of [KEY_LOOP,[...KEY_LOOP].reverse()])for(const dt of [1/60,1/30,.05]){const g=new MiamiAdventure(freshSave());g.enemies=[];for(const p of direction)arrive(g,p,dt);assert(!isPrivate(g.player));}
 const route=pathfind(s,{x:114.5,y:70.5},{x:127,y:73});assert(route.length>18,'walking goes around residences');assert(route.every(p=>!isPrivate(p)));
});

test('keyboard steering cannot enter the residential center or walk on water',()=>{
 const g=new MiamiAdventure(freshSave());g.enemies=[];Object.assign(g.player,{x:114.5,y:70.5});for(let i=0;i<400;i++)g.update(.05,{x:1,y:0});assert(canWalk(g.save,g.player));assert(g.player.x<117);
 Object.assign(g.player,{x:101,y:90});for(let i=0;i<400;i++)g.update(.05,{x:1,y:0});assert(canWalk(g.save,g.player));assert(g.player.x<108);
});

test('invalid movement taps stop silently on water, private land and locked districts',()=>{
 for(const destination of [{x:145,y:75},{x:121,y:72},{x:95,y:40},{x:NaN,y:81},null]){
  const g=new MiamiAdventure(freshSave()),events=[];g.enemies=[];g.onEvent=e=>events.push(e);g.moveTo(AREAS[1].entry);assert(g.route.length);const start={x:g.player.x,y:g.player.y};g.tap(destination);assert.equal(g.route.length,0);assert.equal(g.target,null);assert.equal(g.powerTarget,null);for(let i=0;i<20;i++)g.update(.05);assert.deepEqual({x:g.player.x,y:g.player.y},start);assert(!events.some(e=>e.type==='toast'));
 }
});

test('water taps cannot select an enemy standing near the shoreline',()=>{
 const g=new MiamiAdventure(freshSave()),events=[];g.onEvent=e=>events.push(e);const enemy={id:'shore-bot',area:1,x:114.5,y:64.7,hp:100,maxHp:100};g.enemies=[enemy];assert(canWalk(g.save,enemy));const water={x:114.5,y:63.8};assert(!canWalk(g.save,water));assert(dist(enemy,water)<1.5);g.tap(water);assert.equal(g.target,null);assert.equal(g.powerTarget,null);assert.equal(g.route.length,0);assert.equal(g.tapCd,0);assert(!events.some(e=>e.type==='toast'||e.type==='attack'));
});

test('public fractional boundary positions can route home even when their grid center is private',()=>{
 for(const p of [{x:116.2,y:71},{x:116.3,y:71.4},{x:124.9,y:73.4}]){const g=new MiamiAdventure(freshSave());g.enemies=[];assert(canWalk(g.save,p));assert(isPrivate({x:Math.floor(p.x)+.5,y:Math.floor(p.y)+.5}));Object.assign(g.player,p);arrive(g,HOME);}
});

test('public perimeter taps are reachable even when their containing grid center is private',()=>{
 for(const p of [{x:116.2,y:71},{x:116.3,y:71.4},{x:124.9,y:73.4}]){const g=new MiamiAdventure(freshSave());g.enemies=[];arrive(g,p);assert(canWalk(g.save,g.player));assert(!isPrivate(g.player));}
});

test('all enemy spawns stay on public land and out of playground safe zones',()=>{
 const s=freshSave();s.unlocked=FINAL_AREA;const g=new MiamiAdventure(s);for(const e of g.enemies){assert(canWalk(s,e),e.id);assert(!isPrivate(e),e.id);assert(!g.isSafe(e),`${e.id} outside a playground`);}
});

test('City Centre gives wheels once, keeps the weapon and preserves its find across replay',()=>{
 const g=new MiamiAdventure(freshSave()),l=LANDMARKS.find(l=>l.id==='city-centre');Object.assign(g.player,l);g.update(.016);assert(g.save.owned.includes('grip'));assert.equal(g.save.build.wheels,'grip');assert.equal(g.save.weapon,'bumper');assert(!g.save.owned.includes('bubble'));const discoveries=[...g.save.discoveries];
 for(let i=0;i<20;i++)g.update(.05);assert.deepEqual(g.save.discoveries,discoveries);assert.equal(g.save.owned.filter(id=>id==='grip').length,1);
 const loaded=new MiamiAdventure(readSave(JSON.parse(JSON.stringify(g.snapshot()))));assert.equal(loaded.save.build.wheels,'grip');loaded.save.king=true;loaded.replay();assert(loaded.save.owned.includes('grip'));assert(loaded.save.discoveries.includes('city-centre'));
});

test('playgrounds give an immediate usable item once, without a currency or collection requirement',()=>{
 const g=new MiamiAdventure(freshSave()),park=LANDMARKS.find(l=>l.id==='hammock'),events=[];g.onEvent=e=>events.push(e);Object.assign(g.player,park);g.update(.016);assert.equal(g.save.scrap,0);assert(g.save.owned.includes('spark-cell'));assert.equal(g.save.build.gadget,'spark-cell');assert(g.save.equipmentClaims.includes(park.id));assert.equal(events.filter(e=>e.type==='findEquipment').length,1);g.power();assert.equal(g.powerCd,24);
 g.goHome();Object.assign(g.player,park);g.update(.016);assert.equal(events.filter(e=>e.type==='findEquipment').length,1);assert.equal(g.save.unlocked,1);assert.deepEqual(g.save.camps,[]);
});

test('playgrounds remain safe from both melee bumps and projectiles',()=>{
 const g=new MiamiAdventure(freshSave()),park=LANDMARKS.find(l=>l.id==='hammock');Object.assign(g.player,park,{invincible:0});const hp=g.player.hp;g.hurt(50);assert.equal(g.player.hp,hp);
 g.enemies=[{id:'synthetic-monster',area:0,x:park.x+.8,y:park.y,hp:100,maxHp:100,cd:0,home:park,angle:0}];g.projectiles=[{x:park.x,y:park.y,life:1,vx:0,vy:0,enemy:true,damage:99,weapon:'neon'}];g.update(.05);assert.equal(g.player.hp,hp);
});

test('private residences block automatic fire, chained beams and flying projectiles',()=>{
 const g=new MiamiAdventure(freshSave());Object.assign(g.player,{x:114.5,y:72});const target={id:'target',area:1,x:127,y:72,hp:300,maxHp:300,cd:100,home:{x:127,y:72},angle:0};g.enemies=[target];assert(!g.clearShot(g.player,target));g.save.weapon='prism';g.attack(target);assert.equal(target.hp,300);
 g.shoot(g.player,target,'firejet');for(let i=0;i<40;i++)g.update(.05);assert.equal(target.hp,300);assert.equal(g.projectiles.length,0);
});

test('rocket splash damages nearby monsters once and cannot hurt a sleeping boss',()=>{
 const g=new MiamiAdventure(freshSave());Object.assign(g.player,{x:115,y:66.5});const mob=(id,x,y)=>({id,area:1,x,y,hp:300,maxHp:300,cd:100,home:{x,y},angle:0});const a=mob('a',117,66.5),b=mob('b',117.7,66.5),boss={...mob('boss-1',118.2,66.5),boss:true};g.enemies=[a,b,boss];g.shoot(g.player,a,'metro');for(let i=0;i<4;i++)g.update(.05);assert(a.hp<300);assert(b.hp<300);assert.equal(boss.hp,300);assert(g.projectiles.every(q=>q.life>0));
});

test('Adventure Power lasts six seconds, recharges in 28 and pauses with play',()=>{
 const g=new MiamiAdventure(freshSave());g.power();assert.equal(g.powerTime,6);assert.equal(g.powerCd,28);g.shoot(g.player,{x:100,y:81},'starter');assert(Math.abs(g.projectiles[0].damage-9*.6*1.65)<1e-8);g.paused=true;g.update(.05);assert.equal(g.powerTime,6);g.paused=false;for(let i=0;i<125;i++)g.update(.05);g.shoot(g.player,{x:100,y:81},'starter');assert.equal(g.projectiles.at(-1).damage,9*.6);assert(!g.power());
});

test('upgrades spend exactly their price, refuse unavailable purchases and survive reload',()=>{
 const g=new MiamiAdventure(freshSave());assert(!g.upgrade('armor'));assert(!g.upgrade('invalid'));g.save.scrap=140;assert(g.upgrade('armor'));assert.equal(g.save.scrap,95);assert.equal(g.maxHp(),115);assert(g.upgrade('armor'));assert.equal(g.save.scrap,0);assert.equal(g.maxHp(),185);assert(!g.upgrade('armor'));assert(!g.equip('firejet'));g.award('neon');assert(g.equip('bumper'));assert.equal(readSave(g.snapshot()).armor,2);
});

test('legacy progress opens the new beach chapter and relocates saves off private land',()=>{
 const raw={...freshSave(),mapLayout:1,unlocked:6,queen:true,king:true,champion:true,owned:['starter','firejet'],weapon:'firejet',cleared:AREAS.slice(1,7).map(a=>`boss-${a.id}`),position:{x:121,y:72}};const s=readSave(raw);assert.equal(s.unlocked,FINAL_AREA);assert(!s.king);assert(s.champion);assert(s.owned.includes('firejet'));assert(canWalk(s,s.position));assert(!isPrivate(s.position));assert.equal(new MiamiAdventure(s).enemies.filter(e=>e.king).length,1);
 assert(readSave({schema:1}).gentle,'missing setting retains gentle default');
});

test('undiscovered landmark lists hide Miami Beach and every later chapter',()=>{
 const s=freshSave();assert(!visibleLandmarks(s).some(l=>l.area>1));s.unlocked=6;assert(!visibleLandmarks(s).some(l=>l.area===FINAL_AREA));s.unlocked=FINAL_AREA;assert(visibleLandmarks(s).some(l=>l.id==='south-pointe'));assert(!AREAS.slice(1).some(a=>a.camps.length!==3));
});

test('bad input and long frame gaps cannot corrupt movement or cross locked boundaries',()=>{
 const g=new MiamiAdventure(freshSave());g.enemies=[];for(const dt of [NaN,Infinity,-1,0])g.update(dt,{x:1,y:1});assert.deepEqual({x:g.player.x,y:g.player.y},HOME);g.update(100,{x:1,y:0});assert(dist(g.player,HOME)<.3);g.update(.05,{x:NaN,y:Infinity});assert(Number.isFinite(g.player.x));for(const end of [{x:NaN,y:0},{x:1e9,y:0},{x:104,y:16}])assert.equal(pathfind(g.save,g.player,end).length,0);
});

test('the app no longer loads any personal place override',async()=>{
 const app=await readFile(new URL('../app.js',import.meta.url),'utf8');assert(!app.includes('loadLocalLandmarks'));assert(!app.includes('local-landmarks.json'));assert(!existsSync(new URL('../local-landmarks.json',import.meta.url)));
});
