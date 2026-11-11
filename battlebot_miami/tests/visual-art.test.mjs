import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {EQUIPMENT,WEAPONS,freshSave} from '../world.js?v=world24';
import {equipmentIcon} from '../bot-art.js?v=world24';
import {drawProjectile,drawAttackEffect} from '../combat-art.js?v=world24';
import {MiamiAdventure} from '../engine.js?v=world24';
import {MiamiPainter} from '../painter.js?v=world24';

function context(){
 let depth=0;const words=[],target={showLabels:false,globalAlpha:1,save(){depth++;},restore(){assert(depth>0,'balanced canvas stack');depth--;},fillText:s=>words.push(s),strokeText(){},createLinearGradient:(...args)=>{assert(args.every(Number.isFinite));return {addColorStop(offset){assert(offset>=0&&offset<=1);}};},measureText:s=>({width:String(s).length*10})};
 const c=new Proxy(target,{get:(o,k)=>k in o?o[k]:(...args)=>{for(const a of args)if(typeof a==='number')assert(Number.isFinite(a),`${String(k)} has finite coordinates`);}});
 return {c,words,depth:()=>depth};
}

test('every current and retained equipment drawing leaves a balanced, finite canvas without changing the catalog',()=>{
 const before=JSON.stringify(EQUIPMENT);
 for(const [type,items] of Object.entries(EQUIPMENT))for(const p of items)for(const t of [0,1.25]){const art=context();equipmentIcon(art.c,type,type==='weapon'?p.art:p.id,t);assert.equal(art.depth(),0,`${type}/${p.id}`);assert.equal(art.words.length,0);}
 assert.equal(JSON.stringify(EQUIPMENT),before);
});

test('actual engine attacks supply renderable projectile and beam identities without rendering altering combat',()=>{
 for(const w of WEAPONS){const s=freshSave();s.unlocked=7;s.weapon=s.build.weapon=w.id;s.owned.push(w.id);const g=new MiamiAdventure(s),e=g.enemies[0];g.player.x=95;g.player.y=73;Object.assign(e,{x:95+Math.min(1,w.range-.1),y:73,hp:1e6,maxHp:1e6});g.enemies=[e];g.attack(e,true);assert(g.projectiles.length||g.effects.length,w.id);
  for(const f of g.effects.filter(f=>f.type==='beam'))assert.equal(f.weapon,w.id);
  const before=JSON.stringify({save:g.save,projectiles:g.projectiles,effects:g.effects,enemy:e}),art=context();for(const q of g.projectiles)drawProjectile(art.c,q,.3,w.color);for(const f of g.effects)drawAttackEffect(art.c,f,.7);assert.equal(art.depth(),0,w.id);assert.equal(JSON.stringify({save:g.save,projectiles:g.projectiles,effects:g.effects,enemy:e}),before);
 }
});

test('the locked royal boss displays its lock before the Power-and-tap guard cue becomes relevant',()=>{
 globalThis.devicePixelRatio=1;globalThis.matchMedia=()=>({matches:false});
 for(const awake of [false,true]){const art=context(),canvas={width:390,height:550,getContext:()=>art.c,getBoundingClientRect:()=>({width:390,height:550})},s=freshSave();s.unlocked=7;if(awake)s.camps=[0,1,2].map(i=>`camp-6-${i}`);s.position={x:98,y:16};const g=new MiamiAdventure(s),p=new MiamiPainter(canvas);p.camera={...s.position};p.draw(g,0);assert.equal(art.words.includes('ϟ ☝'),awake);assert.equal(art.words.includes('🔒'),!awake);}
});

test('both new artwork modules are included in the offline app shell',async()=>{
 const sw=await readFile(new URL('../sw.js',import.meta.url),'utf8');for(const name of ['equipment-art.js','combat-art.js'])assert(sw.includes(`'${name}?v=world24'`),name);
});
