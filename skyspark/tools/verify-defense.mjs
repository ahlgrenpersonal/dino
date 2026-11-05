import assert from 'node:assert/strict';
import {SkyGame,freshSave} from '../engine.js';
const tick=(g,s)=>{for(let i=0;i<Math.ceil(s/.02);i++)g.update(.02);};
function scene(){const g=new SkyGame(freshSave());g.syncEncounters=()=>{};g.enemies=[];g.auraCd=1e6;g.player.x=1000;g.player.y=500;return g;}
function shot(g,x,y,kind='orb',vx=0,vy=0){const q={id:`shot-${++g.attackSequence}`,type:kind,x,y,vx,vy,radius:kind==='orb'?12:15,age:0,life:7,trail:[]};g.projectiles.push(q);return q;}
function beam(g){const e={...g.robot('owner',2000,640,'titan'),boss:true,hp:12,maxHp:12,cd:1e6};g.enemies.push(e);const f={type:'enemy-beam',id:`beam-${++g.attackSequence}`,owner:e.id,x:2000,y:500,tx:1000,ty:500,age:0,charge:.95,fire:.35,life:1.4,hit:false};g.effects.push(f);return f;}
let g=scene();shot(g,1300,500);shot(g,1000,850,'missile');const outside=shot(g,1600,500);g.blast();tick(g,.6);assert.equal(g.shotsCleared,2);assert.deepEqual(g.projectiles,[outside]);assert.equal(g.run.kills,0);assert.equal(g.save.total,0,'Fire clearance never inflates robot counters');
// New incoming fire is intercepted before it can contact the hero, including a whole-frame crossing.
g=scene();g.blast();tick(g,.56);shot(g,1600,500,'missile',-18000,0);g.update(.04);assert.equal(g.shotsCleared,1);assert.equal(g.shieldHits,0);
g=scene();shot(g,1400,500);g.blast();g.paused=true;tick(g,1);assert.equal(g.shotsCleared,0);g.paused=false;tick(g,.6);assert.equal(g.shotsCleared,1);
// A beam can be cleared while charging or firing; neither becomes a ghost shield hit afterward.
for(const age of [0,1.02]){g=scene();const f=beam(g);f.age=age;g.blast();tick(g,.04);assert(f.cancelled);assert.equal(g.shotsCleared,1);assert.equal(g.shieldHits,0);}
g=scene();shot(g,1250,467);shot(g,1450,400,'missile');const untouched=shot(g,1300,750);assert(g.laser());tick(g,.6);assert.equal(g.shotsCleared,2,'Laser targets and sweeps through incoming fire even without robots');assert(g.projectiles.includes(untouched));assert.equal(g.run.kills,0);
g=scene();g.laser();shot(g,1300,400,'missile',0,2400);g.update(.04);assert.equal(g.shotsCleared,1,'Moving fire crossing the laser is cut rather than tunneling through');
g=scene();const green=beam(g);assert(g.laser());assert(green.cancelled);tick(g,.7);assert.equal(g.shieldHits,0);
g=scene();for(let i=0;i<16;i++)shot(g,1150+i*100,500,i%2?'missile':'orb');assert(g.sparks());tick(g,1.14);assert.equal(g.projectiles.length,0);assert.equal(g.shotsCleared,16);assert.equal(g.run.kills,0);
g=scene();const warning=beam(g);assert(g.sparks());assert(warning.cancelled);assert.equal(g.shotsCleared,1);tick(g,1.1);assert.equal(g.shieldHits,0);
// Shots close to arcs are cleared in addition to the sixteen robot targets.
g=scene();g.enemies=Array.from({length:16},(_,i)=>g.robot(`robot-${i}`,1150+i*90,500,'fixture'));for(const e of g.enemies)e.cd=1e6;shot(g,1250,530);assert(g.sparks());tick(g,1.14);assert.equal(g.run.kills,16);assert.equal(g.shotsCleared,1);
console.log('Passed Blast area/beam clearing, incoming-shot interception priority, pause, defensive laser sweeps, moving-shot crossings, lightning fire-only targets, sixteen-robot preservation and honest kill counters.');
