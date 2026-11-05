import assert from 'node:assert/strict';
import {SkyGame,freshSave,LEVELS,WEAPONS} from '../engine.js';
const tick=(g,s,keys={})=>{for(let i=0;i<Math.ceil(s/.02);i++)g.update(.02,keys);};
function scene(type='bot',boss=false){
  const g=new SkyGame(freshSave());g.syncEncounters=()=>{};g.auraCd=1e6;g.player.x=1000;g.player.y=boss?500:200;
  const e=g.robot('test-attacker',boss?1500:1600,boss?500:800,type);
  if(boss){const l=LEVELS.find(l=>l.bossType===type);Object.assign(e,{boss:true,name:l.boss,maxHp:l.bossHp,hp:l.bossHp,radius:115});}
  e.cd=0;g.enemies=[e];return {g,e};
}
for(const type of ['bot','drone']){
  const {g,e}=scene(type);g.update(.02);assert.equal(g.projectiles.length,1,`${type} can fire at a flying hero 600 units above the ground`);
  const q=g.projectiles[0];assert(q.radius>=12);assert(Math.hypot(q.vx,q.vy)<220);assert.equal(g.shieldHits,0,'Launching is not an immediate hit');
  e.cd=1e6;const pos={x:q.x,y:q.y},age=q.age;g.paused=true;tick(g,2,{right:true});assert.equal(q.x,pos.x);assert.equal(q.y,pos.y);assert.equal(q.age,age);g.paused=false;
  tick(g,6);assert.equal(g.shieldHits,1,'A stationary hero receives a real projectile impact');assert.equal(g.projectiles.length,0);assert.equal(g.save.total,0);assert.equal(g.run.bossHits,0);assert.equal(g.player.x,1000);assert.equal(g.player.y,200,'Impact does not knock the hero back');assert.equal(g.player.hp,undefined);
  const dodge=scene(type);dodge.g.update(.02);dodge.e.cd=1e6;tick(dodge.g,1.2,{right:true});tick(dodge.g,7);assert.equal(dodge.g.shieldHits,0,'Flying away dodges shots aimed at the previous position');assert.equal(dodge.g.projectiles.length,0,'Missed shots expire');
}
for(const type of ['titan','excavator','wyvern']){
  const {g,e}=scene(type,true);g.update(.02);assert.equal(g.projectiles.length,type==='excavator'?3:2,`${type} launches a missile volley`);assert(g.projectiles.every(q=>q.type==='missile'&&Math.hypot(q.vx,q.vy)>200&&Math.hypot(q.vx,q.vy)<220));
  const beams=g.effects.filter(f=>f.type==='enemy-beam');assert.equal(beams.length,type==='excavator'?0:1);
  if(type==='excavator'){e.cd=1e6;tick(g,3);assert(g.shieldHits>0,'The excavator volley reaches a stationary hero');continue;}
  g.projectiles=[];e.cd=1e6;const beam=beams[0];tick(g,.5);assert.equal(g.shieldHits,0,'Green laser gives a visible warning before hitting');
  g.paused=true;const age=beam.age;tick(g,2);assert.equal(beam.age,age);g.paused=false;tick(g,.5);assert.equal(g.shieldHits,1);assert(g.player.shield>0);tick(g,.5);assert.equal(g.shieldHits,1,'One beam gives one shield impact');
  const dodge=scene(type,true);dodge.g.update(.02);dodge.g.projectiles=[];dodge.e.cd=1e6;const warning=dodge.g.effects.find(f=>f.type==='enemy-beam'),target={x:warning.tx,y:warning.ty};tick(dodge.g,.45,{up:true});tick(dodge.g,1);assert.equal(dodge.g.shieldHits,0,'Moving away from the warning dodges the boss laser');assert.deepEqual({x:warning.tx,y:warning.ty},target,'The telegraphed target does not chase the hero');
  const cancelled=scene(type,true);cancelled.g.update(.02);cancelled.g.projectiles=[];cancelled.g.damage(cancelled.e,'laser',cancelled.e.maxHp);tick(cancelled.g,1.4);assert.equal(cancelled.g.shieldHits,0,'Destroying a charging boss cancels its beam');
}
const cap=scene();for(let i=0;i<150;i++)cap.g.fireEnemy(cap.e);assert.equal(cap.g.projectiles.length,96,'Projectile count stays bounded');
const blast=scene();assert(blast.g.blast());assert.equal(blast.g.blastCd,2.5);assert.equal(WEAPONS.blastCooldown,2.5);tick(blast.g,2.4);assert(!blast.g.blast());tick(blast.g,.12);assert(blast.g.blast(),'Big Blast recharges in 2.5 seconds');
console.log('Passed ranged ground/drone fire, slow large shots, real shield impacts, dodging, pause, all boss volleys, telegraphed green beams, defeated-boss cancellation, projectile limits and 2.5-second Blast recharge.');
