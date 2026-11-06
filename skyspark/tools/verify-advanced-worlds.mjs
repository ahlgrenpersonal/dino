import assert from 'node:assert/strict';
import {SkyGame,freshSave,readSave,LEVELS,WORLD,BOSS_X,bossShieldUp} from '../engine.js';

assert.equal(LEVELS.length,8);
assert.deepEqual(LEVELS.slice(5).map(l=>[l.biome,l.bossType,l.bossHp]),[
  ['desert','scarab',90],['ocean','leviathan',100],['citadel','rival',200]
]);
const bounds={left:BOSS_X-1500,right:WORLD.width,top:0,bottom:1000};
function scene(level){
  const save=freshSave();save.completed=Array.from({length:level},(_,i)=>i);save.level=level;
  save.runs[level].position={x:BOSS_X-450,y:500};save.runs[level].frontier=BOSS_X;
  const g=new SkyGame(save);g.syncEncounters=()=>{};g.enemies=g.enemies.filter(e=>e.boss);g.setViewport(bounds);
  const boss=g.enemies.find(e=>e.boss);assert(boss);boss.cd=1e6;return {g,boss};
}
const tick=(g,seconds,keys={},view=bounds)=>{for(let i=0;i<Math.ceil(seconds/.02);i++)g.update(.02,keys,view);};

// Existing five-world saves extend without changing their progress or skipping locks.
{
  const raw=freshSave();raw.runs=raw.runs.slice(0,5);raw.completed=[0,1,2,3,4];raw.level=4;
  raw.total=1234;raw.runs[4].position={x:12500,y:420};raw.runs[4].bossHits=17;raw.runs[2].kills=74;
  const save=readSave(raw);assert.equal(save.runs.length,8);assert.equal(save.total,1234);
  assert.deepEqual(save.runs[4].position,{x:12500,y:420});assert.equal(save.runs[4].bossHits,17);assert.equal(save.runs[2].kills,74);
  assert.equal(save.runs[5].position.x,290);assert(new SkyGame(save).selectLevel(5));
  assert(!new SkyGame(save).selectLevel(6));assert(!new SkyGame(save).selectLevel(7));
}

// Three-health units are rare, larger ground troops. Flying units stay light.
for(const level of [5,6,7]){
  const {g}=scene(level),samples=Array.from({length:1200},(_,i)=>g.robot(`${LEVELS[level].id}-heavy-probe-${i}`,BOSS_X-300,500,'bot'));
  const heavies=samples.filter(e=>e.maxHp===3),ratio=heavies.length/samples.length;
  assert(ratio>.04&&ratio<.13,`${LEVELS[level].name}: three-HP troops remain rare, got ${ratio}`);
  assert(samples.filter(e=>e.maxHp===.8).length>samples.length*.45,'Most troops still shatter immediately');
  assert(heavies.every(e=>e.radius>=40&&e.heavy),'Heavy troops have a bulkier collision silhouette');
  for(let i=0;i<1200;i++)assert(g.robot(`air-probe-${i}`,1000,400,'drone').maxHp<=2,'No three-health flying swarms');
  const id=heavies[0].id;assert.equal(g.robot(id,BOSS_X-300,500,'bot').maxHp,3,'Heavy assignment is stable');
  for(const [kind,hp] of [['ram',2],['sphere',2],['spark',2.2],['laser',0]]){
    const {g:h}=scene(level),e=h.robot(id,BOSS_X-300,500,'bot');h.enemies.push(e);assert(h.damage(e,kind));assert.equal(e.hp,hp);
  }
}

// Off-screen bosses remain immune to accidental remote attacks in every new biome.
for(const level of [5,6,7]){
  const {g,boss}=scene(level),hp=boss.hp;
  const far={left:BOSS_X-4000,right:BOSS_X-3000,top:0,bottom:1000};g.setViewport(far);
  for(const kind of ['ram','sphere','spark','laser'])assert(!g.damage(boss,kind));
  g.sparks(far);g.laser(far);g.blast(far);tick(g,2,{},far);assert.equal(boss.hp,hp);
}

