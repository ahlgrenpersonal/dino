import test from 'node:test';
import assert from 'node:assert/strict';
import {HoldConfirmation,bindHoldConfirmation} from '../hold-confirm.js?v=world96';
function fixture(){
  const button=new EventTarget();button.disabled=false;button.style={setProperty(){}};button.setPointerCapture=()=>{};button.getBoundingClientRect=()=>({left:0,top:0,right:100,bottom:70});
  const callbacks=new Map(),window=new EventTarget(),document=new EventTarget();document.hidden=false;let time=0,id=0,confirmed=0;
  const env={window,document,performance:{now:()=>time},requestAnimationFrame:cb=>{callbacks.set(++id,cb);return id;},cancelAnimationFrame:id=>callbacks.delete(id)};
  const cleanup=bindHoldConfirmation(button,()=>confirmed++,env);
  const emit=(target,type,fields={})=>{const e=new Event(type,{cancelable:true});Object.assign(e,fields);target.dispatchEvent(e);};
  const advance=ms=>{time+=ms;const pending=[...callbacks.values()];callbacks.clear();for(const cb of pending)cb();};
  return {button,window,document,emit,advance,cleanup,count:()=>confirmed,down:()=>emit(button,'pointerdown',{button:0,pointerId:1,isPrimary:true}),up:()=>emit(button,'pointerup',{pointerId:1})};
}
test('two seconds must be continuous; cancellation resets the full hold',()=>{let n=0;const h=new HoldConfirmation(()=>n++);h.begin(0);assert.equal(h.advance(1999),.9995);assert.equal(n,0);h.cancel();h.begin(3000);h.advance(4999);assert.equal(n,0);h.advance(5000);assert.equal(n,1);h.advance(9000);assert.equal(n,1);});
test('a normal click and a short press never restart',()=>{const f=fixture();f.emit(f.button,'click');f.down();f.advance(1900);f.up();f.advance(5000);assert.equal(f.count(),0);f.cleanup();});
test('a completed pointer hold confirms exactly once, even if held longer',()=>{const f=fixture();f.down();f.advance(2000);assert.equal(f.count(),1);f.advance(5000);f.up();assert.equal(f.count(),1);f.cleanup();});
for(const type of ['pointercancel','lostpointercapture'])test(`${type} cancels a partial hold`,()=>{const f=fixture();f.down();f.advance(1500);f.emit(f.button,type,{pointerId:1});f.advance(3000);assert.equal(f.count(),0);f.cleanup();});
test('dragging outside the button cancels rather than confirming',()=>{const f=fixture();f.down();f.advance(1900);f.emit(f.button,'pointermove',{pointerId:1,clientX:101,clientY:20});f.advance(1000);assert.equal(f.count(),0);f.cleanup();});
test('losing focus or hiding the app cancels the hold',()=>{const f=fixture();f.down();f.advance(1000);f.emit(f.window,'blur');f.advance(3000);assert.equal(f.count(),0);f.down();f.advance(1000);f.document.hidden=true;f.emit(f.document,'visibilitychange');f.advance(3000);assert.equal(f.count(),0);f.cleanup();});
test('closing or replacing the dialog disposes every hold handler',()=>{const f=fixture();f.down();f.advance(1500);f.cleanup();f.advance(3000);f.down();f.advance(3000);assert.equal(f.count(),0);});
for(const key of [' ','Enter'])test(`${key===' '?'Space':'Enter'} supports a deliberate keyboard hold, not a tap`,()=>{const f=fixture();f.emit(f.button,'keydown',{key,repeat:false});f.advance(1000);f.emit(f.button,'keyup',{key});f.advance(3000);assert.equal(f.count(),0);f.emit(f.button,'keydown',{key,repeat:false});f.advance(2000);assert.equal(f.count(),1);f.emit(f.button,'keydown',{key,repeat:true});f.advance(3000);assert.equal(f.count(),1);f.cleanup();});
test('secondary touches and disabled buttons cannot start a hold',()=>{const f=fixture();f.emit(f.button,'pointerdown',{button:0,pointerId:2,isPrimary:false});f.advance(3000);assert.equal(f.count(),0);f.button.disabled=true;f.down();f.advance(3000);assert.equal(f.count(),0);f.cleanup();});
