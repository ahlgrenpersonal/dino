import test from 'node:test';
import assert from 'node:assert/strict';
import {AdventureSaves,adventureSummary,validAdventure} from '../adventure-saves.js?v=world97';
import {freshSave,REGIONS,RETURNS,EQUIPMENT,PANTHEON} from '../data.js?v=world97';
const key='test-adventure',date=new Date(0).toISOString();
class Storage {
  constructor(){this.map=new Map();this.writes=[];}
  getItem(key){return this.map.get(key)??null;}
  setItem(key,value){this.writes.push(key);this.map.set(key,value);}
  removeItem(key){this.map.delete(key);}
}
function complete(){const s=freshSave();Object.assign(s,{scrap:917,gears:31,totalBots:1543,playSeconds:4321,bosses:REGIONS.map((_,r)=>r),returns:RETURNS.map(m=>m.id),completed:true,position:{...PANTHEON.viewpoint},royalCourt:{endurance:2,phase:'victory',mobs:[]},patrols:{sample:{round:2,due:700,mobs:[{i:0,x:10,y:20,hp:27}]}},kills:['boss-0-0'],cleared:['site-0-0']});s.owned=Object.values(EQUIPMENT).flat().map(p=>p.id);s.build={weapon:'supernova',armor:'star',wheels:'hover',gadget:'aegis'};s.hp=321;return s;}
function fixture(){const storage=new Storage(),saves=new AdventureSaves({storage,key,now:()=>date});storage.setItem(key,JSON.stringify(complete()));storage.writes=[];return {storage,saves};}

