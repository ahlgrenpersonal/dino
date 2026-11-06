import assert from 'node:assert/strict';
import {SkyGame,freshSave,readSave,WORLD,BOSS_X,SITE_COUNT,WEAPONS} from '../engine.js';
import {roofsFor,sitesFor} from '../levels.js';
const tick=(g,s,keys={})=>{for(let i=0;i<Math.ceil(s/.02);i++)g.update(.02,keys);};
function empty(){const g=new SkyGame(freshSave());g.enemies=[];g.syncEncounters=()=>{};g.auraCd=1e6;g.player.x=1500;g.player.y=500;return g;}
assert.equal(WORLD.width,28800);assert.equal(BOSS_X,28420);assert.equal(SITE_COUNT,54);assert.equal(WEAPONS.chainLimit,20);assert.equal(WEAPONS.chainRange,360);
for(let level=0;level<3;level++){
  assert.equal(sitesFor(level).length,54);assert(roofsFor(level).some(r=>r.x>27000));
  for(const x of [9450,9700,19000,19500,27500]){const save=freshSave();save.level=level;save.completed=Array.from({length:level},(_,i)=>i);save.runs[level].position={x,y:500};const g=new SkyGame(save);assert(g.enemies.filter(e=>!e.boss).length>10,'Repeat seams stay populated');if(x<25000)assert(!g.enemies.some(e=>e.boss),'No premature boss at a former level ending');}
}
const old={schema:4,level:1,completed:[0],sound:false,total:70,runs:[{}, {checkpoint:16,frontier:8600,position:{x:8500,y:440},bossHits:9,kills:42,cleared:['plains-15-0-2','plains-18-0-1'],restored:[4]}]};
const migrated=readSave(old);assert.equal(migrated.schema,5);assert.equal(migrated.runs[1].position.x,25500);assert.equal(migrated.runs[1].frontier,25800);assert.equal(migrated.runs[1].bossHits,18);assert.equal(migrated.runs[1].kills,42);assert(migrated.runs[1].cleared.includes('plains-54-0-1'));assert(migrated.runs[1].cleared.includes('plains-47-0-2'));assert.deepEqual(readSave(migrated),migrated,'Migration scales progress exactly once');
for(const [kind,size] of [['orb',17.5],['missile',30],['rock',37.5],['beam',27.5]]){
  for(const [vx,vy] of [[1,0],[-1,0],[0,1],[0,-1]]){const g=empty(),p=g.player,before={x:p.x,y:p.y};g.bodyImpact(p.x-vx*20,p.y-vy*20,kind,vx,vy);tick(g,1.5);const shift=(p.x-before.x)*vx+(p.y-before.y)*vy;assert(Math.abs(shift-size)<.1,`${kind} has small directional displacement`);assert.equal(p.hp,undefined);assert.equal(p.shield,undefined);assert.equal(g.save.total,0);}
}
let g=empty();g.bodyImpact(1520,500,'rock',-1,0);tick(g,.5,{right:true});assert(g.player.x>1600,'Controls overpower the push immediately');
for(const pos of [{x:40,y:105},{x:WORLD.width-40,y:802},{x:180,y:480}]){g=empty();Object.assign(g.player,pos);g.bodyImpact(pos.x+20,pos.y+20,'rock',-1,-1);tick(g,2);assert(g.player.x>=40&&g.player.x<=WORLD.width-40&&g.player.y>=105&&g.player.y<=802);tick(g,.5,{right:true,down:true});assert(g.player.x>pos.x||pos.x===WORLD.width-40);assert(g.player.y>=105);}
g=empty();g.bodyImpact(1480,500,'missile',1,0);g.paused=true;const paused=JSON.stringify(g.player);tick(g,2);assert.equal(JSON.stringify(g.player),paused);g.paused=false;tick(g,1);assert(g.player.x>1500);
console.log('Passed triple-length world seams, 20-target Sparks, schema-4 migration without double scaling, directional body impacts, weapon-specific knockback, pause, boundaries and immediate escape controls.');
