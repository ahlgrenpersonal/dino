import assert from 'node:assert/strict';
import {SkyGame,freshSave,ROCK_ATTACK,excavatorWheel,hitShapes,BOSS_X,WORLD} from '../engine.js';
import {Renderer} from '../art.js';
const view={left:BOSS_X-1400,right:WORLD.width,top:100,bottom:1000};
const tick=(g,s,keys={})=>{for(let i=0;i<Math.ceil(s/.01);i++)g.update(.01,keys);};
function scene(){
  const save=freshSave();save.level=1;save.completed=[0];save.runs[1].position={x:BOSS_X-700,y:530};save.runs[1].frontier=BOSS_X+80;
  const g=new SkyGame(save);g.syncEncounters=()=>{};g.enemies=g.enemies.filter(e=>e.boss);g.auraCd=1e6;g.setViewport(view);g.enemies[0].cd=0;
  return g;
}
let g=scene();const boss=g.enemies[0];assert.equal(boss.id,'plains-boss');assert.equal(boss.hp,36);
g.update(.01);assert.equal(g.projectiles.length,0);const cue=g.effects.find(f=>f.type==='rock-windup');assert(cue);assert.equal(cue.charge,1.05);
boss.cd=1e6;tick(g,.98);assert.equal(g.projectiles.length,0,'No surprise rocks before the visible windup');
g.paused=true;const age=cue.age;tick(g,2);assert.equal(cue.age,age);g.paused=false;tick(g,.08);
assert.equal(g.projectiles.length,3);assert(g.projectiles.every(q=>q.type==='rock'&&q.radius>=32&&Math.hypot(q.vx,q.vy)<470));
assert.equal(new Set(g.projectiles.map(q=>q.vx)).size,3,'The volley spreads into distinct arcs');
const q=g.projectiles[1],vy=q.vy;tick(g,.2);assert(q.vy>vy,'Gravity bends the rock trajectory');
g.paused=true;const rockState=JSON.stringify(g.projectiles);tick(g,2);assert.equal(JSON.stringify(g.projectiles),rockState);g.paused=false;
tick(g,3);assert(g.impactHits>0,'A hovering hero receives a harmless impact');assert.equal(g.player.hp,undefined);assert.equal(g.run.kills,0);

g=scene();g.update(.01);g.enemies[0].cd=1e6;tick(g,1.06);const vx=new Map(g.projectiles.map(q=>[q.id,q.vx]));tick(g,.6,{up:true});assert(g.projectiles.every(q=>q.vx===vx.get(q.id)),'Rocks never home after release');tick(g,3);assert.equal(g.impactHits,0,'Fast flight dodges the slow volley');
g=scene();g.update(.01);g.enemies[0].cd=1e6;g.damage(g.enemies[0],'laser',36);tick(g,2);assert.equal(g.projectiles.length,0,'Boss defeat cancels the rock windup');assert(!g.effects.some(f=>f.type==='rock-windup'));
g=scene();g.setViewport({left:BOSS_X-3500,right:BOSS_X-2500,top:0,bottom:1000});g.fireEnemy(g.enemies[0]);assert(!g.effects.some(f=>f.type==='rock-windup'),'An invisible mining machine cannot start a throw');assert(!g.damage(g.enemies[0],'laser'));
g=scene();g.update(.01);g.enemies[0].cd=1e6;g.setViewport({left:BOSS_X-3500,right:BOSS_X-2500,top:0,bottom:1000});tick(g,1.2);assert.equal(g.projectiles.length,0,'Leaving view during windup cancels the hidden throw');assert.equal(g.enemies[0].rockWindupUntil,0);

// Actual rock projectiles use the same defensive weapon paths as enemy missiles.
for(const power of ['sparks','laser','blast']){
  g=scene();const owner=g.enemies[0];owner.cd=1e6;g.throwRocks(owner,{tx:g.player.x,ty:g.player.y});
  const rock=g.projectiles[0];g.projectiles=[rock];rock.x=g.player.x+180;rock.y=g.player.y-33;rock.vx=0;rock.vy=0;rock.gravity=0;
  g.enemies=[];g[power](view);tick(g,.25);assert.equal(g.projectiles.length,0,`${power} shatters a boulder`);assert.equal(g.shotsCleared,1);assert.equal(g.run.kills,0);assert.equal(g.run.bossHits,0);assert(g.particles.length>0);
}
g=scene();g.enemies[0].cd=1e6;g.throwRocks(g.enemies[0],{tx:g.player.x,ty:530});const impact=g.projectiles[0];g.projectiles=[impact];impact.x=g.player.x;impact.y=530;impact.vx=0;impact.vy=0;impact.gravity=0;g.update(.01,{right:true});assert.equal(g.shotsCleared,1,'A flying punch shatters rock');assert.equal(g.impactHits,0);

g=scene();g.enemies[0].cd=1e6;g.damage(g.enemies[0],'laser');const reloaded=new SkyGame(g.snapshot());assert.equal(reloaded.enemies.find(e=>e.boss).hp,31);assert.equal(reloaded.enemies.find(e=>e.boss).id,'plains-boss');assert.equal(reloaded.projectiles.length,0);
const wheel=excavatorWheel(g.enemies[0]);assert(hitShapes(g.enemies[0]).some(([x,y,r])=>x===-330&&y===-280&&r>=165));assert.equal(wheel.radius,165);
// A full focused boss fight uses live cooldowns and finishes through normal powers.
g=scene();let volleys=0;g.onEvent=e=>{if(e.type==='rock-throw')volleys++;};tick(g,6);assert(volleys>=2,'Observe two complete windup/release cycles before fighting');
for(let i=0;i<2000&&!g.run.complete;i++){g.laser(view);g.sparks(view);g.blast(view);g.update(.01);}
assert(g.run.complete);assert.equal(g.run.bossHits,36);assert(g.save.completed.includes(1));assert.equal(g.projectiles.length,0);
assert(g.selectLevel(1));assert(!g.run.complete);assert.equal(g.run.bossHits,0,'The new mining boss remains infinitely replayable');
const canvas={width:390,height:600,getContext:()=>({}),getBoundingClientRect:()=>({width:390,height:600})};const r=new Renderer(canvas);r.follow(scene(),0,true);assert(r.scale<r.baseScale,'Portrait encounter camera reveals the giant wheel and tower');
assert.equal(ROCK_ATTACK.interval,3.8);
console.log('Passed mining boss windup, three ballistic rocks, pause, dodging, shield impacts, every weapon interception, flying punches, defeat cancellation, off-screen protection, save/reload, two attack cycles, complete boss fight and replay.');
