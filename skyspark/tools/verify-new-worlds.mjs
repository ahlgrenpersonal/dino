import assert from 'node:assert/strict';
import {SkyGame,freshSave,readSave,LEVELS,WORLD,BOSS_X,bossShieldUp} from '../engine.js';

assert(LEVELS.length>=5);
assert.deepEqual(LEVELS.slice(0,3).map(l=>l.bossHp),[24,36,48]);
assert.deepEqual(LEVELS.slice(3,5).map(l=>[l.id,l.biome,l.bossType,l.bossHp]),[
  ['caldera','volcano','crab',64],['spaceport','space','dreadnought',84]
]);
const bounds={left:BOSS_X-1500,right:WORLD.width,top:0,bottom:1000};
function scene(level){
  const save=freshSave();save.completed=Array.from({length:level},(_,i)=>i);save.level=level;
  save.runs[level].position={x:BOSS_X-400,y:500};save.runs[level].frontier=BOSS_X;
  const g=new SkyGame(save);g.syncEncounters=()=>{};g.enemies=g.enemies.filter(e=>e.boss);g.setViewport(bounds);
  const boss=g.enemies.find(e=>e.boss);assert(boss,`${LEVELS[level].name} boss spawns at the far edge`);boss.cd=1e6;
  return {g,boss};
}

// The new bosses use their distinct readable attack patterns, with slower shots
// than the hero's 470-unit flight speed and stronger but bounded impact power.
{
  const {g,boss}=scene(3);g.fireEnemy(boss);
  assert.equal(g.projectiles.length,5);assert(g.projectiles.every(q=>q.type==='orb'&&q.radius===22&&q.power===1.5));
  assert(g.projectiles.every(q=>Math.hypot(q.vx,q.vy)<470));assert.equal(g.effects.filter(f=>f.type==='enemy-beam').length,0);
}
{
  const {g,boss}=scene(4);g.fireEnemy(boss);
  assert.equal(g.projectiles.length,4);assert.deepEqual(g.projectiles.map(q=>q.type),['orb','missile','orb','missile']);
  assert(g.projectiles.every(q=>q.power===1.5&&Math.hypot(q.vx,q.vy)<470));
  const warning=g.effects.find(f=>f.type==='enemy-beam');assert(warning);assert.equal(warning.charge,1.15);
  assert.equal(g.impactHits,0,'Dreadnought beam has a visible charge before impact');
  for(let i=0;i<55;i++)g.update(.02,{},bounds);assert.equal(g.impactHits,0);
  for(let i=0;i<15;i++)g.update(.02,{},bounds);assert.equal(g.impactHits,1,'The charged beam reaches a stationary hero after its warning');
}
{
  const base=scene(4).g,powered=scene(4).g,capped=scene(4).g;
  for(const g of [base,powered,capped]){g.enemies=[];g.player.x=1000;g.player.y=500;}
  base.bodyImpact(1010,500,'missile',-1,0,1);powered.bodyImpact(1010,500,'missile',-1,0,1.5);capped.bodyImpact(1010,500,'missile',-1,0,4);
  for(const g of [base,powered,capped])for(let i=0;i<75;i++)g.update(.02);
  const shifts=[base,powered,capped].map(g=>1000-g.player.x);
  assert(Math.abs(shifts[0]-30)<.1);assert(Math.abs(shifts[1]-45)<.1);assert(Math.abs(shifts[2]-45)<.1,'Enhanced impacts cap at 45 units of body push');
  const escape=scene(4).g;escape.enemies=[];escape.player.x=1000;escape.player.y=500;escape.bodyImpact(1010,500,'missile',-1,0,1.5);for(let i=0;i<15;i++)escape.update(.02,{right:true});
  assert(escape.player.x>1000,'Flight controls can immediately escape a stronger impact');
}

// The current run shape accepts a legacy three-world schema-5 save, appends fresh worlds,
// and unlocks only Caldera after the original three campaigns are complete.
const oldShape=freshSave();oldShape.completed=[0,1,2];oldShape.level=2;
oldShape.runs[0].kills=81;oldShape.runs[1].bossHits=12;oldShape.runs[2].position={x:6500,y:400};
const oldThree=readSave({...oldShape,runs:oldShape.runs.slice(0,3)});
assert.equal(oldThree.runs.length,LEVELS.length);assert.equal(oldThree.runs[0].kills,81);assert.equal(oldThree.runs[1].bossHits,12);
assert.equal(oldThree.runs[2].position.x,6500);assert.equal(oldThree.runs[3].position.x,290);assert.equal(oldThree.runs[4].position.x,290);
assert.equal(new SkyGame(oldThree).selectLevel(3),true);assert.equal(new SkyGame(oldThree).selectLevel(4),false,'An old completed 3-world save unlocks world four only');
assert.equal(new SkyGame(freshSave()).selectLevel(3),false,'A fresh save cannot skip the first three worlds');

