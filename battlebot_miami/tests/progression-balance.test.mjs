import test from 'node:test';
import assert from 'node:assert/strict';
import {freshSave,readSave,visibleEquipment,visibleChapters,nextChapter,EQUIPMENT,AREAS,LANDMARKS,HOME,HOME_SAFE_RADIUS,dist,canWalk} from '../world.js?v=world18';
import {MiamiAdventure} from '../engine.js?v=world18';
import {workshopHTML} from '../workshop.js?v=world18';

test('new games have exactly one weapon, no weapon shop, and no unaffordable choices',()=>{
 const s=freshSave(),g=new MiamiAdventure(s);assert.deepEqual(visibleEquipment(s,'weapon').map(p=>p.id),['bumper']);
 s.scrap=99999;s.gears=999;assert.deepEqual(visibleEquipment(s,'weapon').map(p=>p.id),['bumper']);assert(!g.craft('weapon','blaster'));
 for(const type of ['armor','wheels','gadget']){s.scrap=0;s.gears=0;assert(visibleEquipment(s,type).every(p=>s.owned.includes(p.id)));s.scrap=30;s.gears=3;assert(visibleEquipment(s,type).every(p=>s.owned.includes(p.id)||(p.cost<=30&&p.gears<=3)));}
 const html=workshopHTML(s,'weapon',true,()=>'<header></header>');assert(!html.includes('data-part="blaster"'));assert(!html.includes('class="lock-icon"'));assert(!html.includes('unaffordable'));
});

test('each boss grants exactly its own weapon and no future weapons appear',()=>{
 const g=new MiamiAdventure(freshSave());
 for(const a of AREAS.slice(1)){
  const before=visibleEquipment(g.save,'weapon').map(p=>p.id);assert(!before.includes(a.reward));
  for(const e of [...g.enemies].filter(e=>(e.chapter??e.area)===a.id&&!e.boss))g.hit(e,10000);
  const boss=g.enemies.find(e=>e.id===`boss-${a.id}`);g.hit(boss,10000,{targeted:true,powered:true});
  const after=visibleEquipment(g.save,'weapon').map(p=>p.id);assert.deepEqual(after.filter(id=>!before.includes(id)),[a.reward]);assert.equal(g.save.weapon,a.reward);
 }
 assert.equal(visibleEquipment(g.save,'weapon').length,8);
});

test('old free starter alternatives collapse to one while earned weapons and landmark finds survive',()=>{
 const raw={...freshSave(),progressionVersion:undefined,owned:['starter','bumper','neon','blaster'],weapon:'starter',discoveries:['city-centre'],cleared:['boss-1'],unlocked:2};
 const s=readSave(raw);assert(s.owned.includes('starter'));assert(!s.owned.includes('bumper'));assert(s.owned.includes('neon'));assert(s.owned.includes('blaster'));assert(!s.owned.includes('grip'));assert.equal(s.weapon,'starter');assert.equal(s.progressionVersion,2);assert.deepEqual(readSave(s).owned,s.owned);
 for(const weapon of [undefined,'invalid']){const partial=readSave({schema:1,owned:['starter'],weapon});assert(partial.owned.includes(partial.weapon));assert(visibleEquipment(partial,'weapon').some(p=>p.id===partial.weapon));}
});

test('landmark equipment is permanent, never awards a weapon, and never downgrades a better shell',()=>{
 const g=new MiamiAdventure(freshSave());g.save.unlocked=7;g.enemies=[];const initialWeapons=visibleEquipment(g.save,'weapon').map(p=>p.id);
 for(const l of LANDMARKS.filter(l=>l.equipment)){Object.assign(g.player,l);g.update(.05);assert(g.save.owned.includes(l.equipment.id));assert.equal(g.save.weapon,'bumper');}
 assert.deepEqual(visibleEquipment(g.save,'weapon').map(p=>p.id),initialWeapons);assert.equal(g.save.build.armor,'star');
 const before=[...g.save.owned];g.save.king=true;g.replay();assert.deepEqual(g.save.owned,before);
});

