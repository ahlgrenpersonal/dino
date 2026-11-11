// A compact, north-up Miami play map. Distances and streets are simplified.
import {ADVENTURE_EQUIPMENT,ADVENTURE_COLORS} from './equipment.js?v=world20';
export const BUILD='world20';
export const HOME={x:94,y:81};
export const W=204,H=196;
export const FINAL_AREA=7;
export const MAP_LAYOUT=3;
export const AREAS=[
 {id:0,name:'Brickell',short:'Brickell',theme:'vampire',color:'#b9d6bd',accent:'#ed81ad',hint:'Panorama Tower is your safe home. Head east across the bridge to Brickell Key.',entry:{x:100,y:77},boss:null,polys:[[[81,59],[105,59],[107,91],[91,97],[78,101],[63,101],[63,80],[78,80],[80,62]]]},
 {id:1,name:'Brickell & Brickell Key',short:'Brickell',theme:'vampire',color:'#bee5d1',accent:'#ee86ba',hint:'East of Brickell, across the Brickell Key bridge. Find three batteries, then Count Neon!',entry:{x:117,y:78},boss:'Count Neon',reward:'neon',arena:{x:121,y:65.5},camps:[{x:96,y:74},{x:97,y:88},{x:122.5,y:86.5}],polys:[[[113,64],[128,64],[130,67],[128,75],[126,83],[123,89],[120,89],[117,81],[113,71]]]},
 {id:2,name:'Little Havana',short:'Little Havana',theme:'mummy',color:'#e7c794',accent:'#ffbd66',hint:'West of Brickell, along Calle Ocho. The mummies have mixed up the music!',entry:{x:75,y:70},boss:'The Rumba Pharaoh',reward:'drum',arena:{x:46,y:69},camps:[{x:68,y:68},{x:56,y:75},{x:45,y:77}],polys:[[[36,59],[81,59],[80,80],[36,80]]]},
 {id:3,name:'Coconut Grove',short:'Coconut Grove',theme:'witch',color:'#9ac89d',accent:'#bb9aef',hint:'Southwest of Brickell. Follow the leafy trail to the mangrove witches.',entry:{x:79,y:103},boss:'The Mangrove Witch',reward:'vine',arena:{x:40,y:121},camps:[{x:72,y:105},{x:56,y:113},{x:43,y:113}],polys:[[[63,101],[78,101],[91,97],[77,110],[63,125],[47,137],[26,137],[26,105],[56,101]]]},
 {id:4,name:'Virginia Key & Key Biscayne',short:'The Keys',theme:'skeleton',color:'#e9d79d',accent:'#5ce2df',hint:'From southern Brickell, cross Rickenbacker Causeway to Hobie Beach and Virginia Key. Cross Bear Cut to Crandon Beach on Key Biscayne.',entry:{x:117,y:111},boss:'Captain Rattle',reward:'tide',arena:{x:143,y:181},camps:[{x:119,y:112},{x:131,y:121},{x:138,y:143}],polys:[[[115,105],[130,102],[139,111],[138,124],[129,130],[118,125],[113,115]],[[130,135],[140,133],[149,143],[151,174],[147,190],[138,190],[131,176],[129,159],[127,145]]]},
 {id:5,name:'Downtown',short:'Downtown',theme:'zombie',color:'#b9c7b2',accent:'#f4b875',hint:'North of Brickell, across the Miami River. Follow Biscayne Boulevard toward the bay.',entry:{x:96,y:55},boss:'DJ Zombox',reward:'metro',arena:{x:98,y:34},camps:[{x:87,y:51},{x:100,y:45},{x:87,y:35}],polys:[[[81,26],[108,26],[108,54],[103,57],[82,57]]]},
 {id:6,name:'Frost Science · Museum Park',short:'Frost Science',theme:'ghost',color:'#b4d9d2',accent:'#9deeff',hint:'At the northern end of Downtown, in Museum Park. Clear the ghost camps and face the Frost Queen. Her prism beam opens the way to Miami Beach.',entry:{x:98,y:24},boss:'The Frost Queen',reward:'prism',arena:{x:98,y:16},camps:[{x:87,y:23},{x:104,y:23},{x:87,y:15}],polys:[[[81,8],[110,8],[110,26],[81,26]]]},
 {id:7,name:'Miami Beach · South of Fifth',short:'Miami Beach',theme:'skeleton',color:'#f0d9a6',accent:'#ffb18f',hint:'Cross MacArthur Causeway east from Downtown. Head south of Fifth Street to South Pointe Park. The Afterburner King waits by the beach!',entry:{x:169,y:44},boss:'The Afterburner King',reward:'firejet',arena:{x:178,y:62},camps:[{x:174,y:36},{x:182,y:48},{x:170,y:57}],polys:[[[168,27],[185,27],[190,36],[190,57],[185,66],[175,69],[166,63],[163,52],[163,36]]]}
];
export const BRIDGES=[
 {name:'Brickell Key bridge',area:1,points:[{x:104,y:77},{x:111,y:79},{x:117,y:78}],width:3},
 {name:'Miami River bridge',area:5,points:[{x:96,y:63},{x:96,y:52}],width:3},
 {name:'Rickenbacker Causeway',area:4,points:[{x:96,y:92},{x:108,y:103},{x:118,y:112}],width:3},
 {name:'Bear Cut Bridge',area:4,points:[{x:132,y:123},{x:134,y:140}],width:3},
 {name:'MacArthur Causeway',area:7,points:[{x:108,y:13},{x:126,y:14},{x:145,y:31},{x:169,y:44}],width:3},
 {name:'Dinner Key boardwalk',area:3,points:[{x:61,y:120},{x:69,y:124}],width:2.4,wood:true}
];
export const ROADS=[
 {name:'Brickell Avenue',area:0,points:[{x:96,y:62},{x:96,y:91}]},
 {name:'Calle Ocho · SW 8th St',area:2,points:[{x:42,y:70},{x:96,y:70}]},
 {name:'Bayshore Drive',area:3,points:[{x:82,y:96},{x:68,y:108},{x:52,y:119},{x:36,y:128}]},
 {name:'Biscayne Boulevard',area:5,points:[{x:98,y:54},{x:98,y:28},{x:98,y:23}]},
 {name:'Crandon Boulevard',area:4,points:[{x:117,y:112},{x:132,y:119},{x:134,y:140},{x:140,y:162},{x:142,y:184}]},
 {name:'The Underline',area:0,points:[{x:86,y:75},{x:85,y:86},{x:72,y:98}]},
 {name:'South Miami Avenue',area:0,points:[{x:88,y:65},{x:88,y:81},{x:86,y:96}]},
 {name:'Ocean Drive',area:7,points:[{x:185,y:30},{x:185,y:54},{x:181,y:63}]},
 {name:'Fifth Street',area:7,points:[{x:165,y:51},{x:187,y:51}]}
];
// The walking circuit is continuous in the game; actual access can change.
export const KEY_LOOP=[{x:114.5,y:65.5},{x:127.3,y:65.5},{x:128.5,y:68},{x:126.6,y:75},{x:124.5,y:83},{x:122.5,y:87.3},{x:120.5,y:86.8},{x:118.5,y:80.5},{x:114.5,y:70.5},{x:114.5,y:65.5}];
export const PRIVATE_ZONES=[[[116,67.5],[126,67.5],[124.5,75],[122.5,82.3],[120.3,79.5],[116,70.5]]];
export const isPrivate=p=>PRIVATE_ZONES.some(poly=>inside(p,poly));
export const LANDMARKS=[
 {id:'panorama',name:'Panorama Tower · Trash Can Building',area:0,x:94,y:81,kind:'home',mapName:'Panorama Tower'},
 {id:'city-centre',name:'Brickell City Centre',area:0,x:88,y:71,kind:'mall',equipment:{type:'wheels',id:'grip'}},
 {id:'brickell-park',name:'Brickell Park',area:0,x:101,y:63,kind:'park'},
 {id:'hammock',name:'The Hammock Playground · Underline',area:0,x:84,y:88,kind:'playground',equipment:{type:'gadget',id:'spark-cell'}},
 {id:'1814-park',name:'1814 Brickell Park',area:0,x:93,y:95,kind:'playground',equipment:{type:'armor',id:'steel'}},
 {id:'key-park',name:'Brickell Key · south park',area:1,x:122.5,y:86,kind:'park',equipment:{type:'wheels',id:'boardwalk'}},
 {id:'domino',name:'Domino Park',area:2,x:52,y:69,kind:'domino',equipment:{type:'gadget',id:'magnet'}},
 {id:'tower-theater',name:'Tower Theater',area:2,x:46,y:65,kind:'theater'},
 {id:'riverside-play',name:'Riverside playground · Little Havana',area:2,x:74,y:63,kind:'playground',equipment:{type:'gadget',id:'repair'}},
 {id:'calle-ocho',name:'Calle Ocho',area:2,x:55,y:64,kind:'cafe'},
 {id:'cocowalk',name:'CocoWalk',area:3,x:43,y:117,kind:'cocowalk',equipment:{type:'wheels',id:'speed'}},
 {id:'peacock',name:'Peacock Park playground',area:3,x:49,y:124,kind:'playground',equipment:{type:'armor',id:'grove-shell'}},
 {id:'grand-bay',name:'Grove at Grand Bay',area:3,x:65,y:113,kind:'twisting-towers'},
 {id:'mr-c',name:'Mr. C Residences',area:3,x:73,y:106,kind:'curved-towers'},
 {id:'city-hall',name:'City Hall · Dinner Key',area:3,x:63,y:119,kind:'city-hall'},
 {id:'park-grove',name:'Park Grove towers',area:3,x:59,y:117,kind:'grove-towers'},
 {id:'regatta',name:'Regatta Park',area:3,x:59,y:125,kind:'park',equipment:{type:'gadget',id:'shield'}},
 {id:'dinner-key',name:'Dinner Key Marina',area:3,x:68,y:123,kind:'marina',equipment:{type:'gadget',id:'quick-coil'}},
 {id:'hobie',name:'Hobie Beach',area:4,x:115,y:109,kind:'beach',equipment:{type:'wheels',id:'balloon'}},
 {id:'north-point',name:'Virginia Key North Point Beach',area:4,x:133,y:106,kind:'guarded-beach',equipment:{type:'armor',id:'reflect'}},
 {id:'cape-florida',name:'Cape Florida Lighthouse',area:4,x:146,y:186,kind:'lighthouse',equipment:{type:'armor',id:'bastion'}},
 {id:'cape-beach',name:'Cape Florida Beach',area:4,x:147,y:178,kind:'beach'},
 {id:'crandon-play',name:'Crandon Park playground',area:4,x:140,y:146,kind:'playground',equipment:{type:'gadget',id:'scout'}},
 {id:'virginia-key',name:'Virginia Key',area:4,x:127,y:113,kind:'beach'},
 {id:'crandon',name:'Crandon Beach · Key Biscayne',area:4,x:147,y:152,kind:'guarded-beach',equipment:{type:'armor',id:'heavy'}},
 {id:'bayfront',name:'Bayfront Park',area:5,x:104,y:45,kind:'bayfront',equipment:{type:'armor',id:'polar'}},
 {id:'fountain',name:'Bayfront Park fountain',area:5,x:102,y:47,kind:'fountain',equipment:{type:'gadget',id:'vacuum'}},
 {id:'bayside',name:'Bayside Marketplace',area:5,x:103,y:39,kind:'bayside',equipment:{type:'wheels',id:'treads'}},
 {id:'miamarina',name:'Miamarina · Bayside waterfront',area:5,x:106,y:37,kind:'bayside-marina',equipment:{type:'wheels',id:'rover'}},
 {id:'skyviews',name:'Bayside observation wheel',area:5,x:107,y:42,kind:'wheel',equipment:{type:'gadget',id:'aegis'}},
 {id:'arena',name:'Downtown arena',area:5,x:101,y:29,kind:'arena'},
 {id:'museum-park',name:'Museum Park',area:6,x:105,y:23,kind:'sculpture-park',equipment:{type:'gadget',id:'capacitor'}},
 {id:'art-museum',name:'Art museum · Museum Park',area:6,x:106,y:14,kind:'art-museum'},
 {id:'bayfront-play',name:'Bayfront Park playground',area:5,x:104,y:51,kind:'pirate-playground',mapName:'Bayfront playground',equipment:{type:'gadget',id:'buddy'}},
 {id:'frost',name:'Frost Science',area:6,x:100,y:12,kind:'museum',equipment:{type:'wheels',id:'hover'}},
 {id:'south-of-fifth',name:'South of Fifth',area:7,x:171,y:55,kind:'art-deco'},
 {id:'south-pointe',name:'South Pointe Park playground',area:7,x:177,y:65,kind:'splash-park',equipment:{type:'armor',id:'star'}},
 {id:'south-pier',name:'South Pointe Pier',area:7,x:185,y:63,kind:'pier'},
 {id:'south-beach',name:'Miami Beach',area:7,x:188,y:48,kind:'beach'}
];
export const visibleLandmarks=save=>LANDMARKS.filter(l=>save.champion||l.area<=save.unlocked);
export const CHARGING_STATIONS=LANDMARKS.filter(l=>['playground','pirate-playground','splash-park'].includes(l.kind)).map(l=>({id:`charge-${l.id}`,x:l.x,y:l.y,area:l.area}));
export const HOME_SAFE_RADIUS=3.25;
export const safeAt=(save,p)=>visibleLandmarks(save).some(l=>['home','playground','pirate-playground','splash-park'].includes(l.kind)&&dist(l,p)<(l.kind==='home'?HOME_SAFE_RADIUS:2.5));
export const allBossesCleared=save=>AREAS.slice(1,FINAL_AREA).every(a=>save.cleared.includes(`boss-${a.id}`));
export const WEAPONS=[
 {id:'starter',name:'Bumper Blaster',art:'blaster',damage:9,range:4.8,rate:.64,color:'#a6ffdf',desc:'Your trusty starting blaster. Aim by moving near a monster.'},
 {id:'bubble',name:'Ribbon Bubbler',art:'miami-bubble',damage:10,range:5.2,rate:.64,color:'#b5f4ff',desc:'A keepsake bubble wand from an earlier adventure.'},
 {id:'neon',name:'Neon Fang',art:'miami-neon',damage:15,range:5.6,rate:.48,color:'#ff9dda',desc:'Count Neon’s quick pink bolts. Reach one monster from a distance.'},
 {id:'drum',name:'Rumba Hammer',art:'miami-rumba',damage:38,range:2.7,rate:.85,color:'#ffd276',desc:'The Pharaoh’s conga mallet. Big close-up shockwaves hit a whole group.'},
 {id:'vine',name:'Mangrove Spark',art:'miami-mangrove',damage:24,range:5.6,rate:.62,color:'#c9a4ff',desc:'Witchy lightning jumps between three monsters.'},
 {id:'tide',name:'Tidal Spinner',art:'miami-tidal',damage:23,range:6,rate:.5,color:'#89ffff',desc:'Captain Rattle’s surf fins. Cut through a row and hit again on the way back.'},
 {id:'metro',name:'Bass Rocket',art:'miami-bass',damage:50,range:6.5,rate:.85,color:'#ffbe72',desc:'DJ Zombox’s rockets make a splash of bass.'},
 {id:'prism',name:'Queen’s Prism',art:'miami-prism',damage:46,range:7,rate:.5,color:'#dcceff',desc:'The Frost Queen’s long rainbow beam.'},
 {id:'firejet',name:'Fire-Jet Launcher',art:'firejet',damage:85,range:8,rate:.68,color:'#ff9354',desc:'The King’s flaming arrow, with fins and a glowing jet engine!'}
];
WEAPONS.push(...ADVENTURE_EQUIPMENT.weapon.map(w=>({...w,art:w.id,color:'#a9efd0'})));
export const COLORS=ADVENTURE_COLORS;
export const EQUIPMENT={...ADVENTURE_EQUIPMENT,weapon:WEAPONS,
 armor:[...ADVENTURE_EQUIPMENT.armor,{id:'grove-shell',name:'Leaf Armor',desc:'Leaf-shaped plates add a little extra protection.',hp:135,defense:1,cost:0,gears:0}],
 wheels:[...ADVENTURE_EQUIPMENT.wheels,
  {id:'boardwalk',name:'Boardwalk Wheels',desc:'Pink and mint rollers. A little faster, with a little extra health.',speed:2.85,hp:5,cost:0,gears:0},
  {id:'balloon',name:'Beach Balloon Tires',desc:'Big soft tires. Steady rolling and extra health for beach exploring.',speed:3.1,hp:25,cost:0,gears:0}],
 gadget:[...ADVENTURE_EQUIPMENT.gadget.map(p=>p.id==='capacitor'?{...p,powerCooldown:18,powerDuration:8}:p.id==='buddy'?{...p,helperDamage:45,helperRate:1}:p),
  {id:'spark-cell',name:'Spark Battery',desc:'Power is ready sooner: every 24 seconds instead of 28.',powerCooldown:24,powerDuration:6,cost:0,gears:0},
  {id:'quick-coil',name:'Quick Coil',desc:'Longer Power boosts, ready again every 21 seconds.',powerCooldown:21,powerDuration:7,cost:0,gears:0},
  {id:'scout',name:'Beach Scout',desc:'A little propeller friend helps with gentle blaster shots.',helperDamage:12,helperRate:1.5,cost:0,gears:0}]
};
export const STARTERS={weapon:'bumper',armor:'light',wheels:'basic',gadget:'none'};
export const weaponFor=id=>WEAPONS.find(w=>w.id===id)||WEAPONS.find(w=>w.id==='bumper');
export const item=(type,id)=>EQUIPMENT[type]?.find(p=>p.id===id)||EQUIPMENT[type]?.[0];
export function available(save,p){if(save.owned.includes(p.id))return true;if(p.royalReward||p.unlock===undefined)return false;if(p.unlock<0)return true;const area=p.unlock<5?p.unlock+1:p.unlock<10?6:7;return save.cleared.includes(`boss-${area}`);}
export const visibleEquipment=(save,type)=>EQUIPMENT[type].filter(p=>save.owned.includes(p.id)||(type!=='weapon'&&available(save,p)&&save.scrap>=p.cost&&save.gears>=p.gears));
export const nextChapter=save=>AREAS.find(a=>a.id&&!save.cleared.includes(`boss-${a.id}`))||null;
export const visibleChapters=save=>visibleAreas(save).filter(a=>a.id);
export const chapterForRegion=r=>r===0?1:r;
export function equipmentStats(save){const armor=item('armor',save.build?.armor||['light','steel','heavy'][save.armor||0]),wheels=item('wheels',save.build?.wheels||['basic','grip','speed'][save.wheels||0]);return {hp:armor.hp+(wheels.hp||0),defense:armor.defense,reflect:!!armor.reflect,speed:wheels.speed,weapon:weaponFor(save.weapon)};}
export function powerStats(save){const g=item('gadget',save.build?.gadget);return {cooldown:g.powerCooldown||28,duration:g.powerDuration||6};}
export const equipmentClaimed=(save,l)=>save.equipmentClaims?.includes(l.id)===true;
export const dist=(a,b)=>Math.hypot(a.x-b.x,a.y-b.y);
export function inside(p,poly){let hit=false;for(let i=0,j=poly.length-1;i<poly.length;j=i++){const a=poly[i],b=poly[j];if((a[1]>p.y)!==(b[1]>p.y)&&p.x<(b[0]-a[0])*(p.y-a[1])/(b[1]-a[1])+a[0])hit=!hit;}return hit;}
export function segmentDistance(p,a,b){const dx=b.x-a.x,dy=b.y-a.y,t=Math.max(0,Math.min(1,((p.x-a.x)*dx+(p.y-a.y)*dy)/(dx*dx+dy*dy)));return dist(p,{x:a.x+t*dx,y:a.y+t*dy});}
export const onLine=(p,points,width)=>points.slice(1).some((b,i)=>segmentDistance(p,points[i],b)<width/2);
export function regionAt(p){const b=BRIDGES.find(b=>onLine(p,b.points,b.width));if(b)return b.area;return AREAS.findLast(a=>a.polys.some(poly=>inside(p,poly)))?.id??-1;}
export const CAMP_SIZE=4;
export const campEnemyId=(chapter,camp,slot)=>`mob-${chapter}-${camp}-${slot}`;
// Defeated enemy IDs are durable proof; repair a missing ledger entry without rewards.
export function reconcileCampProgress(save){
 const defeated=new Set(save.defeated),credited=new Set(save.camps),repaired=[];
 for(const a of AREAS.filter(a=>a.id))for(let i=0;i<a.camps.length;i++){
  const key=`camp-${a.id}-${i}`;
  if(!credited.has(key)&&Array.from({length:CAMP_SIZE},(_,j)=>campEnemyId(a.id,i,j)).every(id=>defeated.has(id))){save.camps.push(key);credited.add(key);repaired.push(key);}
 }
 return repaired;
}
export function freshSave(){return {schema:1,equipmentVersion:1,progressionVersion:2,mapLayout:MAP_LAYOUT,discoveries:[],equipmentClaims:[],unlocked:1,cleared:[],camps:[],defeated:[],owned:Object.values(STARTERS),build:{...STARTERS},weapon:'bumper',armor:0,wheels:0,color:COLORS[0],scrap:0,gears:0,drops:[],cycle:1,champion:false,queen:false,king:false,position:{...HOME},hp:70,sound:false,gentle:true,details:false};}
export function readSave(raw){
 const s=freshSave();if(!raw||raw.schema!==1)return s;
 for(const key of ['unlocked','armor','wheels','scrap','cycle'])if(Number.isFinite(raw[key]))s[key]=Math.floor(Math.max(key==='cycle'?1:0,Math.min(key==='scrap'?999999:key==='cycle'?9999:key==='unlocked'?FINAL_AREA:2,raw[key])));
 for(const key of ['cleared','camps','defeated','discoveries','equipmentClaims'])s[key]=Array.isArray(raw[key])?[...new Set(raw[key].filter(v=>typeof v==='string'&&/^[a-z0-9-]{1,45}$/.test(v)))]:[];
 s.owned=[...new Set([...Object.values(STARTERS),...(Array.isArray(raw.owned)?raw.owned:[]).filter(v=>Object.values(EQUIPMENT).some(parts=>parts.some(p=>p.id===v)))])];
 s.equipmentClaims=s.equipmentClaims.filter(id=>LANDMARKS.some(l=>l.id===id&&l.equipment&&s.owned.includes(l.equipment.id)));
 if(s.owned.includes('starter')&&s.owned.includes('bumper'))s.owned=s.owned.filter(id=>id!==(raw.weapon==='bumper'?'starter':'bumper'));
 s.weapon=s.owned.includes(raw.weapon)&&WEAPONS.some(w=>w.id===raw.weapon)?raw.weapon:s.owned.includes(STARTERS.weapon)?STARTERS.weapon:s.owned.find(id=>WEAPONS.some(w=>w.id===id))||STARTERS.weapon;
 s.build.weapon=s.weapon;
 if(raw.equipmentVersion===1){for(const type of ['armor','wheels','gadget'])if(s.owned.includes(raw.build?.[type])&&EQUIPMENT[type].some(p=>p.id===raw.build[type]))s.build[type]=raw.build[type];}
 else{for(const type of ['armor','wheels']){const id=(type==='armor'?['light','steel','heavy']:['basic','grip','speed'])[s[type]];s.build[type]=id;if(!s.owned.includes(id))s.owned.push(id);}}
 if(Number.isFinite(raw.gears))s.gears=Math.max(0,Math.min(999999,Math.floor(raw.gears)));
 for(const key of ['champion','queen','king','sound','gentle','details'])if(typeof raw[key]==='boolean')s[key]=raw[key];
 if(raw.mapLayout!==MAP_LAYOUT){if((raw.mapLayout||0)<2&&(s.queen||s.king)){s.unlocked=FINAL_AREA;s.king=false;}s.mapLayout=MAP_LAYOUT;}
 if([...COLORS,'#f27e67','#56b9e0','#a6de81','#e2a5f0'].includes(raw.color))s.color=raw.color;
 if(Number.isFinite(raw.position?.x)&&Number.isFinite(raw.position?.y)){const r=regionAt(raw.position);if(r>=0&&r<=(s.champion?FINAL_AREA:s.unlocked))s.position={x:raw.position.x,y:raw.position.y};}
 if(Number.isFinite(raw.hp)){const hp=raw.equipmentVersion===1?raw.hp:raw.hp/(110+s.armor*55)*equipmentStats(s).hp;s.hp=Math.max(1,Math.min(equipmentStats(s).hp,hp));}
 if(Array.isArray(raw.drops))s.drops=raw.drops.filter(d=>d&&Number.isFinite(d.x)&&Number.isFinite(d.y)&&canWalk(s,d)&&typeof d.id==='string'&&/^[a-z0-9-]{1,70}$/.test(d.id)).slice(0,500).map(d=>({id:d.id,x:d.x,y:d.y,scrap:Math.floor(Math.max(0,Math.min(3,Number(d.scrap)||0))),gears:Math.floor(Math.max(0,Math.min(1,Number(d.gears)||0)))}));
 reconcileCampProgress(s);
 if(!canWalk(s,s.position))s.position=nearestWalkable(s,s.position)||{...HOME};
 return s;
}
export function visibleAreas(save){return AREAS.filter(a=>save.champion||a.id<=save.unlocked);}
export function canWalk(save,p){const r=regionAt(p);return r>=0&&!isPrivate(p)&&(save.champion||r<=save.unlocked);}
export function nearestWalkable(save,p){for(let radius=0;radius<=20;radius++)for(let dy=-radius;dy<=radius;dy++)for(let dx=-radius;dx<=radius;dx++){if(radius&&Math.abs(dx)!==radius&&Math.abs(dy)!==radius)continue;const q={x:Math.floor(p.x)+dx+.5,y:Math.floor(p.y)+dy+.5};if(canWalk(save,q))return q;}return null;}
export function walkSegment(save,a,b){const n=Math.max(1,Math.ceil(dist(a,b)*4));for(let i=0;i<=n;i++)if(!canWalk(save,{x:a.x+(b.x-a.x)*i/n,y:a.y+(b.y-a.y)*i/n}))return false;return true;}
export function pathfind(save,start,end){
 if(!Number.isFinite(start?.x)||!Number.isFinite(start?.y)||!Number.isFinite(end?.x)||!Number.isFinite(end?.y)||!canWalk(save,start)||!canWalk(save,end)||dist(start,end)<.1)return [];
 const key=(x,y)=>y*W+x;
 const nearby=p=>{const points=[];for(let dy=-2;dy<=2;dy++)for(let dx=-2;dx<=2;dx++){const x=Math.floor(p.x)+dx,y=Math.floor(p.y)+dy,q={x:x+.5,y:y+.5};if(x<0||y<0||x>=W||y>=H||!canWalk(save,q)||!walkSegment(save,p,q))continue;points.push({key:key(x,y),distance:dist(p,q)});}return points.sort((a,b)=>a.distance-b.distance);};
 const seeds=nearby(start),goals=new Set(nearby(end).map(p=>p.key));if(!seeds.length||!goals.size)return [];
 const open=seeds.map(p=>p.key),prev=new Map(open.map(k=>[k,-1]));let head=0;
 while(head<open.length){const k=open[head++],x=k%W,y=Math.floor(k/W);if(goals.has(k)){const route=[];for(let n=k;n!==-1;n=prev.get(n))route.push({x:n%W+.5,y:Math.floor(n/W)+.5});route.reverse();if(dist(route.at(-1),end)>.05)route.push({x:end.x,y:end.y});return route;}
  for(const [dx,dy] of [[1,0],[-1,0],[0,1],[0,-1]]){const nx=x+dx,ny=y+dy,n=key(nx,ny),p={x:nx+.5,y:ny+.5};if(nx<0||ny<0||nx>=W||ny>=H||prev.has(n)||!canWalk(save,p)||!walkSegment(save,{x:x+.5,y:y+.5},p))continue;prev.set(n,k);open.push(n);}
 }
 return [];
}
