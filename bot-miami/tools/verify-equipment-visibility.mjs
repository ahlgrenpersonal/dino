import test from 'node:test';
import assert from 'node:assert/strict';
import {freshSave,REGIONS,EQUIPMENT,available,visibleEquipment} from '../data.js';

for(let stage=0;stage<=REGIONS.length;stage++)for(const type of Object.keys(EQUIPMENT))test(`${type}, ${stage} relays: only owned or unlocked upgrades appear`,()=>{
  const s=freshSave();s.bosses=Array.from({length:stage},(_,r)=>r);s.scrap=0;s.gears=0;
  const shown=visibleEquipment(s,type);assert(shown.length>0);assert.deepEqual(shown,EQUIPMENT[type].filter(p=>s.owned.includes(p.id)||available(s,p)));
  for(const p of EQUIPMENT[type])assert.equal(shown.includes(p),s.owned.includes(p.id)||p.unlock<0||p.unlock<stage);
  s.scrap=100000;s.gears=100000;assert.deepEqual(visibleEquipment(s,type),shown,'Affordability cannot reveal future blueprints or hide unlocked upgrades');
});
test('an owned upgrade remains visible even when restored from a save without its boss flag',()=>{
  const s=freshSave(),part=EQUIPMENT.weapon.find(p=>p.unlock>5);assert(!visibleEquipment(s,'weapon').includes(part));s.owned.push(part.id);assert(visibleEquipment(s,'weapon').includes(part));
});
test('each victory reveals its own blueprints but no later ones',()=>{
  const s=freshSave();for(let r=0;r<REGIONS.length;r++){
    const before=new Set(Object.keys(EQUIPMENT).flatMap(type=>visibleEquipment(s,type)));s.bosses.push(r);
    const added=Object.keys(EQUIPMENT).flatMap(type=>visibleEquipment(s,type)).filter(p=>!before.has(p));
    assert(added.length>0,`Region ${r} must reveal new equipment`);assert(added.every(p=>p.unlock===r));
  }
});
