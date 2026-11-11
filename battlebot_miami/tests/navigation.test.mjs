import test from 'node:test';
import assert from 'node:assert/strict';
import {MiamiPainter} from '../painter.js?v=world20';
import {MiamiAdventure} from '../engine.js?v=world20';
import {freshSave,LANDMARKS,HOME,canWalk,dist} from '../world.js?v=world20';
import {mountAtlas} from '../atlas.js?v=world20';
import {bindWorldNavigation} from '../world-input.js?v=world20';

function canvas(){const el=new EventTarget();el.width=600;el.height=760;el.getContext=()=>new Proxy({measureText:s=>({width:String(s).length*10}),createLinearGradient:()=>({addColorStop(){}})},{get:(o,k)=>k in o?o[k]:()=>{}});el.getBoundingClientRect=()=>({left:42,top:100,width:300,height:380});el.setPointerCapture=()=>{};el.focus=()=>{};return el;}
function pointer(el,type,x,y,id=1,extra={}){const e=new Event(type,{cancelable:true});Object.assign(e,{clientX:x,clientY:y,pointerId:id,pointerType:'touch',button:0,...extra});el.dispatchEvent(e);}

test('tapping a visible landmark badge routes to its actual public destination, including badge pixels over water',()=>{
 for(const [id,unlocked] of [['key-park',1],['cape-florida',7]]){
  const g=new MiamiAdventure(freshSave());g.save.unlocked=unlocked;g.enemies=[];const painter=new MiamiPainter(canvas());painter.map(canvas(),g);const l=LANDMARKS.find(l=>l.id===id),{s,ox,oy}=painter.mapTransform,pixel={x:ox+l.x*s+28,y:oy+l.y*s};
  assert(!canWalk(g.save,{x:(pixel.x-ox)/s,y:(pixel.y-oy)/s}),'the old raw terrain check rejects this visible picture');
  const goal=painter.mapDestination(pixel,g.save);assert.deepEqual(goal,{x:l.x,y:l.y});g.moveTo(goal);assert(g.route.length);for(let i=0;i<12000&&g.route.length;i++)g.update(.05);assert(dist(g.player,l)<.2);
 }
});

test('atlas land taps retain exact coordinates while empty water, private land and locked places stay ignored',()=>{
 const g=new MiamiAdventure(freshSave()),painter=new MiamiPainter(canvas());painter.map(canvas(),g);const {s,ox,oy}=painter.mapTransform,toMap=p=>({x:ox+p.x*s,y:oy+p.y*s});
 const goal={x:99,y:90};assert.deepEqual(painter.mapDestination(toMap(goal),g.save),goal);
 for(const p of [{x:121,y:72},{x:98,y:16},{x:145,y:75}])assert.equal(painter.mapDestination(toMap(p),g.save),null);
 assert.equal(painter.mapDestination({x:NaN,y:1},g.save),null);
});

test('atlas pointer taps unproject correctly after zoom, pan and a container resize; drags and pinches never travel',()=>{
 globalThis.devicePixelRatio=2;const oldObserver=globalThis.ResizeObserver;globalThis.ResizeObserver=class{constructor(fn){this.fn=fn;}observe(){this.fn();}disconnect(){}};
 try{const el=canvas(),selected=[],control=mountAtlas(el,{source:{},onSelect:p=>selected.push(p),onChange:()=>{}});control.zoomBy(2);
  pointer(el,'pointerdown',302,410);pointer(el,'pointerup',302,410);assert.deepEqual(selected.pop(),{x:410,y:500});
  pointer(el,'pointerdown',180,250);pointer(el,'pointermove',210,250);pointer(el,'pointerup',210,250);assert.equal(selected.length,0);
  // Thirty CSS pixels panned the source by sixty logical pixels.
  pointer(el,'pointerdown',302,410);pointer(el,'pointerup',302,410);assert.deepEqual(selected.pop(),{x:380,y:500});
  pointer(el,'pointerdown',150,200,1);pointer(el,'pointerdown',220,200,2);pointer(el,'pointermove',240,200,2);pointer(el,'pointerup',150,200,1);pointer(el,'pointerup',240,200,2);assert.equal(selected.length,0);
  control.reset();el.getBoundingClientRect=()=>({left:10,top:20,width:600,height:760});pointer(el,'pointerdown',420,520);pointer(el,'pointerup',420,520);assert.deepEqual(selected.pop(),{x:410,y:500});control.destroy();
  pointer(el,'pointerdown',420,520);pointer(el,'pointerup',420,520);assert.equal(selected.length,0);
 }finally{globalThis.ResizeObserver=oldObserver;}
});

test('playfield taps and twenty-pixel drags steer; attacks, extra fingers, pause and cancellation remain separate',()=>{
 const el=canvas(),taps=[],moves=[];let paused=false,combat=false;const stop=bindWorldNavigation(el,{point:e=>({x:e.clientX,y:e.clientY}),paused:()=>paused,tap:p=>{taps.push(p);return !combat;},move:p=>moves.push(p)});
 pointer(el,'pointerdown',100,100);pointer(el,'pointermove',110,100);assert.equal(moves.length,0);pointer(el,'pointerdown',200,100,2);assert.equal(taps.length,1);pointer(el,'pointermove',125,100);assert.deepEqual(moves.pop(),{x:125,y:100});pointer(el,'pointerup',125,100);pointer(el,'pointermove',160,100);assert.equal(moves.length,0);
 combat=true;pointer(el,'pointerdown',100,100);pointer(el,'pointermove',150,100);pointer(el,'pointercancel',150,100);assert.equal(moves.length,0);
 paused=true;pointer(el,'pointerdown',100,100);assert.equal(taps.length,2);paused=false;combat=false;pointer(el,'pointerdown',100,100);pointer(el,'lostpointercapture',100,100);pointer(el,'pointermove',150,100);assert.equal(moves.length,0);stop();
});

test('ground taps near an ordinary monster walk instead of selecting an oversized combat hit area',()=>{
 const g=new MiamiAdventure(freshSave());Object.assign(g.player,{x:115,y:66.5});const e={id:'nearby',area:1,x:117,y:66.5,hp:100,maxHp:100,cd:100,home:{x:117,y:66.5}};g.enemies=[e];
 g.tap({x:118.1,y:66.5},40);assert.equal(g.target,null);assert(g.route.length);assert(dist(g.route.at(-1),{x:118.1,y:66.5})<.01);g.tap(e,40);assert.equal(g.target,e);
});

test('a visible ground tap cannot select an offscreen enemy, while the mission helper can',()=>{
 const g=new MiamiAdventure(freshSave());g.viewBounds={left:90,right:97,top:78,bottom:85};const e={id:'offscreen',area:0,chapter:1,x:97.4,y:81,hp:100,maxHp:100,cd:100,home:{x:97.4,y:81}};g.enemies=[e];g.tap({x:96.7,y:81},40);assert.equal(g.target,null);assert(dist(g.route.at(-1),{x:96.7,y:81})<.01);g.tap(e);assert.equal(g.target,e);
});

test('playfield screen coordinates still move to the tapped ground with the wider camera',()=>{
 globalThis.devicePixelRatio=1;const g=new MiamiAdventure(freshSave());g.enemies=[];const el=canvas(),painter=new MiamiPainter(el);painter.camera={...HOME};painter.resize();const goal=painter.worldPoint(180,190);assert(canWalk(g.save,goal));g.tap(goal,painter.scale);for(let i=0;i<1000&&g.route.length;i++)g.update(.05);assert(dist(g.player,goal)<.2);
});