test('Brickell and its Key share one opening chapter with mainland enemies and a protected home radius',()=>{
 const g=new MiamiAdventure(freshSave());assert.deepEqual(visibleChapters(g.save).map(a=>a.id),[1]);assert.equal(nextChapter(g.save).id,1);assert(g.enemies.some(e=>e.area===0&&e.chapter===1));
 assert(g.enemies.every(e=>dist(e,HOME)>HOME_SAFE_RADIUS));Object.assign(g.player,HOME,{invincible:0});g.hurt(9999);assert.equal(g.player.hp,g.maxHp());
 for(const e of [...g.enemies].filter(e=>e.chapter===1&&!e.boss))g.hit(e,9999);assert.equal(g.campsIn(1),3);assert(g.awake(g.enemies.find(e=>e.id==='boss-1')));
});

test('replays keep every unlocked chapter and advance yellow guidance in campaign order',()=>{
 const s=freshSave();s.king=s.champion=true;s.unlocked=7;s.cleared=AREAS.slice(1).map(a=>`boss-${a.id}`);const g=new MiamiAdventure(s);assert.equal(nextChapter(s),null);g.replay();assert.equal(visibleChapters(s).length,7);assert.equal(nextChapter(s).id,1);
 for(let r=1;r<=7;r++){assert.equal(nextChapter(s).id,r);s.cleared.push(`boss-${r}`);}assert.equal(nextChapter(s),null);
});

function royal(area,weapon){const s=freshSave();s.unlocked=area;s.cleared=AREAS.slice(1,area).map(a=>`boss-${a.id}`);s.camps=[0,1,2].map(i=>`camp-${area}-${i}`);s.weapon=weapon;s.build.weapon=weapon;s.build.armor='heavy';s.build.gadget='shield';s.owned.push(weapon,'heavy','shield');s.position={x:AREAS[area].arena.x-2.5,y:AREAS[area].arena.y};const g=new MiamiAdventure(s);g.enemies=g.enemies.filter(e=>e.id===`boss-${area}`);return g;}

test('royal shields resist passive weapons, helper fire and unpowered taps',()=>{
 for(const area of [6,7]){const g=royal(area,'firejet'),b=g.enemies[0];for(let i=0;i<200;i++)g.hit(b,9999);assert.equal(b.hp,b.maxHp*.25);g.attack(b,true);for(let i=0;i<30;i++)g.update(.05);assert(!b.guardBroken);assert(b.hp>=b.maxHp*.25);assert(!g.save.cleared.includes(b.id));}
});

test('a real powered targeted projectile breaks the Queen shield, even when Power expires in flight',()=>{
 const g=royal(6,'metro'),b=g.enemies[0];g.power();g.tap(b);assert(g.projectiles.some(q=>q.targeted&&q.powered));g.powerTime=.01;for(let i=0;i<30&&!b.guardBroken;i++)g.update(.05);assert(b.guardBroken);
});

test('a powered shot aimed at another monster cannot break an intervening royal shield',()=>{
 const g=royal(6,'metro'),b=g.enemies[0],mob={id:'other',area:6,x:b.x+1,y:b.y,hp:500,maxHp:500,cd:100,home:{x:b.x+1,y:b.y}};g.enemies.push(mob);g.power();g.tap(mob);for(let i=0;i<30;i++)g.update(.05);assert(!b.guardBroken);assert(b.hp<b.maxHp);
});

test('properly equipped active royal fights win reliably across tap timings without a rescue',()=>{
 for(const area of [6,7])for(const interval of [1.6,2,2.5])for(const offset of [-2.5,2.5]){
  const g=royal(area,area===6?'metro':'prism'),b=g.enemies[0];g.player.x=b.x+offset;assert(canWalk(g.save,g.player));let rescued=false;g.onEvent=e=>{if(e.type==='rescue')rescued=true;};let nextTap=0;
  for(let tick=0;tick<1800&&b.hp>0&&!rescued;tick++){if(g.powerCd===0)g.power();if(g.time>=nextTap){g.tap(b);nextTap=g.time+interval;}g.update(.05);}
  assert(b.hp<=0,`${area}, ${interval}, ${offset}`);assert(!rescued);assert(b.guardBroken);
 }
});
