import test from 'node:test';
import assert from 'node:assert/strict';
import {powerState,bindPowerControl} from '../power-control.js';
import {Adventure} from '../engine.js';
import {freshSave} from '../data.js';

function fixture(){
  const button=new EventTarget();button.disabled=false;let n=0;
  const cleanup=bindPowerControl(button,()=>n++);
  const emit=(type,fields={})=>{const e=new Event(type,{cancelable:true});Object.assign(e,fields);button.dispatchEvent(e);return e;};
  return {button,emit,cleanup,count:()=>n};
}
test('ready is the only yellow/enabled state; active and cooldown both show seconds',()=>{
  assert.deepEqual(powerState({boostTime:0,boostCd:0}),{active:false,waiting:false,disabled:false,label:'Power'});
  assert.deepEqual(powerState({boostTime:5.1,boostCd:27}),{active:true,waiting:true,disabled:true,label:'SUPER 6s'});
  assert.deepEqual(powerState({boostTime:0,boostCd:.1}),{active:false,waiting:true,disabled:true,label:'1s'});
});
test('activates on contact, without waiting for release or a completed click',()=>{
  const f=fixture();assert.equal(f.emit('pointerdown',{button:0,isPrimary:true}).defaultPrevented,true);assert.equal(f.count(),1);
  f.emit('pointercancel');assert.equal(f.count(),1);f.cleanup();
});
test('second finger can activate power while another finger controls the world',()=>{
  const f=fixture();f.emit('pointerdown',{button:0,isPrimary:false,pointerId:2});assert.equal(f.count(),1);f.cleanup();
});
test('compatibility clicks do not double activate; keyboard/accessibility clicks work',()=>{
  const f=fixture();f.emit('pointerdown',{button:0});f.emit('click',{detail:1});assert.equal(f.count(),1);
  f.emit('click',{detail:0});assert.equal(f.count(),2);f.cleanup();
});
test('disabled and non-left inputs do not activate, and cleanup removes listeners',()=>{
  const f=fixture();f.button.disabled=true;f.emit('pointerdown',{button:0});f.emit('click',{detail:0});f.button.disabled=false;f.emit('pointerdown',{button:2});assert.equal(f.count(),0);
  f.cleanup();f.emit('pointerdown',{button:0});assert.equal(f.count(),0);
});
test('movement, attack animation, automatic and tap cooldowns cannot block a ready boost',()=>{
  const g=new Adventure(freshSave());g.player.cd=10;g.player.swing=.6;g.tapCd=1.5;g.route=[{x:g.player.x+1,y:g.player.y}];
  assert.equal(g.boost(),true);assert.equal(g.boostTime,6);assert.equal(g.boostCd,28);assert.equal(g.player.invincible,1);
  assert.equal(g.boost(),false);assert.equal(g.boostCd,28);
});
