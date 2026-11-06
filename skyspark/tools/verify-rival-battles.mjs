import assert from 'node:assert/strict';
import {SkyGame,freshSave,readSave,LEVELS,BOSS_X} from '../engine.js';
import {Renderer} from '../art.js';
const tick=(g,s)=>{for(let i=0;i<Math.ceil(s/.02);i++)g.update(.02);};
function scene(hits=0,x=5350){
  const s=freshSave();s.level=7;s.completed=[0,1,2,3,4,5,6];s.runs[7].bossHits=hits;s.runs[7].position={x,y:450};s.runs[7].frontier=x;
  const events=[],g=new SkyGame(s,e=>events.push(e));g.fireEnemy=()=>{};return{g,events};
}
assert.deepEqual(LEVELS.slice(5).map(l=>l.bossHp),[90,100,200]);
assert.deepEqual(LEVELS[7].bossEncounters.map(e=>e.hp),[40,40,120]);
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
  assert.equal(g.run.bossHits,phase===0?40:phase===1?80:200);
  if(phase<2){
    assert.equal(g.run.kills,0);assert(!g.run.complete);assert(!g.save.completed.includes(7));
    assert(!g.projectiles.some(q=>q.owner===boss.id));assert(!g.effects.some(f=>f.owner===boss.id));
    assert(g.effects.some(f=>f.type==='rival-teleport'));assert(!g.effects.some(f=>f.type==='split'));
    assert(!events.some(e=>e.type==='destroy'||e.type==='level-complete'));
    g.update(.02);const reloaded=new SkyGame(g.snapshot());assert.equal(reloaded.bossEncounter.index,phase+1);assert.equal(reloaded.run.bossHits,(phase+1)*40);
    assert(!reloaded.enemies.some(e=>e.boss),'The next encounter waits further down the level');
    tick(g,2);assert(!g.enemies.some(e=>e.boss),'No instant rematch at the first two encounter sites');
  }else{
    assert(g.effects.some(f=>f.type==='split'),'Final laser defeat cuts the rival in half');
    assert.equal(g.run.kills,1);g.projectiles=[];tick(g,.02);assert(g.run.complete);assert(g.save.completed.includes(7));
    assert.equal(events.filter(e=>e.type==='boss-retreat').length,2);assert.equal(events.filter(e=>e.type==='level-complete').length,1);
  }
}
for(const [hits,maxHp,remaining,x] of [[15,40,25,5350],[55,40,25,14750],[95,120,105,BOSS_X-250]]){
  const {g}=scene(hits,x),b=g.enemies.find(e=>e.boss);assert.equal(b.maxHp,maxHp);assert.equal(b.hp,remaining);
  const restored=new SkyGame(g.snapshot());assert.equal(restored.enemies.find(e=>e.boss).hp,remaining);
}
const explosion=scene(199,BOSS_X-250);const final=explosion.g.enemies.find(e=>e.boss);explosion.g.time=3;explosion.g.damage(final,'ram');assert.equal(final.hp,0);assert(explosion.g.particles.length>=50);assert(!explosion.g.effects.some(f=>f.type==='split'||f.type==='rival-teleport'));
// Existing near-the-end saves and players who fly past a fight need no backtracking.
const catchup=scene(0,BOSS_X-250);assert(catchup.g.enemies.some(e=>e.boss));catchup.g.damage(catchup.g.enemies.find(e=>e.boss),'laser',1000);tick(catchup.g,2);assert(catchup.g.enemies.some(e=>e.boss&&e.encounter===1));
const old=freshSave();old.level=7;old.completed=[0,1,2,3,4,5,6,7];old.runs[7].complete=true;old.runs[7].bossHits=180;
const migrated=readSave(old);assert(migrated.runs[7].complete);assert.equal(migrated.runs[7].bossHits,200);const replay=new SkyGame(migrated);replay.selectLevel(7);assert.equal(replay.bossEncounter.index,0);assert.equal(replay.run.bossHits,0);
console.log('Passed 40/40/120 spaced rival battles, teleport retreats without kills/victory/slicing, final laser split and ordinary explosion, overkill isolation, save/reload, catch-up and completed-save replay.');
