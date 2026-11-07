import assert from 'node:assert/strict';
import {SkyGame,freshSave,LEVELS} from '../engine.js';
import {Renderer} from '../art.js';
const strokes=[],stack=[];let points=[];
const state={globalAlpha:1,strokeStyle:'',fillStyle:'',lineWidth:1};
const c=new Proxy(state,{get(target,key){if(key in target)return target[key];if(key==='save')return()=>stack.push({...state});if(key==='restore')return()=>Object.assign(state,stack.pop());if(key==='measureText')return text=>({width:String(text).length*8});if(String(key).startsWith('create'))return()=>({addColorStop(){}});if(key==='beginPath')return()=>{points=[];};if(key==='moveTo'||key==='lineTo')return(x,y)=>points.push([x,y]);if(key==='stroke')return()=>strokes.push({color:state.strokeStyle,points:[...points]});return()=>{};}});
const canvas={width:430,height:600,getContext:()=>c,getBoundingClientRect:()=>({width:430,height:600})};
const save=freshSave();save.level=7;save.completed=[0,1,2,3,4,5,6];save.runs[7].position={x:LEVELS[7].bossEncounters[0].x-250,y:450};save.runs[7].frontier=LEVELS[7].bossEncounters[0].x-250;
const g=new SkyGame(save),r=new Renderer(canvas);r.sky=()=>{};r.architecture=()=>{};g.enemies=g.enemies.filter(e=>e.boss);
r.follow(g,0,true);const boss=g.enemies[0],keys=Object.keys(boss);r.draw(g,0);
assert.equal(r.rivalArrivals.get(boss),0);assert.deepEqual(Object.keys(boss),keys,'Rendering arrival adds no gameplay state');
g.time=.4;r.draw(g,0);assert.equal(r.rivalArrivals.get(boss),0,'Drawing again preserves the arrival clock');
g.paused=true;g.update(.5);r.draw(g,0);assert.equal(g.time,.4,'Arrival animation uses paused game time');
g.time=1;r.draw(g,0);assert.equal(r.rivalArrivals.get(boss),0,'A completed arrival does not restart while visible');
const returned={...boss};g.enemies=[returned];r.draw(g,0);assert.equal(r.rivalArrivals.get(returned),1,'A despawned and returned boss gets a new arrival');
g.enemies=[];g.effects=[{type:'split',robot:boss,x:boss.x,y:boss.y,age:.25,life:1}];strokes.length=0;r.draw(g,0);
const cuts=strokes.filter(s=>s.color==='#ffe7ec');assert.equal(cuts.length,2);for(const cut of cuts){assert.equal(cut.points.length,2);assert(Math.abs(cut.points[1][1]-cut.points[0][1])<=200,'The final rival slice stays within the roughly 180-unit body rather than using giant boss cut lines');}
console.log('Passed rival arrival lifecycle, pause-safe local presentation state, actual despawn/return, and silhouette-sized final slicing.');
