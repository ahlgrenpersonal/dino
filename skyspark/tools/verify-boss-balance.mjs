import assert from 'node:assert/strict';
import {SkyGame,freshSave,readSave,LEVELS,BOSS_X,bossShieldUp} from '../engine.js';
function scene(level,round=0){
  const s=freshSave(),part=LEVELS[level].bossEncounters?.[round];s.level=level;s.completed=Array.from({length:level},(_,i)=>i);
  s.runs[level].bossHits=level===7?[0,30,70][round]:0;s.runs[level].position={x:(part?.x||BOSS_X)-500,y:450};
  const g=new SkyGame(s);g.enemies=g.enemies.filter(e=>e.boss);g.syncEncounters=()=>{};
  g.setViewport({left:g.player.x-650,right:g.player.x+650,top:0,bottom:1000});const boss=g.enemies[0];boss.cd=1e6;return{g,boss};
}
const tick=(g,s,keys={})=>{for(let i=0;i<Math.ceil(s/.02);i++)g.update(.02,keys);};
for(let level=0;level<8;level++)for(let round=0;round<(level===7?3:1);round++){
  const {g,boss}=scene(level,round);assert(boss.maxHp<=50);let casts=0;
  while(boss.hp>0&&casts<11){
    g.time=casts*2;const hp=boss.hp;assert(g.damage(boss,'laser'));assert.equal(hp-boss.hp,Math.min(5,hp));casts++;
  }
  assert.equal(boss.hp,0);assert.equal(casts,Math.ceil(boss.maxHp/5));assert(casts<=10,'Even raised shields cannot stretch a fight beyond ten successful laser hits');
}
assert.deepEqual(LEVELS[7].bossEncounters.map(e=>e.hp),[30,40,50]);
const previous=[24,36,48,64,84,90,100,200],old=freshSave();old.schema=6;old.completed=[0,1,2,3,4,5,6];old.level=7;
for(let i=0;i<7;i++)old.runs[i].bossHits=previous[i]/2;old.runs[7].bossHits=140;
const migrated=readSave(old);assert.equal(migrated.schema,7);
for(let i=0;i<7;i++)assert.equal(migrated.runs[i].bossHits,LEVELS[i].bossHp/2);
assert.equal(migrated.runs[7].bossHits,95);assert.equal(new SkyGame(migrated).bossEncounter.index,2);
assert.deepEqual(readSave(migrated),migrated,'Balance migration applies exactly once');
for(const [damage,expected,round] of [[20,15,0],[40,30,1],[60,50,1],[80,70,2],[140,95,2],[200,120,null]]){
  const s=structuredClone(old);s.runs[7].bossHits=damage;const g=new SkyGame(readSave(s));assert.equal(g.run.bossHits,expected);assert.equal(g.bossEncounter?.index??null,round);
}
{
  const {g,boss}=scene(5);g.fireEnemy(boss);assert.equal(g.projectiles.length,4);assert(!g.effects.some(f=>f.type==='enemy-beam'));
  tick(g,.26);assert.equal(g.projectiles.length,4);tick(g,.04);assert.equal(g.projectiles.length,8);tick(g,.28);assert.equal(g.projectiles.length,12,'The siege walker sustains three distinct waves');
  assert(g.projectiles.every(q=>Math.abs(Math.hypot(q.vx,q.vy)-170)<1e-6));
  const frozen=scene(5);frozen.g.fireEnemy(frozen.boss);frozen.g.paused=true;tick(frozen.g,1);assert.equal(frozen.g.projectiles.length,4);frozen.g.paused=false;tick(frozen.g,.3);assert.equal(frozen.g.projectiles.length,8);
}
{
  const {g,boss}=scene(6);g.fireEnemy(boss);assert.equal(g.projectiles.length,0);const warning=g.effects.find(f=>f.type==='boss-crossfire');assert.equal(warning.origins.length,6);
  const aim={tx:warning.tx,ty:warning.ty,origins:structuredClone(warning.origins)};tick(g,.98);assert.equal(g.projectiles.length,0);tick(g,.04);assert.equal(g.projectiles.length,6);
  assert(g.projectiles.every(q=>q.type==='missile'&&Math.abs(Math.hypot(q.vx,q.vy)-221)<1e-6));
  assert(g.projectiles.some(q=>q.vx>0)&&g.projectiles.some(q=>q.vx<0)&&g.projectiles.some(q=>q.vy>0)&&g.projectiles.some(q=>q.vy<0),'Missiles converge from multiple directions');
  assert.deepEqual({tx:warning.tx,ty:warning.ty,origins:warning.origins},aim,'Warning and missile aim stay fixed');
  const dodge=scene(6);dodge.g.fireEnemy(dodge.boss);tick(dodge.g,3,{up:true});assert.equal(dodge.g.impactHits,0,'The faster crossfire remains dodgeable');
}
for(const level of [5,6]){
  const {g,boss}=scene(level);g.fireEnemy(boss);g.projectiles=[];boss.hp=0;tick(g,2);assert.equal(g.projectiles.length,0,'A defeated boss cannot finish a queued barrage');
  const hidden=scene(level);hidden.g.fireEnemy(hidden.boss);hidden.g.projectiles=[];hidden.g.setViewport({left:0,right:500,top:0,bottom:1000});tick(hidden.g,2);assert.equal(hidden.g.projectiles.length,0,'Hidden bosses cancel queued attacks');
}
{
  const {g,boss}=scene(7);g.fireEnemy(boss);assert.equal(boss.cd,2.8);assert(g.effects.find(f=>f.type==='enemy-beam').charge>=1.3,'Faster power cycling keeps the dodge warning');
  const ordinary=g.robot('unchanged-drone',g.player.x+400,450,'drone');g.projectiles=[];g.fireEnemy(ordinary);assert.equal(g.projectiles.length,1);assert.equal(Math.round(Math.hypot(g.projectiles[0].vx,g.projectiles[0].vy)),185,'Ordinary fire speed stays unchanged');
}
console.log('Passed ten-laser maximum through shields, 30/40/50 rival rounds, proportional saved-health migration, sustained siege volleys, telegraphed 30%-faster crossfire, dodge/pause/defeat/off-screen cancellation and unchanged ordinary fire.');
