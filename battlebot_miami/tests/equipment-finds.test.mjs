import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {LANDMARKS,EQUIPMENT,freshSave,readSave,visibleEquipment,equipmentClaimed,powerStats} from '../world.js?v=world26';
import {MiamiAdventure} from '../engine.js?v=world26';
import {paintPictures} from '../ui-art.js?v=world26';
import {drawWorkshop} from '../workshop.js?v=world26';

test('every playground and former exploration-reward place gives a distinct real nonstarter equipment item',()=>{
 const ids=['city-centre','hammock','1814-park','key-park','domino','riverside-play','cocowalk','peacock','regatta','dinner-key','hobie','north-point','cape-florida','crandon-play','crandon','bayfront','fountain','bayside','miamarina','skyviews','museum-park','bayfront-play','frost','south-pointe'];
 const gear=ids.map(id=>{const l=LANDMARKS.find(l=>l.id===id);assert(l.equipment,id);assert.notEqual(l.equipment.type,'weapon');assert(!['none','basic','light'].includes(l.equipment.id));assert(EQUIPMENT[l.equipment.type].some(p=>p.id===l.equipment.id));return l.equipment.id;});assert.equal(new Set(gear).size,24);assert(!LANDMARKS.some(l=>l.stamp));
});

test('old visited playgrounds still give the pictured item immediately on revisit, then remember the claim',()=>{
 const s=readSave({...freshSave(),equipmentClaims:undefined,discoveries:['hammock']}),g=new MiamiAdventure(s),l=LANDMARKS.find(l=>l.id==='hammock'),events=[];g.onEvent=e=>events.push(e);assert(!equipmentClaimed(s,l));assert(!s.owned.includes('spark-cell'));Object.assign(g.player,l);g.update(.05);
 assert(s.owned.includes('spark-cell'));assert(equipmentClaimed(s,l));assert.equal(s.scrap,0);assert.equal(s.gears,0);assert.equal(events[0].type,'findEquipment');assert.equal(events[0].id,'spark-cell');assert.equal(s.build.gadget,'none');assert(visibleEquipment(s,'gadget').some(p=>p.id==='spark-cell'));
 const reloaded=readSave(JSON.parse(JSON.stringify(g.snapshot())));assert(equipmentClaimed(reloaded,l));const next=new MiamiAdventure(reloaded);next.onEvent=e=>events.push(e);next.update(.05);assert.equal(events.filter(e=>e.type==='findEquipment').length,1);next.save.king=true;next.replay();assert(equipmentClaimed(next.save,l));
});

test('already-owned finds still show their real picture identity once and never turn into currency',()=>{
 const s=freshSave();s.owned.push('spark-cell');const g=new MiamiAdventure(s),events=[];g.onEvent=e=>events.push(e);Object.assign(g.player,LANDMARKS.find(l=>l.id==='hammock'));g.update(.05);const reward=events.find(e=>e.type==='findEquipment');assert(reward);assert.equal(reward.id,'spark-cell');assert.equal(reward.kind,'gadget');assert.equal(reward.fresh,false);assert.equal(s.owned.filter(id=>id==='spark-cell').length,1);assert.equal(s.scrap,0);assert.equal(s.gears,0);
});

test('overlapping Bayfront finds wait for separate acknowledgements instead of overwriting each other',()=>{
 const s=freshSave();s.unlocked=5;const g=new MiamiAdventure(s),events=[];g.enemies=[];Object.assign(g.player,{x:103,y:46});g.onEvent=e=>{if(e.type==='findEquipment'){events.push(e);g.paused=true;}};
 g.update(.05);assert.equal(events.length,1);assert.equal(events[0].id,'polar');g.update(.05);assert.equal(events.length,1);g.paused=false;g.update(.05);assert.equal(events.length,2);assert.equal(events[1].id,'vacuum');assert.equal(s.scrap,0);assert.equal(s.build.weapon,'bumper');
});

