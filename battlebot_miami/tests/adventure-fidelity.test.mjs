import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {createHash} from 'node:crypto';
import vm from 'node:vm';
import {freshSave,readSave,EQUIPMENT,STARTERS,COLORS,equipmentStats,visibleEquipment,HOME} from '../world.js?v=world13';
import {MiamiAdventure} from '../engine.js?v=world13';
import {MiamiPainter,adventureZoom} from '../painter.js?v=world13';
import {workshopHTML,drawWorkshop} from '../workshop.js?v=world13';
import {adventureAudio} from '../audio.js?v=world13';
import {bindPowerControl} from '../power-control.js?v=world13';
import {createPreviewServer} from '../tools/serve.mjs';
const read=f=>readFile(new URL('../'+f,import.meta.url),'utf8');

test('music is the exact standard Adventure song and install shell loops it',async()=>{
 const song=await readFile(new URL('../assets/adventure-theme.mp3',import.meta.url));assert.equal(createHash('sha256').update(song).digest('hex'),'aa2233fa4739259bacc05938c2a664e32141dc200b012e887c1be52ae88d5f50');
 assert.match(await read('index.html'),/<audio id="music" src="assets\/adventure-theme.mp3" preload="auto" loop hidden>/);assert((await read('sw.js')).includes("'assets/adventure-theme.mp3'"));
});

test('camera matches Adventure scale and player screen size at phone and desktop widths',()=>{
 for(const w of [320,390,599,600,844,1200]){const expected=(w<600?Math.max(55,Math.min(76,w/6.3)):85)*.9;assert.equal(adventureZoom(w),expected);}
 assert(Math.abs(adventureZoom(390)*1.17-65.18571428571428)<1e-8);
});

test('the first Adventure bumper camp can be cleared without boosts or a rescue',()=>{
 const g=new MiamiAdventure(freshSave());let rescued=false;g.onEvent=e=>{if(e.type==='rescue')rescued=true;};g.goNext();for(let i=0;i<3000&&!rescued&&!g.save.camps.includes('camp-1-0');i++)g.update(.05);assert(!rescued);assert(g.save.camps.includes('camp-1-0'));assert.equal(g.save.weapon,'bumper');
});

