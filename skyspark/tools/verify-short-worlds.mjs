import assert from 'node:assert/strict';
import {SkyGame,freshSave,readSave,LEVELS,WORLD,SITE_COUNT,BOSS_X} from '../engine.js';
import {roofsFor,sitesFor} from '../levels.js';
assert.equal(WORLD.width,9600);assert.equal(SITE_COUNT,18);assert.equal(BOSS_X,9220);
for(let i=0;i<LEVELS.length;i++){
  assert.equal(sitesFor(i).length,18);assert(sitesFor(i).every(s=>s.x<WORLD.width));
  assert(roofsFor(i).every(r=>r.x+r.w<WORLD.width));
}
assert.deepEqual(LEVELS[7].bossEncounters.map(e=>e.x),[1900,5000,9220]);
assert.deepEqual(LEVELS[7].bossEncounters.map(e=>e.hp),[30,40,50]);
const raw=freshSave();raw.schema=5;raw.level=7;raw.completed=[0,1,2,3,4,5,6];raw.total=1777;raw.sound=false;
for(let i=0;i<8;i++){
  const l=LEVELS[i],r=raw.runs[i];r.position={x:18000,y:430};r.frontier=18510;r.checkpoint=36;r.kills=300+i;r.playSeconds=200;r.bossHits=i===7?55:3;
  r.cleared=[0,1,2].map(n=>`${l.id}-${30+n}-0-0`).concat(`${l.id}-33-0-1`,`${l.id}-54-0-2`,'invalid');r.restored=[3,4,5,6];
}
const input=structuredClone(raw),short=readSave(raw);
assert.deepEqual(raw,input,'Loading never mutates the stored input');assert.equal(short.schema,7);assert.equal(short.total,1777);assert.equal(short.sound,false);assert.deepEqual(short.completed,raw.completed);
for(let i=0;i<8;i++){
  const r=short.runs[i],l=LEVELS[i];assert.deepEqual(r.position,{x:6000,y:430});assert.equal(r.frontier,6170);assert.equal(r.checkpoint,12);
  assert.equal(r.kills,300+i);assert.equal(r.playSeconds,200);assert.equal(r.bossHits,[3,3,3,2.3,1.8,1.7,1.5,45][i]);
  assert.deepEqual(r.cleared,[`${l.id}-10-0-0`,`${l.id}-18-0-2`]);assert.deepEqual(r.restored,[1]);
}
assert.deepEqual(readSave(short),short,'Reloading does not shrink positions a second time');
const rival=new SkyGame(short);assert.equal(rival.bossEncounter.index,1);assert.equal(rival.enemies.find(e=>e.boss).hp,25,'Current rival round and partial health survive the resize');
const untouched=freshSave();untouched.schema=5;assert(readSave(untouched).runs.every(r=>r.position.x===290&&r.frontier===290),'Unvisited worlds retain the familiar starting point');
const done=structuredClone(raw);done.runs[7].complete=true;done.runs[7].bossHits=200;done.runs[7].checkpoint=54;done.runs[7].restored=Array.from({length:18},(_,i)=>i);
const completed=readSave(done);assert(completed.runs[7].complete);assert.equal(completed.runs[7].checkpoint,18);assert.equal(completed.runs[7].bossHits,120);assert.deepEqual(completed.runs[7].restored,[0,1,2,3,4,5]);assert(completed.completed.includes(7));
// A rival can be retained outside a narrow viewport after the hero passes him.
const s=freshSave();s.level=7;s.completed=[0,1,2,3,4,5,6];s.runs[7].position={x:1650,y:450};s.runs[7].bossHits=7;
const g=new SkyGame(s),old=g.enemies.find(e=>e.boss);g.player.x=BOSS_X-300;old.homeX=g.player.x-1200;old.x=old.homeX;
g.projectiles.push({owner:old.id,id:'old-shot'});g.effects.push({owner:old.id,type:'enemy-beam'});
const bounds={left:g.player.x-310,right:g.player.x+310,top:0,bottom:1000};g.syncEncounters(bounds);
const caught=g.enemies.find(e=>e.boss);assert(caught);assert.notEqual(caught,old);assert.equal(caught.hp,23);assert(g.isVisible(caught,bounds));
assert(!g.projectiles.some(q=>q.id==='old-shot'));assert(!g.effects.some(f=>f.owner===old.id));
g.syncEncounters(bounds);assert.equal(g.enemies.find(e=>e.boss),caught,'A visible boss is never repeatedly relocated');
console.log('Passed all eight 9,600-unit worlds, encounter spacing, one-time schema-5 compression, conservative cleared groups, preserved unlocks/tallies/boss damage, completed replay state and visible rival catch-up without ghost fire.');