// A real pilot flies back into range after recoil rather than teleporting or reducing HP.
const fights=[];
for(const level of [5,6,7]){
  const {g,boss}=scene(level);boss.cd=.1;let seconds=0;
  while(!g.run.complete&&seconds<300){
    const p=g.player,view={left:p.x-650,right:p.x+650,top:0,bottom:1000};
    if(level===7){SkyGame.prototype.syncEncounters.call(g,view);g.enemies=g.enemies.filter(e=>e.boss);}
    const active=g.enemies.find(e=>e.boss&&e.hp>0)||boss;
    const dx=active.x-400-p.x,dy=active.y-p.y;
    g.sparks(view);g.laser(view);g.blast(view);
    g.update(.02,{right:dx>55,left:dx< -55,down:dy>90,up:dy< -90},view);seconds+=.02;
  }
  assert(g.run.complete,`${LEVELS[level].name}: full-health boss is beatable with normal cooldowns and recovery flight`);
  assert.equal(g.run.bossHits,LEVELS[level].bossHp);assert(g.save.completed.includes(level));
  const saved=g.snapshot(),restored=new SkyGame(saved);assert(restored.run.complete);assert(restored.selectLevel(level));
  assert(!restored.run.complete);assert.equal(restored.run.bossHits,0);fights.push(Math.round(seconds));
}
console.log(`Passed eight-world save extension, progression locks, rare bulky three-health ground troops, weapon damage, off-screen protection and full-health advanced boss fights (${fights.join('/')} seconds scripted).`);

// New charged attacks warn, lock their aim, and vanish when their owner is defeated.
for(const level of [5,6,7]){
  const {g,boss}=scene(level);g.fireEnemy(boss);g.projectiles=[];
  const f=g.effects.find(f=>f.type==='enemy-beam');assert(f);assert(f.charge>=1.1);
  const origin={x:f.x,y:f.y,tx:f.tx,ty:f.ty};tick(g,f.charge-.04);
  assert.equal(g.impactHits,0,'The warning cannot hit early');
  assert.deepEqual({x:f.x,y:f.y,tx:f.tx,ty:f.ty},origin,'Charged attacks lock their origin and aim');
  tick(g,.1);assert.equal(g.impactHits,1,'A stationary hero is hit once when the warning fires');
  tick(g,.5);assert.equal(g.impactHits,1,'A beam does not apply repeated recoil every frame');
  const dodge=scene(level);dodge.g.fireEnemy(dodge.boss);dodge.g.projectiles=[];
  tick(dodge.g,.7,{up:true});tick(dodge.g,1);assert.equal(dodge.g.impactHits,0,'Flight can dodge a locked charged beam');
  const cancelled=scene(level);cancelled.g.fireEnemy(cancelled.boss);cancelled.g.projectiles=[];
  cancelled.boss.hp=0;tick(cancelled.g,2);assert.equal(cancelled.g.impactHits,0,'Defeated owners leave no ghost charge attack');
}

// The robotic counterpart cycles through distinct orange laser, magenta lightning,
// and an orange radial blast. Every one can be erased by each of the hero's powers.
for(let mode=0;mode<3;mode++)for(const weapon of ['sparks','laser','blast']){
  const {g,boss}=scene(7);boss.attacks=mode;g.fireEnemy(boss);
  const f=g.effects.find(f=>['enemy-beam','enemy-blast'].includes(f.type));assert(f);
  assert.equal(boss.cd,3.8,'Counterpart attacks leave time to recover');
  if(mode===0){assert.equal(f.shove,1100);assert.equal(f.tint,'#ff8a32');}
  if(mode===1){assert.equal(f.shove,180);assert.equal(f.skin,'spark');assert.equal(f.tint,'#ff49b3');}
  if(mode===2){assert.equal(f.type,'enemy-blast');assert.equal(f.shove,400);assert.equal(f.radius,330);assert(f.charge>=1.1);}
  assert(g[weapon](bounds));tick(g,.7);assert(f.cancelled,`${weapon} erases counterpart attack ${mode}`);
  tick(g,1.5);assert.equal(g.impactHits,0,'A cleared warning cannot fire afterward');
}
for(const [width,expected] of [[390,650],[900,810],[1800,1100]]){
  const {g,boss}=scene(7);g.setViewport({left:BOSS_X-width,right:BOSS_X,top:0,bottom:1000});
  g.fireEnemy(boss);assert.equal(g.effects.find(f=>f.type==='enemy-beam').shove,expected,'Laser recoil scales with viewport and remains bounded');
}
{
  const {g,boss}=scene(7);boss.attacks=2;g.player.x=boss.x-180;g.player.y=boss.y;g.fireEnemy(boss);
  tick(g,1.05);assert.equal(g.impactHits,0);tick(g,.4);assert.equal(g.impactHits,1,'Counterpart blast hits once as the expanding wave reaches the body');
  const dodge=scene(7);dodge.boss.attacks=2;dodge.g.player.x=dodge.boss.x-180;dodge.g.player.y=dodge.boss.y;dodge.g.fireEnemy(dodge.boss);
  tick(dodge.g,1.5,{left:true});assert.equal(dodge.g.impactHits,0,'A hero can fly outside the radial warning before it fires');
}

