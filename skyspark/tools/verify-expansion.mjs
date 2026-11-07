import assert from 'node:assert/strict';
import {SkyGame,freshSave,readSave,WORLD,BOSS_X,SITE_COUNT,WEAPONS} from '../engine.js';
import {roofsFor,sitesFor} from '../levels.js';
const tick=(g,s,keys={})=>{for(let i=0;i<Math.ceil(s/.02);i++)g.update(.02,keys);};
function empty(){const g=new SkyGame(freshSave());g.enemies=[];g.syncEncounters=()=>{};g.auraCd=1e6;g.player.x=1500;g.player.y=500;return g;}
assert.equal(WORLD.width,9600);assert.equal(BOSS_X,9220);assert.equal(SITE_COUNT,18);assert.equal(WEAPONS.chainLimit,20);assert.equal(WEAPONS.chainRange,360);
for(let level=0;level<3;level++){
  assert.equal(sitesFor(level).length,18);assert(roofsFor(level).some(r=>r.x>8000));
  for(const x of [1000,3150,3350,6350,6550,8900]){const save=freshSave();save.level=level;save.completed=Array.from({length:level},(_,i)=>i);save.runs[level].position={x,y:500};const g=new SkyGame(save);assert(g.enemies.filter(e=>!e.boss).length>10,'Repeat seams stay populated');if(x<8000)assert(!g.enemies.some(e=>e.boss),'No premature boss at a former level ending');}
}
const old={schema:4,level:1,completed:[0],sound:false,total:70,runs:[{}, {checkpoint:16,frontier:8600,position:{x:8500,y:440},bossHits:9,kills:42,cleared:['plains-15-0-2','plains-18-0-1'],restored:[4]}]};
const migrated=readSave(old);assert.equal(migrated.schema,6);assert.equal(migrated.runs[1].position.x,8500);assert.equal(migrated.runs[1].frontier,8600);assert.equal(migrated.runs[1].bossHits,18);assert.equal(migrated.runs[1].kills,42);assert(migrated.runs[1].cleared.includes('plains-18-0-1'));assert(migrated.runs[1].cleared.includes('plains-15-0-2'));assert.deepEqual(readSave(migrated),migrated,'Migration scales progress exactly once');
for(const [kind,size] of [['orb',17.5],['missile',30],['rock',37.5],['beam',27.5]]){
  for(const [vx,vy] of [[1,0],[-1,0],[0,1],[0,-1]]){const g=empty(),p=g.player,before={x:p.x,y:p.y};g.bodyImpact(p.x-vx*20,p.y-vy*20,kind,vx,vy);tick(g,1.5);const shift=(p.x-before.x)*vx+(p.y-before.y)*vy;assert(Math.abs(shift-size)<.1,`${kind} has small directional displacement`);assert.equal(p.hp,undefined);assert.equal(p.shield,undefined);assert.equal(g.save.total,0);}
}
let g=empty();g.bodyImpact(1520,500,'rock',-1,0);tick(g,.5,{right:true});assert(g.player.x>1600,'Controls overpower the push immediately');
for(const facing of [-1,1]){
  for(const kind of ['orb','missile','rock','beam']){
    const hit=empty(),p=hit.player;p.facing=facing;const startX=p.x;
    hit.bodyImpact(p.x+facing*20,p.y,kind,-facing,0);
    for(let i=0;i<75;i++){hit.update(.02);assert.equal(p.facing,facing,`${kind} recoil preserves facing throughout recovery`);}
    assert((p.x-startX)*facing<0,'Frontal hit still pushes backwards');
    hit.laser();const laser=hit.effects.find(f=>f.type==='laser');
    assert(Math.cos(laser.from)*facing>.99,'Untargeted laser still fires forwards after recoil');
    tick(hit,.1,facing>0?{left:true}:{right:true});assert.equal(p.facing,-facing,'Deliberate reverse flight still turns the hero');
  }
  const tapped=empty();tapped.player.facing=-facing;tapped.moveTo(tapped.player.x+facing*200,tapped.player.y);tick(tapped,.1);assert.equal(tapped.player.facing,facing,'Tap-to-fly still sets facing');
  const vertical=empty();vertical.player.facing=facing;vertical.bodyImpact(1500+facing*20,500,'rock',-facing,0);tick(vertical,.2,{up:true});assert.equal(vertical.player.facing,facing,'Vertical flight during recoil preserves facing');
}
for(const pos of [{x:40,y:105},{x:WORLD.width-40,y:802},{x:180,y:480}]){g=empty();Object.assign(g.player,pos);g.bodyImpact(pos.x+20,pos.y+20,'rock',-1,-1);tick(g,2);assert(g.player.x>=40&&g.player.x<=WORLD.width-40&&g.player.y>=105&&g.player.y<=802);tick(g,.5,{right:true,down:true});assert(g.player.x>pos.x||pos.x===WORLD.width-40);assert(g.player.y>=105);}
g=empty();g.bodyImpact(1480,500,'missile',1,0);g.paused=true;const paused=JSON.stringify(g.player);tick(g,2);assert.equal(JSON.stringify(g.player),paused);g.paused=false;tick(g,1);assert(g.player.x>1500);
console.log('Passed original-length world seams, 20-target Sparks, schema-4 migration without double scaling, directional body impacts, weapon-specific knockback, pause, boundaries and immediate escape controls.');
