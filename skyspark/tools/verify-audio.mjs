import assert from 'node:assert/strict';
import {Sound} from '../audio.js';
class Param {
  constructor(){this.value=0;this.cancelled=0;}
  setValueAtTime(v){this.value=v;}
  linearRampToValueAtTime(v){this.value=v;}
  exponentialRampToValueAtTime(v){this.value=v;}
  cancelScheduledValues(){this.cancelled++;}
}
class Node {
  constructor(){this.gain=new Param();this.frequency=new Param();this.disconnected=false;}
  connect(){}disconnect(){this.disconnected=true;}start(){}stop(){}
}
class Context {
  constructor(state='suspended',clock=0){this.state=state;this.currentTime=clock;this.destination={};this.resumeCalls=0;this.closed=0;this.nodes=[];this.failResume=false;this.throwNode=false;}
  createGain(){const n=new Node();this.nodes.push(n);return n;}
  createOscillator(){if(this.throwNode)throw Error('Temporary audio failure');const n=new Node();this.nodes.push(n);return n;}
  createBufferSource(){return new Node();}createBuffer(){return{};}
  resume(){this.resumeCalls++;if(this.failResume){this.failResume=false;return Promise.reject(Error('Try the next gesture'));}this.state='running';return Promise.resolve();}
  close(){this.closed++;this.state='closed';return Promise.resolve();}
}
const settle=async()=>{await Promise.resolve();await Promise.resolve();};
let wall=0;const made=[];
const sound=new Sound({now:()=>wall,createContext:()=>{const c=new Context(made.length?'suspended':'interrupted',made.length?2:90);made.push(c);return c;}});
sound.unlock();await settle();assert.equal(made[0].resumeCalls,1);assert(sound.active,'Interrupted context resumes on an ordinary gesture');
sound.update(false);assert(sound.beat>0);assert(sound.next>=90);
const first=made[0],firstMaster=sound.master;
first.state='closed';sound.unlock();await settle();assert.equal(made.length,2);assert(firstMaster.disconnected);assert(sound.next<3,'New context resets the old scheduling clock');
const second=made[1];sound.foreground();sound.unlock();await settle();assert.equal(made.length,3);assert.equal(second.closed,1,'Foreground replaces a potentially frozen running context');
const third=made[2];third.state='interrupted';third.failResume=true;sound.unlock();await settle();assert(!sound.active,'A rejected resume is not reported as active');
sound.unlock();await settle();assert(sound.active);assert.equal(third.resumeCalls,3);
sound.setEnabled(false);sound.foreground();sound.unlock();await settle();assert.equal(made.length,3);assert(!sound.active);assert(!sound.enabled,'Muted foreground never enables audio');
sound.toggle();await settle();assert(sound.enabled&&sound.active);assert.equal(made.length,4);assert.equal(third.closed,1,'Unmute rebuilds the graph inside its user gesture');
sound.update(true);assert.equal(sound.master.gain.value,0);assert(sound.master.gain.cancelled>0);
sound.ctx.currentTime+=12;sound.update(false);assert.equal(sound.master.gain.value,.22);assert(sound.next<sound.ctx.currentTime+1);
sound.ctx.throwNode=true;assert.doesNotThrow(()=>sound.update(false));assert.doesNotThrow(()=>sound.effect('laser'));assert(sound.recoverOnGesture);
sound.unlock();await settle();assert.equal(made.length,5);assert(sound.active);
sound.update(false);wall+=2000;sound.unlock();await settle();assert.equal(made.length,6,'Frozen running clock is detected on the next gesture');

// A pending old resume cannot re-enable audio after mute or context replacement.
let resolveResume;const delayed=new Context('suspended');delayed.resume=()=>new Promise(resolve=>{resolveResume=()=>{delayed.state='running';resolve();};});
const late=new Sound({createContext:()=>delayed});late.unlock();late.setEnabled(false);resolveResume();await settle();assert(!late.active);assert.equal(late.master.gain.value,0);
let finishOld;const oldContext=new Context('suspended',80),newContext=new Context('running',2);
oldContext.resume=()=>new Promise(resolve=>{finishOld=()=>{oldContext.state='running';resolve();};});
let creations=0;const swapped=new Sound({createContext:()=>creations++?newContext:oldContext});swapped.unlock();swapped.foreground();swapped.unlock();await settle();
const newMaster=swapped.master,next=swapped.next;finishOld();await settle();assert.equal(swapped.ctx,newContext);assert.equal(swapped.master,newMaster);assert.equal(swapped.next,next);assert(swapped.active);assert.equal(newMaster.gain.value,.22);
console.log('Passed interrupted/closed/frozen audio recovery, scheduler reset, rejection retry, mute/unmute, pause/resume, graph cleanup, stale promises and safe node failures.');
