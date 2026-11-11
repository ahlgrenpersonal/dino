import test from 'node:test';
import assert from 'node:assert/strict';
import {AREAS,EQUIPMENT,HOME,freshSave,readSave,equipmentStats,visibleEquipment} from '../world.js?v=world26';
import {MiamiAdventure} from '../engine.js?v=world26';
import {weaponRewardHTML} from '../reward-view.js?v=world26';

function clearChapter(g,a){for(const e of [...g.enemies].filter(e=>(e.chapter??e.area)===a.id&&!e.boss))g.hit(e,10000);g.hit(g.enemies.find(e=>e.id===`boss-${a.id}`),10000,{targeted:true,powered:true});}
const view={head:(title,sub)=>`<header>${title} ${sub}</header>`,iconAction:(action,icon,label)=>`<button data-action="${action}">${icon} ${label}</button>`,mapIcon:'map'};

test('all seven bosses award and preview their weapons without changing the chosen loadout, also on replay',()=>{
 const g=new MiamiAdventure(freshSave()),events=[];g.onEvent=e=>events.push(e);
 for(const a of AREAS.slice(1)){const before={...g.save.build};clearChapter(g,a);assert(g.save.owned.includes(a.reward));assert.deepEqual(g.save.build,before);assert.equal(g.save.weapon,'bumper');const html=weaponRewardHTML(a.reward,Math.min(7,a.id+1),view);assert(html.includes(`data-weapon="${a.reward}"`));assert(html.includes('data-action="build"'));assert(!html.includes('Already equipped'));}
 assert.equal(events.filter(e=>e.type==='reward').length,7);assert(g.equip('weapon','prism'));assert(g.replay());events.length=0;
 for(const a of AREAS.slice(1)){clearChapter(g,a);assert.equal(g.save.weapon,'prism');assert.equal(g.save.build.weapon,'prism');}
 assert.equal(events.filter(e=>e.type==='reward').length,7);assert.equal(g.save.owned.filter(id=>id==='firejet').length,1);
});

test('earning every nonweapon item changes ownership only, including health, chosen parts and cooldowns',()=>{
 const g=new MiamiAdventure(freshSave());g.player.hp=31;Object.assign(g,{powerCd:14,powerTime:3,shieldCd:2,buddyCd:.8});
 const chosen=JSON.stringify({build:g.save.build,weapon:g.save.weapon,stats:equipmentStats(g.save),hp:g.player.hp,powerCd:g.powerCd,powerTime:g.powerTime,shieldCd:g.shieldCd,buddyCd:g.buddyCd});
 for(const type of ['armor','wheels','gadget'])for(const item of EQUIPMENT[type]){g.awardEquipment(type,item.id);assert(g.save.owned.includes(item.id));assert(visibleEquipment(g.save,type).some(p=>p.id===item.id));assert.equal(JSON.stringify({build:g.save.build,weapon:g.save.weapon,stats:equipmentStats(g.save),hp:g.player.hp,powerCd:g.powerCd,powerTime:g.powerTime,shieldCd:g.shieldCd,buddyCd:g.buddyCd}),chosen);}
 assert(!g.awardEquipment('weapon','neon'));assert(!g.save.owned.includes('neon'));
});

test('owned parts can be upgraded or downgraded only at home and selections survive reload',()=>{
 const g=new MiamiAdventure(freshSave());g.award('neon');g.awardEquipment('armor','polar');g.awardEquipment('wheels','hover');g.awardEquipment('gadget','capacitor');
 for(const [type,id] of [['weapon','neon'],['armor','polar'],['wheels','hover'],['gadget','capacitor']])assert(g.equip(type,id));
 assert.equal(g.maxHp(),515);Object.assign(g.player,{x:100,y:80});const before={...g.save.build};for(const [type,id] of [['weapon','bumper'],['armor','light'],['wheels','basic'],['gadget','none']])assert(!g.equip(type,id));assert.deepEqual(g.save.build,before);
 Object.assign(g.player,HOME);for(const [type,id] of [['weapon','bumper'],['armor','light'],['wheels','basic'],['gadget','none']])assert(g.equip(type,id));assert.equal(g.maxHp(),70);assert.equal(g.player.hp,70);
 const saved=readSave(JSON.parse(JSON.stringify(g.snapshot())));assert.deepEqual(saved.build,g.save.build);assert.equal(saved.weapon,'bumper');assert(saved.owned.includes('neon'));assert(saved.owned.includes('polar'));
});

test('recharge and helper timers respond to a deliberate workshop choice, never the reward',()=>{
 const g=new MiamiAdventure(freshSave());Object.assign(g,{powerCd:14,powerTime:3,shieldCd:2,buddyCd:.8});g.awardEquipment('gadget','spark-cell');assert.equal(g.powerCd,14);assert.equal(g.shieldCd,2);assert.equal(g.buddyCd,.8);
 assert(g.equip('gadget','spark-cell'));assert.equal(g.powerCd,12);assert.equal(g.powerTime,3);assert.equal(g.shieldCd,0);assert.equal(g.buddyCd,0);assert(g.equip('gadget','none'));assert.equal(g.powerCd,14);
});

test('walking into home opens one arrival opportunity; loading or remaining at home does not',()=>{
 const s=freshSave();s.position={x:99,y:81};const g=new MiamiAdventure(s),arrivals=[];g.enemies=[];g.onEvent=e=>{if(e.type==='home'&&e.arrival){arrivals.push(e);g.paused=true;}};g.moveTo(HOME);for(let i=0;i<200&&!g.paused;i++)g.update(.05);assert(g.isHome());assert(g.paused);assert.equal(arrivals.length,1);
 g.paused=false;for(let i=0;i<30;i++)g.update(.05);assert.equal(arrivals.length,1);
 const loaded=new MiamiAdventure(readSave(g.snapshot()));loaded.enemies=[];loaded.onEvent=e=>{if(e.arrival)arrivals.push(e);};for(let i=0;i<30;i++)loaded.update(.05);assert.equal(arrivals.length,1);
 g.moveTo({x:99,y:81});for(let i=0;i<100;i++)g.update(.05);g.moveTo(HOME);for(let i=0;i<200&&!g.paused;i++)g.update(.05);assert.equal(arrivals.length,2);
});

test('Build return and rescue each report home correctly without repeated arrival popups',()=>{
 const s=freshSave();s.position={x:99,y:81};const g=new MiamiAdventure(s),events=[];g.enemies=[];g.onEvent=e=>events.push(e);g.goHome();for(let i=0;i<200&&!g.isHome();i++)g.update(.05);assert(events.some(e=>e.type==='home'&&e.arrival));const n=events.length;for(let i=0;i<30;i++)g.update(.05);assert.equal(events.length,n);
 Object.assign(g.player,{x:99,y:81});g.homeInside=false;g.rescueHome();assert.equal(events.at(-1).type,'home');assert(!events.at(-1).arrival);const after=events.length;for(let i=0;i<30;i++)g.update(.05);assert.equal(events.length,after);
});
