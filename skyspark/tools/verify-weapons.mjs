import assert from 'node:assert/strict';
import {SkyGame,freshSave,readSave,LEVELS,WEAPONS,armorSegments} from '../engine.js';
const tick=(g,s)=>{for(let i=0;i<Math.ceil(s/.02);i++)g.update(.02);};
function scene(points){
  const g=new SkyGame(freshSave());g.syncEncounters=()=>{};g.player.x=1000;g.player.y=500;g.auraCd=1e6;
  g.enemies=points.map(([x,y],i)=>({id:`fixture-${i}`,x,y,homeX:x,homeY:y,type:'fixture',hp:1,maxHp:1,radius:20,hit:0,cd:1e6,phase:0}));return g;
}
// The starting ray pierces every collinear robot; the continuing sweep cuts an upper group.
let g=scene([[1180,467],[1350,467],[1550,467],[1320,410],[1430,350],[1540,290],[1340,600]]);
assert(g.laser());assert.equal(g.run.kills,3,'The first target does not stop the beam');
let f=g.effects.find(e=>e.type==='laser');assert(f.sweep<0);assert(Math.abs(f.sweep)<=WEAPONS.maxSweep);assert(!g.laser());
tick(g,.64);assert(g.run.kills>=6,'Sweep follows the larger upper group');assert(g.enemies.some(e=>e.y===600),'The sweep stays narrow instead of covering both directions');
g=scene([[1180,467],[1340,530],[1460,590],[1560,640]]);g.laser();assert(g.effects.find(e=>e.type==='laser').sweep>0);tick(g,.64);assert.equal(g.run.kills,4,'The sweep also follows a lower group');
g=scene([[820,467],[680,410],[570,350]]);g.laser();tick(g,.64);assert.equal(g.run.kills,3,'Left-facing sweeps work across the angle wrap');
// Sequential lightning: one immediate strike, then distinct hops, capped at eight.
g=scene(Array.from({length:10},(_,i)=>[1150+i*120,500]));assert(g.sparks());assert.equal(g.run.kills,1);assert.equal(g.sparkCd,1.2);assert(!g.sparks());
f=g.effects.find(e=>e.type==='chain');assert.equal(f.nodes.length,8);assert.equal(new Set(f.nodes.map(n=>n.id)).size,8);
g.paused=true;const age=f.age,cd=g.sparkCd;tick(g,2);assert.equal(f.age,age);assert.equal(g.sparkCd,cd);g.paused=false;
tick(g,.54);assert.equal(g.run.kills,8);assert.equal(g.enemies.length,2);assert(!g.sparks());tick(g,.7);g.player.x=1900;assert(g.sparks());tick(g,.1);assert.equal(g.run.kills,10);
g=scene([[1150,500],[1500,500]]);g.sparks();tick(g,.7);assert.equal(g.run.kills,1,'A jump cannot cross an empty gap beyond its range');
g=scene([]);assert(!g.sparks());assert.equal(g.sparkCd,0,'No target does not waste the sparks cooldown');
// One laser cast removes two armor points, never repeated damage every animation frame.
g=scene([[1250,467]]);let boss=g.enemies[0];Object.assign(boss,{boss:true,type:'titan',hp:12,maxHp:12});g.laser();assert.equal(boss.hp,10);tick(g,.8);assert.equal(boss.hp,10);assert.equal(g.run.bossHits,2);assert(!g.laser());
tick(g,1.5);assert(g.laser());assert.equal(boss.hp,8);
g=scene([[1250,500]]);boss=g.enemies[0];Object.assign(boss,{boss:true,hp:12,maxHp:12});g.sparks();tick(g,.7);assert.equal(boss.hp,11,'A chain cannot bounce repeatedly on one boss');
assert(WEAPONS.laserCooldown>WEAPONS.sparksCooldown);assert(WEAPONS.laserDamage>1);
for(let i=0;i<3;i++){
  assert.equal(LEVELS[i].bossHp,[12,18,24][i]);
  const raw={schema:3,level:i,completed:Array.from({length:i},(_,j)=>j),runs:[]};raw.runs[i]={bossHits:[2,3,4][i],position:{x:9200,y:500},cleared:[],kills:20};
  const save=readSave(raw);assert.equal(save.runs[i].bossHits,LEVELS[i].bossHp/2,'Older partial boss damage keeps its fraction');assert.equal(save.runs[i].kills,20);assert.equal(readSave(save).runs[i].bossHits,save.runs[i].bossHits,'Migration is applied only once');
  assert(armorSegments({hp:LEVELS[i].bossHp,maxHp:LEVELS[i].bossHp}).length<=12,'Stronger armor still fits the HUD');
}
console.log('Passed piercing and adaptive up/down/left laser sweeps, one two-damage hit per cast, staged eight-target lightning, jump range, cooldowns, paused chains, boss scaling and save migration.');