// Large knockback displaces the hero substantially while preserving facing,
// respecting bounds, allowing immediate steering, and causing no contact punches.
function recoil(){const {g}=scene(7);g.enemies=[];g.effects=[];g.projectiles=[];g.player.x=5000;g.player.y=500;g.player.facing=1;return g;}
for(const shove of [140,200,300,400,810,1100,5000]){
  const g=recoil();g.bodyImpact(5100,500,'beam',-1,0,1,shove);tick(g,2,{},undefined);
  assert(Math.abs(5000-g.player.x-Math.min(shove,1100))<.4,'Recoil distance matches its bounded design distance');
  assert.equal(g.player.facing,1,'Frontal recoil never turns the hero away');
}
{
  const g=recoil();g.bodyImpact(5100,500,'beam',-1,0,1,810);tick(g,.5,{},undefined);
  assert(g.player.x<4400,'The counterpart can knock the hero most of a screen away');
  tick(g,2,{right:true},undefined);assert(g.player.x>5000,'Immediate flight input can recover the distance');assert.equal(g.player.facing,1);
  const edge=recoil();edge.player.x=45;edge.bodyImpact(100,500,'beam',-1,0,1,1100);tick(edge,.2,{},undefined);
  assert.equal(edge.player.x,40);assert.equal(edge.player.kickX,0);tick(edge,1,{right:true},undefined);assert(edge.player.x>450,'World boundary cannot trap a recoiling hero');
  const vertical=recoil();vertical.bodyImpact(5000,400,'beam',0,1,1,1100);tick(vertical,.5,{},undefined);
  assert.equal(vertical.player.y,WORLD.ground-48);assert.equal(vertical.player.kickY,0);tick(vertical,1,{up:true},undefined);assert(vertical.player.y<500);
  const noPunch=recoil(),e=noPunch.robot('recoil-contact',4800,500,'bot');e.hp=e.maxHp=3;e.cd=1e6;noPunch.enemies=[e];
  noPunch.bodyImpact(5100,500,'beam',-1,0,1,400);tick(noPunch,2,{},undefined);assert.equal(e.hp,3,'Knockback passing through an enemy never becomes a punch');
}
console.log('Passed charged warning timing and fixed aim, dodge and owner cancellation, every power clearing every rival hazard, viewport-sized recoil, facing preservation, recovery flight, bounds escape and no recoil punches.');

for(const [level,count,shove] of [[5,4,200],[6,5,300]]){
  const {g,boss}=scene(level);g.fireEnemy(boss);assert.equal(g.projectiles.length,count);
  assert(g.projectiles.every(q=>q.shove===shove&&Math.hypot(q.vx,q.vy)<200&&q.radius>=23),'Boss fans use large, slow, forceful projectiles');
}
{
  const {g}=scene(5);const e=Array.from({length:300},(_,i)=>g.robot(`heavy-fire-${i}`,BOSS_X-300,700,'bot')).find(e=>e.heavy);
  assert(e);g.enemies=[e];g.fireEnemy(e);assert.equal(g.projectiles.length,1);assert.equal(g.projectiles[0].shove,140);assert.equal(e.cd,4.5);
}
for(const weapon of ['sparks','laser','blast']){
  const g=recoil();g.setViewport({left:4400,right:5600,top:0,bottom:1000});
  const q={id:'heavy-round',type:'orb',x:5300,y:467,vx:-170,vy:0,radius:27,shove:300,age:0,life:8,trail:[]};
  g.projectiles=[q];assert(g[weapon]());tick(g,.7,{},undefined);
  assert(q.cleared,`${weapon} destroys a strong incoming shot`);assert.equal(g.impactHits,0);assert.equal(g.run.kills,0);
}
console.log('Passed slow strong boss fans, heavy soldier fire and all three powers clearing enhanced incoming rounds.');
