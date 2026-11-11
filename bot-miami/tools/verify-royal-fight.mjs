import test from 'node:test';
import assert from 'node:assert/strict';
import {Adventure} from '../engine.js?v=world96';
import {freshSave,REGIONS,RETURNS,PANTHEON,EQUIPMENT,canWalk,pathfind} from '../data.js?v=world96';
const advance=(g,s)=>{for(let t=0;t<s;t+=.05)g.tick(.05);};
function fixture(){const s=freshSave();Object.assign(s,{bosses:REGIONS.map((_,r)=>r),returns:RETURNS.filter(m=>!m.postRoyal).map(m=>m.id),position:{...PANTHEON.stairTop},intro:true});s.owned=Object.values(EQUIPMENT).flat().map(p=>p.id);s.build={weapon:'supernova',armor:'star',wheels:'hover',gadget:'aegis'};s.hp=715;const g=new Adventure(s);g.player.cd=1e6;return g;}
function start(){const g=fixture();advance(g,5.1);assert.ok(g.royals.start());return g;}

test('an early animation timestamp cannot rewind the gate countdown',()=>{
  const g=fixture();g.tick(-.01);assert.equal(g.royals.inspect,0);assert.equal(g.time,0);
});
test('five seconds of quiet observation never auto-starts; pause and departure stop the inspection',()=>{
  const g=fixture();assert.equal(g.royals.start(),false);advance(g,3);g.paused=true;advance(g,20);assert.equal(g.royals.ready,false);g.paused=false;
  g.player.y=213.5;advance(g,.1);assert.equal(g.royals.inspect,0);g.player.y=205.5;advance(g,4.9);assert.equal(g.royals.ready,false);advance(g,.2);assert.equal(g.royals.ready,true);
  advance(g,10);assert.equal(g.royals.phase,'sleeping');assert.equal(g.enemies.filter(e=>e.royal).length,0);assert.ok(g.royals.start());assert.equal(g.royals.start(),false);
});
test('all four sentinels awaken together while the royal pair remains frozen and invulnerable',()=>{
  const g=start(),guards=g.royals.units.filter(e=>e.role==='guard'),regents=g.royals.units.filter(e=>e.role!=='guard');
  assert.equal(guards.filter(e=>g.enemyAwake(e)).length,4);for(const e of regents){g.hitEnemy(e,1e8);assert.equal(e.hp,e.maxHp);assert.equal(g.enemyAwake(e),false);}
  assert.ok(g.route.length,'the player backs down the steps for a safe head start');
  for(const e of guards.slice(0,3))g.hitEnemy(e,1e8);assert.equal(g.royals.phase,'guards');g.hitEnemy(guards[3],1e8);assert.equal(g.royals.phase,'awakening');
  advance(g,2);assert.ok(regents.every(e=>!g.enemyAwake(e)));advance(g,1.2);assert.equal(g.royals.phase,'regents');assert.ok(regents.every(e=>g.enemyAwake(e)));
});
test('sentinels rally, descend the one staircase and reach the player instead of getting stuck',()=>{
  const g=start();g.hurt=()=>{};advance(g,40);
  assert.equal(g.royals.rallying,false);assert.ok(g.royals.units.filter(e=>e.role==='guard').every(e=>e.y>=207));
  assert.ok(g.royals.units.filter(e=>e.role==='guard').some(e=>e.swing>0||e.cd>0));
});
test('only living awakened regents self-heal; no sentinel or defeated monarch can revive',()=>{
  const g=start();for(const e of g.royals.units.filter(e=>e.role==='guard')){e.hp-=100;const hp=e.hp;advance(g,.1);assert.equal(e.hp,hp);g.hitEnemy(e,1e8);}
  advance(g,3.2);g.hurt=()=>{};const king=g.royals.units.find(e=>e.role==='king'),queen=g.royals.units.find(e=>e.role==='queen');
  king.hp-=200;queen.hp-=200;const a=king.hp,b=queen.hp;advance(g,2);assert.ok(king.hp>a&&king.hp<king.maxHp);assert.ok(queen.hp>b&&queen.hp<queen.maxHp);
  g.hitEnemy(king,1e8);advance(g,5);assert.equal(king.hp,0);assert.ok(g.royals.units.filter(e=>e.role==='guard').every(e=>e.hp===0));
});
test('the king fires twin rockets and queen releases a charged beam from their actual weapon origins',()=>{
  const g=start();for(const e of g.royals.units.filter(e=>e.role==='guard'))g.hitEnemy(e,1e8);advance(g,3.2);
  g.telegraphs=[];g.projectiles=[];for(const e of g.royals.units.filter(e=>e.role!=='guard')){g.royals.warn(e);const warnings=g.telegraphs.filter(a=>a.bossSource===e.id);assert.equal(warnings.length,e.role==='king'?2:1);assert.ok(warnings.every(a=>a.duration===2&&a.royal));for(const a of warnings)g.releaseBoss(a,e);}
  assert.equal(g.projectiles.filter(p=>p.enemy&&p.kind==='rocket'&&p.royal).length,2);assert.ok(g.effects.some(e=>e.type==='rail'&&e.royal));
});
test('save/reload preserves both stages and victory rewards cannot repeat',()=>{
  const g=start(),guard=g.royals.units.find(e=>e.role==='guard');g.hitEnemy(guard,1e8);let reload=new Adventure(structuredClone(g.snapshot()));assert.equal(reload.royals.phase,'guards');assert.equal(reload.royals.units.find(e=>e.id===guard.id).hp,0);
  for(const e of reload.royals.units.filter(e=>e.role==='guard'&&e.hp>0))reload.hitEnemy(e,1e8);advance(reload,3.2);reload.royals.units.find(e=>e.role==='king').hp-=123;
  reload=new Adventure(structuredClone(reload.snapshot()));assert.equal(reload.royals.phase,'regents');const king=reload.royals.units.find(e=>e.role==='king');assert.ok(king.hp<king.maxHp);
  for(const e of reload.royals.units.filter(e=>e.role!=='guard'))reload.hitEnemy(e,1e8);assert.equal(reload.royals.phase,'victory');const snapshot=structuredClone(reload.snapshot()),again=new Adventure(structuredClone(snapshot));advance(again,20);assert.equal(again.save.scrap,snapshot.scrap);assert.equal(again.save.gears,snapshot.gears);assert.equal(again.royals.phase,'victory');
});
test('escape, protected workshop repairs and one-coin rescues remain available throughout the fight',()=>{
  const g=start();g.save.scrap=10;g.player.x=532.5;g.player.y=213.5;g.player.invincible=0;g.boostTime=0;
  assert.ok(g.goHome());assert.ok(g.route.length);g.shieldCd=100;g.hurt(1e8);assert.equal(g.save.scrap,9);assert.equal(g.player.hp,g.maxHp());assert.equal(g.safeAt(g.player),true);assert.equal(g.royals.phase,'guards');
  assert.ok(pathfind(g.world,g.save,g.player,PANTHEON.viewpoint).length);for(const key of g.world.courtWalls)assert.ok(g.world.blocks.has(key));assert.equal(canWalk(g.world,g.save,532,204),true);
});
