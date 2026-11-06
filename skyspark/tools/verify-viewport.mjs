import assert from 'node:assert/strict';
import {SkyGame,freshSave,WEAPONS} from '../engine.js';
import {Renderer} from '../art.js';
const view={left:800,right:1300,top:300,bottom:650};
function scene(){const g=new SkyGame(freshSave());g.syncEncounters=()=>{};g.enemies=[];g.auraCd=1e6;g.player.x=1000;g.player.y=500;g.setViewport(view);return g;}
function enemy(g,x,y,boss=false){const e=g.robot(`fixture-${g.enemies.length}`,x,y,'fixture');e.cd=1e6;if(boss)Object.assign(e,{boss:true,type:'titan',hp:12,maxHp:12,radius:115});g.enemies.push(e);return e;}
function tick(g,s,bounds){for(let i=0;i<Math.ceil(s/.02);i++)g.update(.02,{},bounds);}

// Exact regression: firing repeatedly into empty space must never kill an unseen boss.
let g=scene(),boss=enemy(g,1750,467,true);
for(let i=0;i<4;i++){g.laser(view);tick(g,2.02);}
assert.equal(boss.hp,12);assert.equal(g.run.bossHits,0);assert.equal(g.run.kills,0);assert(!g.run.complete);
// A visible target must not let the same piercing beam hit a hidden boss behind it.
g=scene();enemy(g,1180,467);boss=enemy(g,1750,467,true);g.laser(view);tick(g,.64);
assert.equal(g.run.kills,1);assert.equal(boss.hp,12);
// Recheck a moving camera and delayed impacts, rather than storing visibility at cast time.
g=scene();enemy(g,1180,467);boss=enemy(g,1450,250,true);
g.laser({...view,right:1700});tick(g,.64,view);assert.equal(boss.hp,12);
g=scene();enemy(g,1150,500);const outside=enemy(g,1400,500);g.sparks(view);tick(g,1.2);assert.equal(outside.hp,.8);assert.equal(g.run.kills,1);
g=scene();enemy(g,1150,500);const departing=enemy(g,1250,500);g.sparks(view);tick(g,.2,{...view,right:1200});assert.equal(departing.hp,.8);assert.equal(g.run.kills,1);

// The bigger blast reaches visible targets at its new edge, never hidden targets in the same radius.
assert.equal(WEAPONS.blastRadius,450*1.25);
g=scene();const hidden=enemy(g,1500,500);g.blast(view);tick(g,.6);assert.equal(hidden.hp,.8);
g=scene();const reached=enemy(g,1530,500),tooFar=enemy(g,1610,500);g.blast({...view,right:1800});tick(g,.6);assert.equal(reached.hp,0);assert.equal(tooFar.hp,.8);
g=scene();const leavingBlast=enemy(g,1250,500);g.blast(view);tick(g,.6,{...view,right:1200});assert.equal(leavingBlast.hp,.8);

// All damage sources share the same guard, including above/below/left and diagonal corners.
for(const [x,y] of [[700,500],[1450,500],[1000,200],[1000,750],[1320,670]])for(const kind of ['laser','chain','sphere','spark','ram']){
  g=scene();const e=enemy(g,x,y);assert(!g.damage(e,kind));assert.equal(e.hp,.8);assert.equal(g.run.kills,0);assert.equal(g.save.total,0);
}
g=scene();boss=enemy(g,1450,500,true);assert(!g.damage(boss,'laser'));g.setViewport({...view,right:1700});assert(g.damage(boss,'laser'));assert.equal(boss.hp,7,'The boss takes the usual five damage once visible');

// Real renderer bounds across portrait, landscape and resizing protect a boss inside laser range.
for(const [width,height] of [[390,600],[844,260],[320,370]]){
  g=scene();let size={width,height};const canvas={width:300,height:150,getContext:()=>({}),getBoundingClientRect:()=>size};
  const renderer=new Renderer(canvas);renderer.follow(g,0,true);const bounds=renderer.bounds();
  boss=enemy(g,bounds.right+120,g.player.y,true);g.laser(bounds);tick(g,.64,bounds);assert.equal(boss.hp,12,`${width}x${height}: hidden boss is protected`);
  size={width:width*.7,height};renderer.resize();renderer.follow(g,0,true);g.setViewport(renderer.bounds());assert(!g.damage(boss,'laser'));
}
assert.equal(WEAPONS.sparksCooldown,1);assert.equal(WEAPONS.laserCooldown,2);assert.equal(WEAPONS.blastCooldown,2.2);
console.log('Passed repeated off-screen boss lasers, piercing rays, delayed chains/blasts and camera changes, all damage sources on all viewport edges, resized phone viewports, visible boss damage and 25% larger blast radius.');