test('starter equipment and four workshop tabs retain the Adventure arrangement',()=>{
 const s=freshSave();assert.deepEqual(s.build,STARTERS);assert.equal(equipmentStats(s).hp,70);assert.equal(equipmentStats(s).speed,2.15);assert.equal(COLORS.length,6);
 const html=workshopHTML(s,'gadget',false,()=>'<header></header>');assert.deepEqual([...html.matchAll(/data-tab="([^"]+)"/g)].map(m=>m[1]),['weapon','armor','wheels','gadget']);assert(html.includes('role="tablist"'));assert(html.includes('class="items"'));assert(html.includes('data-part="magnet"'));assert(!html.includes('weapon-grid'));assert(!html.includes('data-upgrade='));
});

test('crafting uses scrap and parts, equips a separate slot and refuses remote crafting',()=>{
 const g=new MiamiAdventure(freshSave());g.save.scrap=100;g.save.gears=10;assert(g.craft('armor','steel'));assert.equal(g.save.scrap,76);assert.equal(g.save.gears,8);assert.equal(g.save.build.armor,'steel');assert.equal(g.maxHp(),115);assert.equal(g.save.weapon,'bumper');assert(!g.craft('armor','steel'));g.player.x-=10;assert(!g.craft('gadget','magnet'));assert(!g.equip('armor','light'));Object.assign(g.player,HOME);assert(g.equip('armor','light'));assert.equal(g.maxHp(),70);
});

test('old Miami upgrades, weapons, progress and currency migrate into equipped Adventure items',()=>{
 const raw={schema:1,mapLayout:3,armor:2,wheels:1,weapon:'neon',owned:['starter','neon'],scrap:124,camps:['camp-1-0'],cleared:['boss-1'],unlocked:2,hp:110,position:HOME,color:'#56b9e0'};const s=readSave(raw);assert.equal(s.build.armor,'heavy');assert.equal(s.build.wheels,'grip');assert.equal(s.build.weapon,'neon');assert.equal(s.scrap,124);assert.deepEqual(s.camps,raw.camps);assert(s.owned.includes('starter'));assert(s.owned.includes('heavy'));assert.equal(s.hp,92.5);assert.equal(s.color,raw.color);const g=new MiamiAdventure(s);s.owned.push('shield');assert(g.equip('gadget','shield'));assert.equal(readSave(g.snapshot()).build.gadget,'shield');
});

test('Bubble and Aegis shields block real hits on eight/four-second cooldowns',()=>{
 for(const [id,cooldown] of [['shield',8],['aegis',4]]){const g=new MiamiAdventure(freshSave());g.save.owned.push(id);g.equip('gadget',id);Object.assign(g.player,{x:115,y:66.5,invincible:0});g.enemies=[];const hp=g.player.hp;g.hurt(10);assert.equal(g.player.hp,hp);assert.equal(g.shieldCd,cooldown);g.hurt(10);assert(g.player.hp<hp);g.paused=true;g.update(.05);assert.equal(g.shieldCd,cooldown);g.paused=false;for(let i=0;i<cooldown*20+1;i++)g.update(.05);g.player.invincible=0;const next=g.player.hp;g.hurt(10);assert.equal(g.player.hp,next);}
});

test('armor defense and reflection affect combat, not only the menu preview',()=>{
 const g=new MiamiAdventure(freshSave());g.save.owned.push('reflect');g.equip('armor','reflect');g.save.gentle=false;Object.assign(g.player,{x:115,y:66.5,invincible:0});const attacker={id:'mob-test',area:1,x:115.5,y:66.5,hp:50,maxHp:50};const before=g.player.hp;g.hurt(10,attacker);assert.equal(before-g.player.hp,8);assert.equal(attacker.hp,47);
});

test('magnet collects distant drops, and uncollected resources survive save/reload',()=>{
 const g=new MiamiAdventure(freshSave());g.enemies=[];g.drops=[{id:'test-drop',x:HOME.x+2.5,y:HOME.y,scrap:3,gears:1}];g.update(.05);assert.equal(g.save.scrap,0);assert.equal(readSave(g.snapshot()).drops.length,1);g.save.owned.push('magnet');g.equip('gadget','magnet');g.update(.05);assert.equal(g.save.scrap,3);assert.equal(g.save.gears,1);assert.equal(g.drops.length,0);
});

test('Power Capacitor keeps Adventure eight-second/eighteen-second timing',()=>{
 const g=new MiamiAdventure(freshSave());g.save.owned.push('capacitor');g.equip('gadget','capacitor');g.power();assert.equal(g.powerTime,8);assert.equal(g.powerCd,18);
});

test('a targeted tap is separate from the global Power button',()=>{
 const g=new MiamiAdventure(freshSave());g.enemies=[];Object.assign(g.player,{x:115,y:66.5});const e={id:'target',area:1,x:115.8,y:66.5,hp:200,maxHp:200,home:{x:115.8,y:66.5},cd:100};g.enemies=[e];g.tap(e);assert.equal(e.hp,188);assert.equal(g.tapCd,1.5);assert.equal(g.powerTime,0);g.tap(e);assert.equal(e.hp,188);
});

test('walking home preserves the world and opens no teleport shortcut',()=>{
 const g=new MiamiAdventure(freshSave());Object.assign(g.player,{x:100,y:80,hp:20});g.enemies=[];g.goHome();assert.equal(g.player.x,100);assert(g.route.length);for(let i=0;i<1000&&!g.isHome();i++)g.update(.05);assert(g.isHome());assert.equal(g.player.hp,g.maxHp());
});

test('automatic weapons cannot clear monsters outside the closer camera',()=>{
 const g=new MiamiAdventure(freshSave());Object.assign(g.player,{x:115,y:66.5});g.save.weapon='firejet';const e={id:'target',area:1,x:120,y:66.5,hp:100,maxHp:100,cd:100,home:{x:120,y:66.5}};g.enemies=[e];g.viewBounds={left:112,right:118,top:63,bottom:70};for(let i=0;i<20;i++)g.update(.05);assert.equal(e.hp,100);assert.equal(g.projectiles.length,0);
});

test('music requires a trusted gesture, keeps its position in menus, mutes and resumes',async()=>{
 const listeners={},levels=[];let enabled=false,plays=0,suspends=0;const music={paused:true,currentTime:37,pause(){this.paused=true;},play(){this.paused=false;plays++;return Promise.resolve();}};const doc={hidden:false,getElementById:()=>music,addEventListener:(type,fn)=>listeners[type]=fn};const previous=globalThis.window;
 globalThis.window={AudioContext:class{destination={};createMediaElementSource(){return {connect(){}};}createGain(){const gain={};Object.defineProperty(gain,'value',{set:v=>levels.push(v)});return {gain,connect(){}};}resume(){return Promise.resolve();}suspend(){suspends++;return Promise.resolve();}}};
 try{const audio=adventureAudio(()=>enabled,doc);enabled=true;audio.syncMusic();assert.equal(plays,0);listeners.click({isTrusted:false});assert.equal(plays,0);listeners.click({isTrusted:true});assert.equal(plays,1);assert.deepEqual(levels,[.28]);audio.syncMusic();assert.equal(music.currentTime,37);assert.equal(plays,1);enabled=false;audio.syncMusic();assert(music.paused);enabled=true;audio.syncMusic();assert.equal(plays,2);doc.hidden=true;listeners.visibilitychange();assert(music.paused);assert(suspends>0);doc.hidden=false;listeners.visibilitychange();assert.equal(plays,3);}finally{globalThis.window=previous;}
});

test('Adventure Power accepts a second-finger pointerdown and avoids double-firing its click',()=>{
 const events={};let count=0;const button={disabled:false,addEventListener:(n,fn)=>events[n]=fn,removeEventListener:(n)=>delete events[n]};const cleanup=bindPowerControl(button,()=>count++);events.pointerdown({button:0,preventDefault(){}});events.click({detail:1});assert.equal(count,1);events.click({detail:0});assert.equal(count,2);button.disabled=true;events.pointerdown({button:0});assert.equal(count,2);cleanup();assert.equal(Object.keys(events).length,0);
});

test('cached music supports offline byte ranges, suffixes and invalid ranges',async()=>{
 const listeners={},bytes=new Uint8Array([0,1,2,3,4,5,6,7,8,9]);const context={URL,Response,self:{location:{href:'https://example.test/miami/sw.js'},addEventListener:(type,fn)=>listeners[type]=fn},caches:{open:async name=>{assert(name.startsWith('battlebot-miami-'));return {match:async()=>new Response(bytes)};}},fetch:async()=>{throw Error('offline');}};vm.runInNewContext(await read('sw.js'),context);
 for(const [range,status,expected] of [['bytes=2-5',206,[2,3,4,5]],['bytes=-3',206,[7,8,9]],['bytes=50-',416,[]]]){let response;listeners.fetch({request:new Request('https://example.test/miami/assets/adventure-theme.mp3',{headers:{range}}),respondWith:p=>response=p});const r=await response;assert.equal(r.status,status);assert.deepEqual([...new Uint8Array(await r.arrayBuffer())],expected);}
});

test('preview serves music as audio and honors Safari range requests',async()=>{
 const server=createPreviewServer();await new Promise(r=>server.listen(0,'127.0.0.1',r));try{const base=`http://127.0.0.1:${server.address().port}/assets/adventure-theme.mp3`;const r=await fetch(base,{headers:{range:'bytes=0-31'}});assert.equal(r.status,206);assert.equal(r.headers.get('content-type'),'audio/mpeg');assert.equal((await r.arrayBuffer()).byteLength,32);assert.equal((await fetch(base,{headers:{range:'bytes=999999999-'}})).status,416);}finally{await new Promise(r=>server.close(r));}
});

test('directional Adventure beams hit the corridor and spare off-axis or rear enemies',()=>{
 for(const id of ['rail','sunbeam','crystalbeam','prism']){const s=freshSave();s.unlocked=5;s.weapon=id;const g=new MiamiAdventure(s);Object.assign(g.player,{x:95,y:45});const mob=(id,x,y)=>({id,area:5,x,y,hp:5000,maxHp:5000});const target=mob('target',97,45),inline=mob('inline',97.5,45.2),side=mob('side',95,47),rear=mob('rear',94,45);g.enemies=[target,inline,side,rear];g.attack(target);assert(target.hp<5000,id);assert(inline.hp<5000,id);assert.equal(side.hp,5000,id);assert.equal(rear.hp,5000,id);}
});

test('safe playgrounds prevent auto attacks, targeted strikes and helper fire',()=>{
 const s=freshSave();s.unlocked=3;s.weapon='prism';s.build.gadget='buddy';const g=new MiamiAdventure(s);Object.assign(g.player,{x:49,y:124,invincible:0});const e={id:'target',area:3,x:46,y:124,hp:100,maxHp:100,cd:100,home:{x:46,y:124}};g.enemies=[e];assert(g.isSafe(g.player));g.tap(e);g.update(.05);assert.equal(e.hp,100);assert.equal(g.projectiles.length,0);assert.equal(g.tapCd,0);g.hurt(100);assert.equal(g.player.hp,g.maxHp());
});

test('public playground charging uses two scrap and the Coupler doubles its rate',()=>{
 const gains=[];for(const gadget of ['none','repair']){const g=new MiamiAdventure(freshSave());g.enemies=[];g.save.owned.push('repair');g.equip('gadget',gadget);g.save.scrap=10;g.save.discoveries.push('hammock');Object.assign(g.player,{x:84,y:88,hp:1});assert(g.stationNear());assert(g.repair());assert.equal(g.save.scrap,8);assert(!g.repair());for(let i=0;i<20;i++)g.update(.05);gains.push(g.player.hp-1);g.paused=true;const hp=g.player.hp;g.update(.05);assert.equal(g.player.hp,hp);g.paused=false;g.moveTo({x:85,y:88});assert.equal(g.charging,null);}assert(Math.abs(gains[1]-gains[0]*2)<1e-8);
});

function artContext(onFill=()=>{}){const stack=[],target={globalAlpha:1,save(){stack.push({globalAlpha:this.globalAlpha,fillStyle:this.fillStyle});},restore(){Object.assign(this,stack.pop());},fill(){onFill(this.fillStyle,this.globalAlpha);},createLinearGradient:()=>({addColorStop(){}}),measureText:s=>({width:String(s).length*10})};return new Proxy(target,{get:(o,k)=>k in o?o[k]:()=>{}});}
test('startup invulnerability keeps the robot body opaque on successive animation frames',()=>{
 globalThis.devicePixelRatio=1;globalThis.matchMedia=()=>({matches:false});const alphas=[],c=artContext((fill,alpha)=>{if(fill==='#21383d')alphas.push(alpha);}),canvas={width:390,height:550,getContext:()=>c,getBoundingClientRect:()=>({width:390,height:550})},g=new MiamiAdventure(freshSave());g.enemies=[];const p=new MiamiPainter(canvas);for(const t of [0,.09,.18,.27]){g.time=t;p.draw(g,.016);}assert(alphas.length>=4);assert(alphas.every(a=>a===1),alphas.join(','));
});

test('workshop preview redraws at the current container size and device pixel ratio',()=>{
 globalThis.devicePixelRatio=2;let width=220;const preview={width:1,height:1,getBoundingClientRect:()=>({width,height:175}),getContext:()=>artContext()},root={querySelector:()=>preview,querySelectorAll:()=>[]},save=freshSave();drawWorkshop(root,save,'weapon');assert.equal(preview.width,440);assert.equal(preview.height,350);width=360;drawWorkshop(root,save,'weapon');assert.equal(preview.width,720);assert.equal(preview.height,350);
});
