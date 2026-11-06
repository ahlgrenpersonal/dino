import assert from 'node:assert/strict';
import {VictoryReturn,worldMenuHTML} from '../world-menu.js';
import {SkyGame,freshSave,LEVELS} from '../engine.js';
import {worldPicture} from '../art.js';

const flow=new VictoryReturn();assert(!flow.active);assert(!flow.tick(10));
flow.start(0);assert.equal(flow.remaining,3);assert(!flow.tick(2.9));
assert(!flow.tick(100,true),'Pause/background time must not eat the celebration');
assert(Math.abs(flow.remaining-.1)<1e-6);assert(flow.tick(.1));assert(!flow.active);
assert(!flow.tick(20),'Only one automatic return per victory');
flow.start(1);flow.cancel();assert(!flow.tick(5),'Opening the map early or entering another world cancels the old return');
flow.start(2);assert(flow.tick(3.5),'A slow animation frame still returns after three real seconds');

let save=freshSave(),html=worldMenuHTML(save);
assert.equal((html.match(/data-level=/g)||[]).length,LEVELS.length,'All worlds are visible from the start');
assert.equal((html.match(/ disabled/g)||[]).length,LEVELS.length-1);assert(!html.includes('just-finished'));
for(let level=0;level<LEVELS.length;level++){
  save.level=level;save.completed=Array.from({length:level},(_,i)=>i);save.runs[level].bossHits=LEVELS[level].bossHp;
  const game=new SkyGame(save);game.update(.02);assert(game.run.complete);
  save=game.snapshot();html=worldMenuHTML(save,level);
  assert.equal((html.match(/just-finished/g)||[]).length,1);
  assert.equal((html.match(/world-medal/g)||[]).length,1,'Only the just-finished world gets the trophy');
  assert(html.includes(`data-level="${level}" aria-label="${level+1}. ${LEVELS[level].name} — just completed, play again"`));
  assert.equal((html.match(/ disabled/g)||[]).length,Math.max(0,LEVELS.length-2-level));
  assert(game.selectLevel(level),'Completed world is immediately replayable');assert(!game.run.complete);assert.equal(game.run.kills,0);
}
const victory=new SkyGame(freshSave());victory.syncEncounters=()=>{};
victory.enemies=[victory.robot('remaining',victory.player.x+250,victory.player.y)];
victory.projectiles=[{id:'old-shot',x:2000,y:500,vx:0,vy:0,radius:12,age:0,life:7,trail:[]}];
victory.run.bossHits=LEVELS[0].bossHp;victory.update(.02);
assert.equal(victory.projectiles.length,0,'Victory clears leftover enemy fire');
victory.enemies[0].cd=0;victory.update(.02);assert.equal(victory.projectiles.length,0,'No shooting during the celebration');
const gradient={addColorStop(){}};
const context=new Proxy({}, {get:(_,name)=>name==='createLinearGradient'||name==='createRadialGradient'?()=>gradient:(...args)=>{for(const n of args)if(typeof n==='number')assert(Number.isFinite(n),`${String(name)} has a finite coordinate`);}});
for(let i=0;i<LEVELS.length;i++)worldPicture({width:720,height:240,getContext:()=>context},i);
console.log(`Passed three-second real-time victory return, pause and cancellation, one-shot transitions, all ${LEVELS.length} illustrated cards, unlocks, recent-only medal and automatic replay.`);
