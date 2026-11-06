import assert from 'node:assert/strict';
import {SkyGame,freshSave} from '../engine.js';
function scene(x=1000){const g=new SkyGame(freshSave());g.syncEncounters=()=>{};g.enemies=[];g.player.x=x;g.player.y=500;const e=g.robot('contact-boss',1250,500,'fixture');Object.assign(e,{boss:true,hp:30,maxHp:30,radius:70,cd:1e6});g.enemies=[e];return {g,e};}
function tick(g,s,keys={}){for(let i=0;i<Math.ceil(s/.01);i++)g.update(.01,keys);}
let {g,e}=scene();tick(g,.45,{right:true});assert.equal(e.hp,29,'Entry causes exactly one punch');tick(g,5);assert.equal(e.hp,29,'Hovering causes no damage tick');tick(g,.08,{left:true});tick(g,.08,{right:true});assert.equal(e.hp,29,'Wiggling within contact does not rearm');
tick(g,.65,{left:true});tick(g,.8,{right:true});assert.equal(e.hp,28,'A real retreat and return causes one fresh punch');tick(g,4);assert.equal(e.hp,28);
({g,e}=scene(1250));tick(g,4);assert.equal(e.hp,30,'Starting overlapped is harmless');tick(g,.1,{right:true});assert.equal(e.hp,30,'Moving while already inside is not a new punch');
({g,e}=scene());e.homeX=1000;e.x=1000;tick(g,3);assert.equal(e.hp,30,'An enemy walking into a stationary hero cannot damage itself');
({g,e}=scene(1120));g.bodyImpact(1050,500,'rock',1,0);tick(g,2);assert.equal(e.hp,30,'Knockback alone never punches');
({g,e}=scene(1250));e.boss=false;e.hp=.8;e.maxHp=.8;tick(g,5);assert.equal(e.hp,.8,'There is no passive contact aura damage to ordinary enemies');
({g,e}=scene());g.moveTo(1250,500);tick(g,1);assert.equal(e.hp,29,'Tap-to-smash performs one punch');tick(g,3);assert.equal(e.hp,29);
console.log('Passed one punch per deliberate entry, retreat-to-rearm, hover/starting-overlap safety, no wiggle farming, harmless enemy contact, knockback isolation and no passive aura damage.');
