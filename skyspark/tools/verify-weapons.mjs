import assert from 'node:assert/strict';
import {SkyGame,freshSave,readSave,LEVELS,WEAPONS,armorSegments} from '../engine.js';
const tick=(g,s)=>{for(let i=0;i<Math.ceil(s/.02);i++)g.update(.02);};
function scene(points){
  const g=new SkyGame(freshSave());g.syncEncounters=()=>{};g.player.x=1000;g.player.y=500;g.auraCd=1e6;
  g.enemies=points.map(([x,y],i)=>({id:`fixture-${i}`,x,y,homeX:x,homeY:y,type:'fixture',hp:.8,maxHp:.8,radius:20,hit:0,cd:1e6,phase:0}));return g;
}
// The starting ray pierces every collinear robot; the continuing sweep cuts an upper group.
let g=scene([[1180,467],[1350,467],[1550,467],[1320,410],[1430,350],[1540,290],[1340,600]]);
assert(g.laser());assert.equal(g.run.kills,3,'The first target does not stop the beam');
let f=g.effects.find(e=>e.type==='laser');assert(f.sweep<0);assert(Math.abs(f.sweep)<=WEAPONS.maxSweep);assert(!g.laser());
tick(g,.64);assert(g.run.kills>=6,'Sweep follows the larger upper group');assert(g.enemies.some(e=>e.y===600),'The sweep stays narrow instead of covering both directions');
g=scene([[1180,467],[1340,530],[1460,590],[1560,640]]);g.laser();assert(g.effects.find(e=>e.type==='laser').sweep>0);tick(g,.64);assert.equal(g.run.kills,4,'The sweep also follows a lower group');
g=scene([[820,467],[680,410],[570,350]]);g.laser();tick(g,.64);assert.equal(g.run.kills,3,'Left-facing sweeps work across the angle wrap');
// The wider sweep reaches groups outside the former 37-degree limit in either direction.
assert.equal(WEAPONS.maxSweep,1.3);
for(const direction of [-1,1]){
  const point=angle=>[1008+Math.cos(angle)*450,467+direction*Math.sin(angle)*450];
  g=scene([[1180,467],point(1.15),point(1.6)]);g.laser();
  f=g.effects.find(e=>e.type==='laser');assert.equal(Math.sign(f.sweep),direction);assert.equal(Math.abs(f.sweep),1.3);
  tick(g,.64);assert.equal(g.run.kills,2,'Wide-angle groups are sliced while targets beyond the new limit survive');
}
g=scene([[1180,467],[1408,367]]);g.laser();f=g.effects.find(e=>e.type==='laser');
assert(Math.abs(f.sweep+Math.atan2(100,400)*2)<1e-9,'An ordinary targeted sweep also doubles its angle');
g=scene([]);g.laser();assert.equal(g.effects.find(e=>e.type==='laser').sweep,-.52,'The untargeted sweep doubles too');
// Sequential lightning: one immediate strike, then distinct hops, capped at twenty.
g=scene(Array.from({length:22},(_,i)=>[1150+i*120,500]));assert(g.sparks());assert.equal(g.run.kills,1);assert.equal(g.sparkCd,1);assert(!g.sparks());
f=g.effects.find(e=>e.type==='chain');assert.equal(f.nodes.length,20);assert.equal(new Set(f.nodes.map(n=>n.id)).size,20);
g.paused=true;const age=f.age,cd=g.sparkCd;tick(g,2);assert.equal(f.age,age);assert.equal(g.sparkCd,cd);g.paused=false;
tick(g,.54);assert.equal(g.run.kills,8,'The first eight strikes retain their consecutive timing');assert.equal(g.enemies.length,14);
tick(g,.6);assert.equal(g.run.kills,16,'The chain reaches sixteen targets at the expected pace');assert.equal(g.enemies.length,6);
tick(g,.4);assert.equal(g.run.kills,20,'The chain continues to the twentieth target');assert.equal(g.enemies.length,2);assert.equal(g.sparkCd,0);
tick(g,.1);g.player.x=3900;assert(g.sparks());tick(g,.1);assert.equal(g.run.kills,22);
g=scene([[1150,500],[1520,500]]);g.sparks();tick(g,.7);assert.equal(g.run.kills,1,'A jump cannot cross an empty gap beyond its range');
g=scene([]);assert(!g.sparks());assert.equal(g.sparkCd,0,'No target does not waste the sparks cooldown');
g=scene([[1250,500]]);Object.assign(g.enemies[0],{boss:true,hp:12,maxHp:12});g.sparks();tick(g,.98);assert(!g.sparks());tick(g,.04);assert(g.sparks(),'Sparks recharges in one second');
// One laser cast removes five armor points, never repeated damage every animation frame.
g=scene([[1250,467]]);let boss=g.enemies[0];Object.assign(boss,{boss:true,type:'titan',hp:12,maxHp:12});g.laser();assert.equal(boss.hp,7);tick(g,.8);assert.equal(boss.hp,7);assert.equal(g.run.bossHits,5);assert(!g.laser());
tick(g,1.18);assert(!g.laser());tick(g,.04);assert(g.laser());assert.equal(boss.hp,2);
g=scene([[1250,500]]);boss=g.enemies[0];Object.assign(boss,{boss:true,hp:12,maxHp:12});g.sparks();tick(g,.7);assert.equal(boss.hp,11.2,'A chain cannot bounce repeatedly on one boss');
const damageSave=readSave(g.snapshot());assert.equal(damageSave.runs[0].bossHits,.8,'Fractional armor damage survives reload');
for(const [kind,amount] of [['ram',1],['chain',.8],['spark',.8],['sphere',1],['laser',5]]){
  const h=scene([[1250,500]]),b=h.enemies[0];Object.assign(b,{boss:true,hp:12,maxHp:12});h.damage(b,kind);assert.equal(b.hp,12-amount,`${kind} uses the normalized damage`);
}
g=scene([[1250,500]]);boss=g.enemies[0];Object.assign(boss,{boss:true,hp:12,maxHp:12});for(let n=0;n<15;n++){g.damage(boss,'chain');g.time+=1;}assert.equal(boss.hp,0,'Fractional hits finish a boss without a tiny remainder');
assert.equal(WEAPONS.punchDamage,1);assert.equal(WEAPONS.sparksDamage,.8);assert.equal(WEAPONS.blastDamage,1);
assert(WEAPONS.laserCooldown>WEAPONS.sparksCooldown);assert.equal(WEAPONS.laserDamage,5);
for(let i=0;i<3;i++){
  assert.equal(LEVELS[i].bossHp,[24,36,48][i]);
  const raw={schema:3,level:i,completed:Array.from({length:i},(_,j)=>j),runs:[]};raw.runs[i]={bossHits:[2,3,4][i],position:{x:9200,y:500},cleared:[],kills:20};
  const save=readSave(raw);assert.equal(save.runs[i].bossHits,LEVELS[i].bossHp/2,'Older partial boss damage keeps its fraction');assert.equal(save.runs[i].kills,20);assert.equal(readSave(save).runs[i].bossHits,save.runs[i].bossHits,'Migration is applied only once');
  assert(armorSegments({hp:LEVELS[i].bossHp,maxHp:LEVELS[i].bossHp}).length<=12,'Stronger armor still fits the HUD');
}
console.log('Passed piercing and adaptive up/down/left laser sweeps, one five-damage hit per cast, staged twenty-target lightning, jump range, cooldowns, paused chains, boss scaling and save migration.');