// Deterministic armor odds and the intended damage trade-off for every attack type.
for(const level of [3,4]){
  const {g}=scene(level),denominator=level===3?4:3,ids=Array.from({length:480},(_,i)=>`armor-probe-${i}`);
  const samples=ids.map(id=>g.robot(id,BOSS_X-250,g.player.y,'bot'));
  const ratio=samples.filter(e=>e.armored).length/samples.length;
  assert(Math.abs(ratio-1/denominator)<.015,`${LEVELS[level].name} armor spawn rate is near ${Math.round(100/denominator)}%`);
  const id=ids.find(candidate=>g.robot(candidate,BOSS_X-250,g.player.y,'bot').armored);
  assert(id);assert(g.robot(id,BOSS_X-250,g.player.y,'bot').armored,'Armor assignment is stable for a robot id');
  for(const [kind,remaining] of [['ram',1],['sphere',1],['spark',1.2],['laser',0]]){
    const h=scene(level),enemy=h.g.robot(id,BOSS_X-250,h.g.player.y,'bot');h.g.enemies.push(enemy);
    assert(enemy.armored);assert.equal(enemy.maxHp,2);assert(h.g.damage(enemy,kind));
    assert.equal(enemy.hp,remaining,`${kind} leaves ${remaining} armor on a 2-HP robot`);
    assert.equal(h.g.save.total,remaining===0?1:0);
  }
}

// Shield windows resist ordinary powers by 55%; a Big Blast does full damage and
// suppresses the shield for two seconds. Check both timing cycles and re-openings.
for(const [level,upEnd,shieldEnd] of [[3,3,6],[4,4,6]]){
  const {g,boss}=scene(level);
  assert(bossShieldUp(boss,0));assert(bossShieldUp(boss,upEnd-.01));
  assert(!bossShieldUp(boss,upEnd+.01));assert(!bossShieldUp(boss,shieldEnd-.01));
  assert(bossShieldUp(boss,shieldEnd+.01));
  assert(g.damage(boss,'laser'));assert.equal(Math.round((boss.maxHp-boss.hp)*10)/10,2.3,'A shielded five-damage laser is reduced by 55%');
  const open=scene(level);open.g.time=upEnd+.1;assert(!bossShieldUp(open.boss,open.g.time));
  open.g.damage(open.boss,'laser');assert.equal(open.boss.maxHp-open.boss.hp,5,'The open window takes the full laser hit');

  const blast=scene(level),b=blast.boss;blast.g.time=0;blast.g.player.x=b.x-400;blast.g.player.y=b.y;
  assert(bossShieldUp(b,blast.g.time));assert(blast.g.blast(bounds));
  for(let i=0;i<35;i++)blast.g.update(.02,{},bounds);
  assert.equal(b.maxHp-b.hp,1,'Big Blast keeps full damage against a raised shield');
  assert(b.shieldBrokenUntil>blast.g.time+1.4&&b.shieldBrokenUntil<=blast.g.time+2.1);
  assert(!bossShieldUp(b,blast.g.time),'The blast disrupts the raised shield');
  blast.g.time=b.shieldBrokenUntil-.01;assert(!bossShieldUp(b,blast.g.time));
  blast.g.time=b.shieldBrokenUntil+.01;assert(bossShieldUp(b,blast.g.time),'Shield returns after the two-second disruption');
}

// A hidden boss cannot take remote damage.
for(const level of [3,4]){
  const {g,boss}=scene(level),hp=boss.hp;
  g.setViewport({left:BOSS_X-3500,right:BOSS_X-2500,top:0,bottom:1000});
  assert.equal(g.damage(boss,'laser'),false);assert.equal(boss.hp,hp);
}

// Both new bosses can be defeated with the ordinary cooldowns, saved as complete,
// recovered as complete after reload, then replayed from a clean run.
for(const level of [3,4]){
  const {g}=scene(level);let seconds=0;
  while(!g.run.complete&&seconds<180){
    g.sparks(bounds);g.laser(bounds);g.blast(bounds);g.update(.02,{},bounds);seconds+=.02;
  }
  assert(g.run.complete,`${LEVELS[level].name} boss can be defeated with ordinary powers`);
  assert.equal(g.run.bossHits,LEVELS[level].bossHp);assert(g.save.completed.includes(level));
  const saved=g.snapshot(),restored=new SkyGame(saved);assert(restored.run.complete);
  assert.equal(restored.save.runs.length,LEVELS.length);assert(restored.enemies.length===0);
  assert(restored.selectLevel(level),'A completed advanced world remains replayable');
  assert(!restored.run.complete);assert.equal(restored.run.bossHits,0);assert.equal(restored.run.kills,0);assert.equal(restored.run.checkpoint,0);
}

console.log('Passed legacy three-world save extension and replay saves, unlock boundary, armor damage strengths, crab/dreadnought volleys and charged beam timing, boss shield cycles and Blast disruption, capped controllable knockback, and off-screen protection.');
