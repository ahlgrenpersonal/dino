import test from 'node:test';
import assert from 'node:assert/strict';
import {AREAS,HOME,freshSave,readSave,canWalk,campEnemyId,reconcileCampProgress} from '../world.js?v=world23';
import {MiamiAdventure} from '../engine.js?v=world23';
import {MiamiPainter} from '../painter.js?v=world23';

const openingIds=()=>Array.from({length:3},(_,i)=>Array.from({length:4},(_,j)=>campEnemyId(1,i,j))).flat();
function stale(camps=[]){return {...freshSave(),position:{x:119.8,y:65.5},hp:44,scrap:77,gears:9,defeated:openingIds(),camps};}

test('an empty opening chapter with missing camp credits is repaired and Count can be fought normally',()=>{
 const g=new MiamiAdventure(readSave(stale())),boss=g.enemies.find(e=>e.id==='boss-1');assert.equal(g.enemies.filter(e=>!e.boss).length,0);assert.equal(g.campsIn(1),3);assert(g.awake(boss));assert(canWalk(g.save,g.player));
 g.power();g.tap(boss);for(let i=0;i<300&&boss.hp>0;i++){if(g.tapCd===0)g.tap(boss);g.update(.05);}assert(boss.hp<=0);assert(g.save.cleared.includes('boss-1'));assert(g.save.owned.includes('neon'));assert.equal(g.save.unlocked,2);
});

test('legacy mainland aliases and a missing Key credit recover only from complete enemy defeat records',()=>{
 for(const camps of [['camp-0-0','camp-0-1','camp-1-2'],['camp-1-0','camp-1-1']]){const g=new MiamiAdventure(readSave(stale(camps)));assert.equal(g.campsIn(1),3);assert(g.awake(g.enemies.find(e=>e.id==='boss-1')));}
 const raw=freshSave();raw.camps=['camp-0-0','camp-0-1'];const g=new MiamiAdventure(readSave(raw));assert.equal(g.campsIn(1),0);assert.equal(g.enemies.filter(e=>!e.boss).length,12);assert(!g.awake(g.enemies.find(e=>e.id==='boss-1')));
});

test('reconciliation is idempotent and never gives currency, health, equipment or duplicate drops',()=>{
 const raw=stale();raw.owned.push('shield');const before=JSON.stringify({hp:raw.hp,scrap:raw.scrap,gears:raw.gears,owned:raw.owned,drops:raw.drops,position:raw.position,cleared:raw.cleared,claims:raw.equipmentClaims});assert.equal(reconcileCampProgress(raw).length,3);assert.deepEqual(reconcileCampProgress(raw),[]);assert.equal(JSON.stringify({hp:raw.hp,scrap:raw.scrap,gears:raw.gears,owned:raw.owned,drops:raw.drops,position:raw.position,cleared:raw.cleared,claims:raw.equipmentClaims}),before);
 const loaded=readSave(JSON.parse(JSON.stringify(raw)));assert.equal(loaded.hp,44);assert.equal(loaded.scrap,77);assert.equal(loaded.gears,9);assert.equal(loaded.camps.length,3);assert.equal(readSave(loaded).camps.length,3);
});

test('three of four defeated enemies leaves a real survivor and the boss locked',()=>{
 const s=freshSave();s.defeated=[0,1,2].map(j=>campEnemyId(1,0,j));const g=new MiamiAdventure(readSave(s)),remaining=g.enemies.filter(e=>e.camp===0&&!e.boss);assert.equal(remaining.length,1);assert.equal(g.campsIn(1),0);assert(!g.awake(g.enemies.find(e=>e.id==='boss-1')));g.hit(remaining[0],9999);assert.equal(g.campsIn(1),1);assert.equal(g.save.scrap,12);assert.equal(g.save.gears,2);
});

test('duplicate, unrelated and wrong-slot defeat IDs cannot unlock a camp',()=>{
 const s=freshSave();s.defeated=[...Array(4).fill('mob-1-0-0'),'mob-1-0-4','mob-2-0-1','boss-1'];const g=new MiamiAdventure(readSave(s));assert.equal(g.campsIn(1),0);assert(!g.awake(g.enemies.find(e=>e.id==='boss-1')));
});

test('world replay does not reuse the previous round defeat records to unlock Count',()=>{
 const s=readSave(stale());s.king=s.champion=true;s.unlocked=7;const g=new MiamiAdventure(s);assert(g.replay());assert.equal(g.campsIn(1),0);assert.equal(g.save.defeated.length,0);assert.equal(g.enemies.filter(e=>(e.chapter??e.area)===1&&!e.boss).length,12);assert(!g.awake(g.enemies.find(e=>e.id==='boss-1')));assert.equal(new MiamiAdventure(readSave(g.snapshot())).campsIn(1),0);
});

test('repairing the King camps still requires every earlier boss before his fight unlocks',()=>{
 const s=freshSave();s.champion=true;s.unlocked=7;s.defeated=Array.from({length:3},(_,i)=>Array.from({length:4},(_,j)=>campEnemyId(7,i,j))).flat();const g=new MiamiAdventure(readSave(s)),king=g.enemies.find(e=>e.king);assert.equal(g.campsIn(7),3);assert(!g.awake(king));s.cleared=AREAS.slice(1,7).map(a=>`boss-${a.id}`);g.save.cleared=s.cleared;assert(g.awake(king));
});

test('map and trail follow a surviving enemy that wandered away from an otherwise empty camp',()=>{
 const s=freshSave();s.camps=['camp-1-1','camp-1-2'];s.defeated=[0,1,2].map(j=>campEnemyId(1,0,j));s.position={...AREAS[1].camps[0]};const g=new MiamiAdventure(s),last=g.enemies.find(e=>e.id===campEnemyId(1,0,3));Object.assign(last,{x:101,y:74.5});const goal={x:last.x,y:last.y};assert(canWalk(g.save,goal));assert.deepEqual(g.nextObjective().position,goal);g.goNext();assert.deepEqual(g.route.at(-1),goal);
 const c=new Proxy({createLinearGradient:()=>({addColorStop(){}}),measureText:t=>({width:String(t).length*10})},{get:(o,k)=>k in o?o[k]:()=>{}}),canvas={getContext:()=>c},p=new MiamiPainter(canvas);p.map(canvas,g);assert.deepEqual(p.mapTargets.at(-1).destination,goal);
 for(let i=0;i<700&&last.hp>0;i++)g.update(.05);assert(last.hp<=0);assert.equal(g.campsIn(1),3);assert(g.awake(g.enemies.find(e=>e.id==='boss-1')));assert.equal(g.nextObjective().enemy.id,'boss-1');
});

test('the trail action repairs an inconsistent in-session ledger without re-awarding completed camps',()=>{
 const g=new MiamiAdventure(freshSave());g.save.defeated=openingIds();g.enemies=g.enemies.filter(e=>e.boss);const scrap=g.save.scrap;g.goNext();assert.equal(g.campsIn(1),3);assert.equal(g.target.id,'boss-1');assert.equal(g.save.scrap,scrap);
});
