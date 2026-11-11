// Adventure supplies all combat, equipment and progression rules.
// This adapter relocates its content into the Miami play geography.
import * as original from './adventure-data.js?v=world97';
import * as geo from './miami-layout.js?v=world97';
import {PANTHEON,buildPantheon} from './pantheon.js?v=world97';
export * from './adventure-data.js?v=world97';
export {PANTHEON};
export const WORLD_W=geo.WORLD_W,WORLD_H=geo.WORLD_H,HOME=geo.HOME,MAIN_Y=HOME.y;
export const REGIONS=original.REGIONS.map((reg,r)=>({...reg,name:geo.names[r],subtitle:'A Miami adventure',ground:geo.coastColor(r),path:'#e3d5b0',water:'#66b8c6'}));
export const REGION_TILES=geo.bounds.slice(0,15).map(b=>[[b.x/36,b.y/44]]),REGION_LAYOUT=REGION_TILES.map(t=>t[0]);
// Keep Adventure's locked-trail gate artwork at each new district's public entrance.
export const GATES=geo.cells.slice(1,15).map((list,i)=>{const r=i+1,choices=[];for(const p of list)for(const [dx,dy]of [[1,0],[-1,0],[0,1],[0,-1]]){const nr=geo.regionAt(p.x+dx,p.y+dy);if(nr>=0&&nr<r&&geo.isLand(p.x+dx,p.y+dy))choices.push({r,x:p.x+dx*.5,y:p.y+dy*.5,horizontal:!!dy,road:geo.isRoad(p.x,p.y)});}return choices.find(p=>p.road)||choices[Math.floor(choices.length/2)];}).filter(Boolean);
export const regionAt=geo.regionAt,isRoad=geo.isRoad;
export const atlasLayout=()=>{const scale=Math.min(552/WORLD_W,712/WORLD_H);return {scale,ox:(600-WORLD_W*scale)/2,oy:(760-WORLD_H*scale)/2};};
export const WORKSHOPS=original.WORKSHOPS.map((h,i)=>({...h,...geo.point([{x:94,y:81},{x:131,y:116},{x:102,y:23}][i]),name:['Panorama Tower Workshop','Virginia Key Workshop','Museum Park Workshop'][i]}));
const template=original.makeWorld(original.freshSave()),anchors=new Map(),reserved=Array.from({length:15},()=>[]),sitePositions=new Map();
const key=(r,p)=>`${r}:${p.x},${p.y}`,dist=(a,b)=>Math.hypot(a.x-b.x,a.y-b.y);
const candidates=geo.cells.slice(0,15).map((list,r)=>list.filter(p=>Math.floor(p.x)%2===0&&Math.floor(p.y)%2===0&&[-3,0,3].every(dx=>[-3,0,3].every(dy=>geo.isLand(p.x+dx,p.y+dy)&&regionAt(p.x+dx,p.y+dy)===r))));
for(const h of WORKSHOPS)reserved[h.r].push({...h,space:9});
function place(r,source,preferred){
 const k=key(r,source);if(anchors.has(k))return anchors.get(k);let dest=preferred;
 if(!dest){let best=-Infinity;for(const p of candidates[r]){const score=Math.min(25,...reserved[r].map(q=>dist(p,q)-(q.space||0)));if(score>best){best=score;dest=p;}}}
 if(!dest)throw Error(`No Miami clearing for region ${r}`);dest={x:Math.floor(dest.x)+.5,y:Math.floor(dest.y)+.5};anchors.set(k,dest);reserved[r].push({...dest,space:4});return dest;
}
const relays=original.REGIONS.map((_,r)=>place(r,original.relayFor(r),r===0?geo.point({x:121,y:65.5}):undefined));
export const relayFor=r=>({...relays[r]});
// Adventure's completed-area row adds its fixed center offset to this origin.
export const regionOrigin=r=>({x:relays[r].x-18.5,y:relays[r].y-22.5});
for(const s of template.sites){const p=place(s.r,s);sitePositions.set(s.id,p);}
for(const m of original.RETURNS)place(m.r,m);
for(const e of original.ENCOUNTERS)place(e.r,e);
function relocate(p,r=p.r){
 const exact=anchors.get(key(r,p));if(exact)return {...p,...exact};let closest=null,best=Infinity;
 for(const [k,target] of anchors){if(!k.startsWith(`${r}:`))continue;const [x,y]=k.slice(k.indexOf(':')+1).split(',').map(Number),d=Math.hypot(p.x-x,p.y-y);if(d<best){best=d;closest={x:target.x+p.x-x,y:target.y+p.y-y};}}
 if(!closest)throw Error('Missing Miami anchor');return {...p,...closest};
}
function clearPoint(p,r=p.r){const moved=relocate(p,r);if(geo.isLand(moved.x,moved.y)&&regionAt(moved.x,moved.y)===r)return moved;return {...p,...place(r,p)};}
export const RETURNS=original.RETURNS.map(m=>({...relocate(m),sites:m.sites.map(([x,y])=>{const p=place(m.r,{x,y});return [p.x,p.y];})}));
export const HALLOWEEN_MISSIONS=RETURNS.filter(m=>m.halloween);
export const ENCOUNTERS=original.ENCOUNTERS.map(e=>relocate(e));
// Complete the placement plan once. World regeneration must never move saved pickups.
const pickups=new Map([...template.chests,...template.stations].map(p=>[p.id,clearPoint(p)]));
export const currentMission=save=>RETURNS.find(m=>m.id===save.replay?.mission&&original.returnActive(save,m))||RETURNS.find(m=>original.returnActive(save,m));
export const areaInfo=r=>r===PANTHEON.r?PANTHEON:REGIONS[r];
export function freshSave(){const s=original.freshSave();s.position={...HOME};return s;}
export function migrateWorldLayout(save){if(save.worldLayout!==3){save.position={...HOME};save.worldLayout=3;}return save;}
export function makeWorld(save){
 const source=original.makeWorld(save),blocks=new Set(),water=new Set();
 for(let y=0;y<WORLD_H;y++)for(let x=0;x<WORLD_W;x++){const k=`${x},${y}`;if(geo.land[y*WORLD_W+x]<0){blocks.add(k);water.add(k);}else if(geo.privateCells.has(k))blocks.add(k);}
 const sites=source.sites.map(s=>({...s,...sitePositions.get(s.id)})),lookup=new Map(source.sites.map(s=>[s.id,s]));
 const enemies=source.enemies.map(e=>{
   const src=e.site?lookup.get(e.site):e.encounterId?original.ENCOUNTERS.find(a=>a.id===e.encounterId):e.returnId?original.RETURNS.find(m=>m.id===e.returnId):original.relayFor(e.r);
   const dest=e.site?sitePositions.get(e.site):relocate(src,e.r),dx=dest.x-src.x,dy=dest.y-src.y;
   return {...e,x:e.x+dx,y:e.y+dy,homeX:e.homeX+dx,homeY:e.homeY+dy};
 });
 const chests=source.chests.map(p=>({...p,...pickups.get(p.id)})),stations=source.stations.map(p=>({...p,...pickups.get(p.id)})),arenas=source.arenas.map(p=>relocate(p));
 const props=[],important=[...sites,...chests,...stations,...WORKSHOPS,...arenas];
 const clearance=p=>important.some(q=>dist(p,q)<(q.radius||3.2));
 for(const p of source.props){if(p.type==='mountain'||p.type==='landmark')continue;const moved=relocate(p);if(!geo.isLand(moved.x,moved.y)||regionAt(moved.x,moved.y)!==p.r||clearance(moved)||geo.isRoad(moved.x,moved.y))continue;const k=`${Math.floor(moved.x)},${Math.floor(moved.y)}`;if(blocks.has(k))continue;props.push(moved);if(source.blocks.has(`${Math.floor(p.x)},${Math.floor(p.y)}`))blocks.add(k);}
 const world={...source,sites,enemies,chests,stations,arenas,props,blocks,water};
 for(const p of [...important,...enemies])for(let dy=-2;dy<=2;dy++)for(let dx=-2;dx<=2;dx++){const x=Math.floor(p.x)+dx,y=Math.floor(p.y)+dy;if(geo.isLand(x+.5,y+.5))blocks.delete(`${x},${y}`);}
 for(const k of geo.roadCells)if(!water.has(k)&&!geo.privateCells.has(k))blocks.delete(k);
 return buildPantheon(world);
}
export function canWalk(world,save,x,y){const r=regionAt(x,y);return x>=1&&y>=1&&x<WORLD_W-1&&y<WORLD_H-1&&original.areaUnlocked(save,r)&&!world.blocks.has(`${x},${y}`);}
export function nearestWalkable(world,save,point){const cx=Math.floor(point.x),cy=Math.floor(point.y);if(canWalk(world,save,cx,cy))return {...point};for(let radius=1;radius<=8;radius++){const options=[];for(let dy=-radius;dy<=radius;dy++)for(let dx=-radius;dx<=radius;dx++)if(Math.max(Math.abs(dx),Math.abs(dy))===radius&&canWalk(world,save,cx+dx,cy+dy))options.push({x:cx+dx+.5,y:cy+dy+.5});options.sort((a,b)=>dist(a,point)-dist(b,point));if(options[0])return options[0];}return {...HOME};}
// Adventure's four-neighbor breadth-first navigation, on the Miami collision grid.
export function pathfind(world,save,from,to){const sx=Math.floor(from.x),sy=Math.floor(from.y),tx=Math.floor(to.x),ty=Math.floor(to.y);if(!canWalk(world,save,tx,ty))return [];const q=[[sx,sy]],seen=new Map([[`${sx},${sy}`,null]]);for(let i=0;i<q.length;i++){const [x,y]=q[i];if(x===tx&&y===ty)break;for(const [dx,dy]of [[1,0],[-1,0],[0,1],[0,-1]]){const nx=x+dx,ny=y+dy,k=`${nx},${ny}`;if(seen.has(k)||!canWalk(world,save,nx,ny))continue;seen.set(k,`${x},${y}`);q.push([nx,ny]);}}let k=`${tx},${ty}`;if(!seen.has(k))return [];const route=[];while(seen.get(k)!==null){const [x,y]=k.split(',').map(Number);route.push({x:x+.5,y:y+.5});k=seen.get(k);}return route.reverse();}
