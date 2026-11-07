import assert from 'node:assert/strict';
import {SkyGame,freshSave,readSave,LEVELS,BOSS_X} from '../engine.js';
import {Renderer} from '../art.js';
const tick=(g,s)=>{for(let i=0;i<Math.ceil(s/.02);i++)g.update(.02);};
function scene(hits=0,x=LEVELS[7].bossEncounters[0].x-250){
  const s=freshSave();s.level=7;s.completed=[0,1,2,3,4,5,6];s.runs[7].bossHits=hits;s.runs[7].position={x,y:450};s.runs[7].frontier=x;
  const events=[],g=new SkyGame(s,e=>events.push(e));g.fireEnemy=()=>{};return{g,events};
}
assert.deepEqual(LEVELS.slice(5).map(l=>l.bossHp),[50,50,120]);
assert.deepEqual(LEVELS[7].bossEncounters.map(e=>e.hp),[30,40,50]);
{
  const {g}=scene(),renderer=new Renderer({width:430,height:600,getContext:()=>({}),getBoundingClientRect:()=>({width:430,height:600})});renderer.follow(g,0,true);const scale=renderer.scale;
  g.damage(g.enemies.find(e=>e.boss),'laser',1000);g.enemies=g.enemies.filter(e=>e.hp>0);renderer.follow(g,.02);assert.equal(renderer.scale,scale,'Boss camera framing remains through the teleport animation');
}
const {g,events}=scene();
for(let phase=0;phase<3;phase++){
  const part=LEVELS[7].bossEncounters[phase];g.player.x=part.x-250;g.player.y=450;g.setViewport({left:part.x-650,right:part.x+350,top:0,bottom:1000});g.syncEncounters();
  const boss=g.enemies.find(e=>e.boss&&e.hp>0);assert(boss);assert.equal(boss.encounter,phase);assert.equal(boss.maxHp,part.hp);assert.equal(boss.hp,part.hp);
  g.projectiles.push({owner:boss.id,id:'retreat-shot',age:0,life:5});
  g.effects.push({owner:boss.id,type:'enemy-beam',age:0,life:5});
  g.damage(boss,'laser',1000); // Overkill cannot spill into the next encounter.
  assert.equal(g.run.bossHits,phase===0?30:phase===1?70:120);
  if(phase<2){
    assert.equal(g.run.kills,0);assert(!g.run.complete);assert(!g.save.completed.includes(7));
    assert(!g.projectiles.some(q=>q.owner===boss.id));assert(!g.effects.some(f=>f.owner===boss.id));
    assert(g.effects.some(f=>f.type==='rival-teleport'));assert(!g.effects.some(f=>f.type==='split'));
    assert(!events.some(e=>e.type==='destroy'||e.type==='level-complete'));
    g.update(.02);const reloaded=new SkyGame(g.snapshot());assert.equal(reloaded.bossEncounter.index,phase+1);assert.equal(reloaded.run.bossHits,[30,70][phase]);
    assert(!reloaded.enemies.some(e=>e.boss),'The next encounter waits further down the level');
    tick(g,2);assert(!g.enemies.some(e=>e.boss),'No instant rematch at the first two encounter sites');
  }else{
    assert(g.effects.some(f=>f.type==='split'),'Final laser defeat cuts the rival in half');
    assert.equal(g.run.kills,1);g.projectiles=[];tick(g,.02);assert(g.run.complete);assert(g.save.completed.includes(7));
    assert.equal(events.filter(e=>e.type==='boss-retreat').length,2);assert.equal(events.filter(e=>e.type==='level-complete').length,1);
  }
}
for(const [hits,maxHp,remaining,x] of [[15,30,15,LEVELS[7].bossEncounters[0].x-250],[45,40,25,LEVELS[7].bossEncounters[1].x-250],[85,50,35,BOSS_X-250]]){
  const {g}=scene(hits,x),b=g.enemies.find(e=>e.boss);assert.equal(b.maxHp,maxHp);assert.equal(b.hp,remaining);
  const restored=new SkyGame(g.snapshot());assert.equal(restored.enemies.find(e=>e.boss).hp,remaining);
}
const explosion=scene(119,BOSS_X-250);const final=explosion.g.enemies.find(e=>e.boss);explosion.g.time=3;explosion.g.damage(final,'ram');assert.equal(final.hp,0);assert(explosion.g.particles.length>=50);assert(!explosion.g.effects.some(f=>f.type==='split'||f.type==='rival-teleport'));
// Existing near-the-end saves and players who fly past a fight need no backtracking.
const catchup=scene(0,BOSS_X-250);assert(catchup.g.enemies.some(e=>e.boss));catchup.g.damage(catchup.g.enemies.find(e=>e.boss),'laser',1000);tick(catchup.g,2);assert(catchup.g.enemies.some(e=>e.boss&&e.encounter===1));
const old=freshSave();old.level=7;old.completed=[0,1,2,3,4,5,6,7];old.runs[7].complete=true;old.runs[7].bossHits=180;
const migrated=readSave(old);assert(migrated.runs[7].complete);assert.equal(migrated.runs[7].bossHits,120);const replay=new SkyGame(migrated);replay.selectLevel(7);assert.equal(replay.bossEncounter.index,0);assert.equal(replay.run.bossHits,0);
// An unfinished encounter may despawn during a retreat, but its damage and identity survive.
for(const phase of [0,1,2]){
  const part=LEVELS[7].bossEncounters[phase],offset=[0,30,70][phase];
  const {g}=scene(offset+7,part.x-250),original=g.enemies.find(e=>e.boss);
  assert(original);assert.equal(original.hp,part.hp-7);
  g.player.x=part.x-3000;g.syncEncounters();assert(!g.enemies.some(e=>e.boss));
  g.player.x=part.x-250;g.syncEncounters();
  const returned=g.enemies.find(e=>e.boss);assert.equal(returned.id,original.id);assert.equal(returned.hp,part.hp-7);
  for(let i=0;i<20;i++)g.syncEncounters();assert.equal(g.enemies.filter(e=>e.boss).length,1,'Repeated synchronization never duplicates the encounter');
  const hidden={left:part.x-800,right:part.x-500,top:0,bottom:1000};g.setViewport(hidden);
  for(const kind of ['laser','chain','sphere','ram'])assert.equal(g.damage(returned,kind,1000),false);
  assert.equal(g.run.bossHits,offset+7);assert.equal(returned.hp,part.hp-7,'A hidden rival cannot teleport or die from off-screen damage');
}
// Pause freezes the teleport and its spawn lock; nearby final-site catch-up stays sequential.
{
  const {g,events}=scene(0,BOSS_X-250);g.time=3;
  for(let phase=0;phase<2;phase++){
    const boss=g.enemies.find(e=>e.boss&&e.hp>0);assert.equal(boss.encounter,phase);
    g.damage(boss,'laser',1000);g.syncEncounters();assert(!g.enemies.some(e=>e.boss&&e.hp>0));
    const escape=g.effects.find(f=>f.type==='rival-teleport'),age=escape.age,time=g.time;
    g.paused=true;tick(g,3);assert.equal(g.time,time);assert.equal(escape.age,age);assert(!g.enemies.some(e=>e.boss&&e.hp>0));
    g.paused=false;tick(g,1.7);assert(!g.enemies.some(e=>e.boss&&e.hp>0));
    tick(g,.14);assert.equal(g.enemies.filter(e=>e.boss&&e.hp>0).length,1);assert.equal(g.enemies.find(e=>e.boss&&e.hp>0).encounter,phase+1);
    assert(!g.effects.some(f=>f.type==='rival-teleport'),'Retreat artwork ends before the next encounter appears');
  }
  assert.equal(g.run.bossHits,70);assert.equal(g.run.kills,0);assert(!g.run.complete);
  assert.equal(events.filter(e=>e.type==='boss-retreat').length,2);
  const restored=new SkyGame(g.snapshot());assert.equal(restored.enemies.find(e=>e.boss).hp,50);
}
console.log('Passed 30/40/50 spaced rival battles, teleport retreats without kills/victory/slicing, final laser split and ordinary explosion, overkill isolation, save/reload, catch-up and completed-save replay.');
