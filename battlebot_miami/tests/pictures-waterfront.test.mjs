import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {AREAS,LANDMARKS,HOME,MAP_LAYOUT,BRIDGES,freshSave,readSave,canWalk,pathfind,dist,walkSegment} from '../world.js?v=world14';
import {MiamiAdventure} from '../engine.js?v=world14';
import {MiamiPainter} from '../painter.js?v=world14';
import {placePicture,areaPicture,enemyPicture,weaponPicture} from '../ui-art.js?v=world14';

function canvas(){const words=[],ops=[];const target={showLabels:false,createLinearGradient:()=>({addColorStop(){}}),measureText:s=>({width:s.length*10}),fillText:s=>words.push(String(s)),strokeText:s=>words.push(String(s))};const c=new Proxy(target,{get:(o,k)=>k in o?o[k]:(...args)=>ops.push([k,...args])});return {width:420,height:500,words,ops,getContext:()=>c,getBoundingClientRect:()=>({width:420,height:500})};}

test('all eight areas and the full map render without words in the default picture mode',()=>{
 globalThis.devicePixelRatio=1;globalThis.matchMedia=()=>({matches:false});const el=canvas(),p=new MiamiPainter(el),save=freshSave();save.unlocked=7;const g=new MiamiAdventure(save);
 for(const a of AREAS){Object.assign(g.player,a.id?a.entry:HOME);p.camera={...g.player};p.draw(g,.016);}p.map(el,g);assert(!el.words.some(s=>/[A-Za-z0-9]/.test(s)),el.words.filter(s=>/[A-Za-z0-9]/.test(s)).join(', '));
});

test('every landmark, boss and regional picture can render without requiring captions',()=>{
 for(const l of LANDMARKS){const el=canvas();placePicture(el,l);assert(!el.words.some(s=>/[A-Za-z0-9]/.test(s)),l.id);assert(el.ops.some(op=>['fill','fillRect','stroke'].includes(op[0])),`${l.id} has visible artwork`);}
 for(const a of AREAS){const el=canvas();areaPicture(el,a.id);if(a.id)enemyPicture(el,a.id);assert(!el.words.some(s=>/[A-Za-z0-9]/.test(s)),a.name);}
 const el=canvas();enemyPicture(el,3,{peacock:true});weaponPicture(el,'bubble');assert(el.ops.length>100,'real artwork is drawn');
});

test('adult names are optional and persist independently of campaign progress',()=>{
 const s=freshSave();assert.equal(s.details,false);s.details=true;s.camps=['camp-1-0'];const loaded=readSave(s);assert(loaded.details);assert.deepEqual(loaded.camps,s.camps);
 globalThis.devicePixelRatio=1;globalThis.matchMedia=()=>({matches:false});const el=canvas(),p=new MiamiPainter(el),g=new MiamiAdventure(loaded);p.draw(g,.016);assert(el.words.some(s=>s.includes('PANORAMA')));
});

test('robotic peacocks are fightable Grove enemies and return after world respawn',()=>{
 const s=freshSave();s.unlocked=7;const g=new MiamiAdventure(s),birds=g.enemies.filter(e=>e.peacock);assert.equal(birds.length,6);assert(birds.every(e=>e.area===3&&!e.boss&&g.awake(e)));for(const bird of birds)g.hit(bird,10000);assert(birds.every(e=>e.hp<=0));g.save.king=true;g.save.champion=true;g.replay();assert.equal(g.enemies.filter(e=>e.peacock).length,6);
});

test('Downtown waterfront places are separate, walkable and correctly ordered northward',()=>{
 const by=id=>LANDMARKS.find(l=>l.id===id),s=freshSave();s.unlocked=7;
 for(const id of ['bayfront','bayfront-play','fountain','bayside','miamarina','skyviews','arena','museum-park','art-museum','frost']){assert(by(id));assert(canWalk(s,by(id)));assert(pathfind(s,HOME,by(id)).length);}
 assert(by('bayside').y<by('bayfront').y);assert(by('arena').y<by('bayside').y);assert(by('frost').y<by('arena').y);assert(by('miamarina').x>by('bayside').x);
});

test('the north guarded beach, Crandon and Cape Florida stay geographically distinct',()=>{
 const by=id=>LANDMARKS.find(l=>l.id===id);assert.equal(by('north-point').kind,'guarded-beach');assert.equal(by('crandon').kind,'guarded-beach');assert.equal(by('cape-beach').kind,'beach');assert.equal(by('cape-florida').kind,'lighthouse');assert(by('north-point').y<by('hobie').y);assert(by('cape-florida').y>by('crandon').y);assert(dist(AREAS[4].arena,by('cape-beach'))<6);
});

test('Miami Beach routes use MacArthur Causeway and no segment crosses water',()=>{
 const s=freshSave();s.unlocked=7;const route=pathfind(s,HOME,AREAS[7].arena);assert(route.length);const bridge=BRIDGES.find(b=>b.name==='MacArthur Causeway');assert(bridge);assert(route.some(p=>p.x>125&&p.x<150&&p.y<40));for(let i=1;i<route.length;i++)assert(walkSegment(s,route[i-1],route[i]));assert(!canWalk(s,{x:145,y:75}));assert.equal(pathfind(s,HOME,{x:145,y:75}).length,0);
});

test('map expansion preserves completed rounds and owned weapons from world7 saves',()=>{
 const old={...freshSave(),mapLayout:2,king:true,queen:true,champion:true,unlocked:7,owned:['starter','firejet'],weapon:'firejet',cleared:AREAS.slice(1).map(a=>`boss-${a.id}`)};const s=readSave(old);assert.equal(s.mapLayout,MAP_LAYOUT);assert(s.king);assert(s.champion);assert.equal(s.weapon,'firejet');assert.deepEqual(s.cleared,old.cleared);
});

test('every essential play control has an accessible name despite hidden word labels',async()=>{
 const html=await readFile(new URL('../index.html',import.meta.url),'utf8');for(const name of ['Home','Map','Power','Build','Pause'])assert(html.includes(`aria-label="${name}"`));assert(html.includes('id="missionArt"'));assert(html.includes('id="missionPips"'));assert(html.includes('data-details="false"'));
});