test('restart preserves the exact latest snapshot and writes a truly fresh active adventure',()=>{
  const {storage,saves}=fixture(),snapshot=complete();snapshot.scrap++;saves.restart(snapshot);
  assert.deepEqual(JSON.parse(storage.getItem(key)),freshSave());assert.deepEqual(saves.readBackup().backup.save,snapshot);
  assert.deepEqual(storage.writes,[saves.backupKey,key]);assert.equal(saves.readBackup().backup.savedAt,date);assert.equal(saves.readBackup().status,'ready');
});
test('each restart replaces the single backup; ordinary autosaves never replace it',()=>{
  const {storage,saves}=fixture();saves.restart(complete());const backup=storage.getItem(saves.backupKey),newRun=freshSave();newRun.scrap=11;storage.setItem(key,JSON.stringify(newRun));assert.equal(storage.getItem(saves.backupKey),backup);
  saves.restart(newRun);assert.deepEqual(saves.readBackup().backup.save,newRun);assert.equal(storage.map.size,2);
});
test('restore returns all inventory, resources, royal victory, patrols and progress without altering the backup',()=>{
  const {storage,saves}=fixture(),snapshot=complete();saves.restart(snapshot);const backup=storage.getItem(saves.backupKey);saves.restore();assert.deepEqual(JSON.parse(storage.getItem(key)),snapshot);assert.equal(storage.getItem(saves.backupKey),backup);
  saves.restore();assert.equal(storage.getItem(saves.backupKey),backup,'restoration is not a swap');
});
test('the backup summary distinguishes a royal champion from a partial run',()=>{
  const s=complete(),summary=adventureSummary(s);assert.equal(summary.title,'Royal Champion');assert.equal(summary.relays,15);assert.equal(summary.king,true);assert.equal(summary.region,'South Pointe Royal Court');assert.equal(summary.equipment,s.owned.length);
  const partial=freshSave();partial.bosses=[0,0,1];assert.equal(adventureSummary(partial).relays,2);assert.equal(adventureSummary(partial).king,false);
});
test('missing, corrupt and unavailable backups disable restoration without changing the active save',()=>{
  const {storage,saves}=fixture(),active=storage.getItem(key);assert.equal(saves.readBackup().status,'missing');assert.throws(()=>saves.restore());
  storage.setItem(saves.backupKey,'not json');assert.equal(saves.readBackup().status,'corrupt');assert.throws(()=>saves.restore());assert.equal(storage.getItem(key),active);
  storage.getItem=()=>{throw Error('denied');};assert.equal(saves.readBackup().status,'unavailable');assert.throws(()=>saves.restart(complete()));
});
test('a blocked localStorage accessor does not crash creation or backup inspection',()=>{
  const saves=new AdventureSaves({storage:()=>{throw Error('denied');},key});assert.equal(saves.readBackup().status,'unavailable');assert.throws(()=>saves.restart(complete()));
});
for(const failure of ['quota','verification','active-write','active-verification'])test(`${failure}: failed restart leaves both previous saves intact`,()=>{
  const {storage,saves}=fixture();saves.restart(freshSave());storage.setItem(key,JSON.stringify(complete()));const before=new Map(storage.map),write=storage.setItem.bind(storage),read=storage.getItem.bind(storage);let once=false,written=false;
  storage.setItem=(k,v)=>{if(!once&&((failure==='quota'&&k===saves.backupKey)||(failure==='active-write'&&k===key))){once=true;throw Error('write failed');}write(k,v);written=true;};
  storage.getItem=k=>{if(written&&!once&&((failure==='verification'&&k===saves.backupKey)||(failure==='active-verification'&&k===key))){once=true;return 'mismatch';}return read(k);};
  assert.throws(()=>saves.restart(complete()));assert.deepEqual(storage.map,before);
});
test('restore failure rolls back the active save and never writes the backup',()=>{
  const {storage,saves}=fixture();saves.restart(complete());const before=new Map(storage.map),write=storage.setItem.bind(storage);let once=false;storage.writes=[];
  storage.setItem=(k,v)=>{if(k===key&&!once){once=true;throw Error('quota');}write(k,v);};assert.throws(()=>saves.restore());assert.deepEqual(storage.map,before);assert.ok(!storage.writes.includes(saves.backupKey));
});
test('read-back verification failure while restoring also rolls back safely',()=>{
  const {storage,saves}=fixture();saves.restart(complete());const before=new Map(storage.map),read=storage.getItem.bind(storage),write=storage.setItem.bind(storage);let changed=false,once=false;
  storage.setItem=(k,v)=>{write(k,v);changed=true;};storage.getItem=k=>{if(changed&&!once&&k===key){once=true;return 'mismatch';}return read(k);};assert.throws(()=>saves.restore());assert.deepEqual(storage.map,before);
});
for(const mutation of [s=>s.schema=2,s=>s.position=null,s=>s.hp=NaN,s=>s.owned=[],s=>s.build.weapon='unknown',s=>s.bosses=[99]])test('invalid snapshots cannot replace a backup',()=>{
  const {storage,saves}=fixture(),before=new Map(storage.map),s=complete();mutation(s);assert.equal(validAdventure(s),false);assert.throws(()=>saves.restart(s));assert.deepEqual(storage.map,before);
});
test('invalid timestamps and circular snapshots fail before writing anything',()=>{
  const {storage}=fixture(),before=new Map(storage.map),saves=new AdventureSaves({storage,key,now:()=> 'invalid'});assert.throws(()=>saves.restart(complete()));assert.deepEqual(storage.map,before);
  const s=complete();s.circular=s;assert.throws(()=>saves.restart(s));assert.deepEqual(storage.map,before);
});
test('backup validation rejects malformed envelopes without silently loading a fresh adventure',()=>{
  const {storage,saves}=fixture();for(const backup of [{schema:2,savedAt:date,save:complete()},{schema:1,savedAt:'invalid',save:complete()},{schema:1,savedAt:date,save:{schema:1}}]){storage.setItem(saves.backupKey,JSON.stringify(backup));assert.equal(saves.readBackup().status,'corrupt');assert.throws(()=>saves.restore());}
});
test('backup keys follow the active key so local fixtures cannot touch production backups',()=>{
  const storage=new Storage(),a=new AdventureSaves({storage,key:'a',now:()=>date}),b=new AdventureSaves({storage,key:'b',now:()=>date});a.restart(complete());assert.equal(b.readBackup().status,'missing');assert.equal(a.readBackup().status,'ready');
});