test('new recharge gear changes real Power timing and preserves the original capacitor timing',()=>{
 for(const [id,cooldown,duration] of [['spark-cell',24,6],['quick-coil',21,7],['capacitor',18,8]]){const g=new MiamiAdventure(freshSave());g.awardEquipment('gadget',id);assert(g.equip('gadget',id));assert(g.power());assert.equal(g.powerCd,cooldown);assert.equal(g.powerTime,duration);assert.deepEqual(powerStats(g.save),{cooldown,duration});}
 const g=new MiamiAdventure(freshSave());g.power();const before=g.powerCd;g.awardEquipment('gadget','spark-cell');assert.equal(g.powerCd,before);assert(g.equip('gadget','spark-cell'));assert(g.powerCd<before);assert.equal(g.save.build.gadget,'spark-cell');g.awardEquipment('gadget','capacitor');assert(g.equip('gadget','capacitor'));g.save.owned=g.save.owned.filter(id=>id!=='quick-coil');g.awardEquipment('gadget','quick-coil');assert.equal(g.save.build.gadget,'capacitor');
});

test('a newly found wheel tradeoff becomes owned without silently removing health or speed',()=>{
 const g=new MiamiAdventure(freshSave());g.awardEquipment('wheels','boardwalk');assert.equal(g.maxHp(),70);assert(g.equip('wheels','boardwalk'));assert.equal(g.maxHp(),75);g.awardEquipment('wheels','speed');assert(g.save.owned.includes('speed'));assert.equal(g.save.build.wheels,'boardwalk');assert.equal(g.maxHp(),75);assert(g.equip('wheels','speed'));assert.equal(g.save.build.wheels,'speed');
});

test('Beach Scout fires real helper shots without awarding or changing a weapon',()=>{
 const s=freshSave();s.unlocked=5;s.position={x:95,y:45};const g=new MiamiAdventure({...s,position:{x:94,y:81}});g.awardEquipment('gadget','scout');assert(g.equip('gadget','scout'));Object.assign(g.player,{x:95,y:45});g.enemies=[{id:'target',area:5,x:96,y:45,hp:200,maxHp:200,cd:100,home:{x:96,y:45}}];g.player.cd=100;g.update(.01);assert(g.projectiles.some(p=>p.weapon==='drone'&&p.damage===12*.6));assert.equal(s.weapon,'bumper');assert.equal(g.buddyCd,1.5);
});

function gradientStop(offset,color){this.stops.push([offset,color]);}
function picture(id,type){const ops=[],target={measureText:s=>({width:String(s).length*10}),createLinearGradient:(...bounds)=>({kind:'linear',bounds,stops:[],addColorStop:gradientStop})},c=new Proxy(target,{get:(o,k)=>k in o?o[k]:(...args)=>ops.push([k,...args]),set:(o,k,v)=>{o[k]=v;ops.push(['style',k,v]);return true;}});return {width:136,height:136,dataset:{equipment:id,type,item:id},getContext:()=>c,ops};}

test('pickup and workshop use identical equipment drawing operations for every assigned item',()=>{
 for(const l of LANDMARKS.filter(l=>l.equipment)){const {type,id}=l.equipment,find=picture(id,type),menu=picture(id,type);paintPictures({querySelectorAll:selector=>selector==='canvas[data-equipment]'?[find]:[]},freshSave());drawWorkshop({querySelector:()=>null,querySelectorAll:selector=>selector==='canvas[data-item]'?[menu]:[]},freshSave(),type);
  // Both paths differ only in canvas setup; the item artwork and scaling are identical.
  const body=ops=>ops.slice(ops.findIndex(op=>op[0]==='translate'&&op[1]===34&&op[2]===34));assert.deepEqual(body(find.ops),body(menu.ops),id);
 }
});

test('the six new equipment pictures are distinct and invalid claim records cannot hide an unowned reward',()=>{
 const signatures=[];for(const [type,id] of [['gadget','spark-cell'],['gadget','quick-coil'],['gadget','scout'],['wheels','boardwalk'],['wheels','balloon'],['armor','grove-shell']]){const el=picture(id,type);paintPictures({querySelectorAll:selector=>selector==='canvas[data-equipment]'?[el]:[]},freshSave());assert(el.ops.length>30);signatures.push(JSON.stringify(el.ops));}assert.equal(new Set(signatures).size,6);
 const s=readSave({...freshSave(),equipmentClaims:['hammock','unknown']});assert.deepEqual(s.equipmentClaims,[]);
});

test('the pictured find opens its workshop category and no star-reward handler remains',async()=>{
 const app=await readFile(new URL('../app.js',import.meta.url),'utf8');assert(!app.includes('Park stamp'));assert(!app.includes("e.type==='visit'"));assert(app.includes('workTab=e.kind'));assert(app.includes('class="equipment-prize"'));assert(app.includes('data-equipment="${e.id}" data-type="${e.kind}"'));
});
