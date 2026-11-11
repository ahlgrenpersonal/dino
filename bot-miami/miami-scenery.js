// Decorative city surfaces and scenery. These never add collision cells.
import {land,cells,privateCells,landmarks,point,regionAt,isLand,WORLD_W,WORLD_H,SCALE} from './miami-layout.js?v=world99';
import {ROADS,BRIDGES,AREAS,KEY_LOOP} from './miami-geography.js?v=world99';
export const SURFACE={water:0,paving:1,road:2,sidewalk:3,grass:4,sand:5,boardwalk:6,trail:7,private:8,bridge:9};
export const PALETTE=['#64bacb','#e3e0d2','#647b82','#f5edda','#a8c791','#efddad','#d2b785','#c5dbb1','#749d7c','#87999b'];
export const surfaces=new Uint8Array(WORLD_W*WORLD_H),shoreDistance=new Uint8Array(WORLD_W*WORLD_H).fill(255),roadAxis=new Uint8Array(WORLD_W*WORLD_H),crosswalks=new Set();
const key=(x,y)=>`${x},${y}`,index=(x,y)=>y*WORLD_W+x;
const queue=[];
for(let y=1;y<WORLD_H-1;y++)for(let x=1;x<WORLD_W-1;x++)if(land[index(x,y)]>=0&&[[1,0],[-1,0],[0,1],[0,-1]].some(([dx,dy])=>land[index(x+dx,y+dy)]<0)){shoreDistance[index(x,y)]=0;queue.push([x,y]);}
for(let i=0;i<queue.length;i++){const [x,y]=queue[i],d=shoreDistance[index(x,y)]+1;if(d>30)continue;for(const [dx,dy]of[[1,0],[-1,0],[0,1],[0,-1]]){const nx=x+dx,ny=y+dy,k=index(nx,ny);if(nx<1||ny<1||nx>=WORLD_W-1||ny>=WORLD_H-1||land[k]<0||shoreDistance[k]<=d)continue;shoreDistance[k]=d;queue.push([nx,ny]);}}
for(let y=0;y<WORLD_H;y++)for(let x=0;x<WORLD_W;x++){
 const k=index(x,y),r=land[k];if(r<0)continue;
 surfaces[k]=[0,1,8,9,12,13,14].includes(r)?SURFACE.paving:SURFACE.grass;
 if(privateCells.has(key(x,y)))surfaces[k]=SURFACE.private;
 else if(([4,5,6,7].includes(r)&&shoreDistance[k]<7)||(r>=12&&r<15&&x>184*SCALE))surfaces[k]=SURFACE.sand;
 else if(shoreDistance[k]<2&&[0,3,8,9,10,11,12,13,14].includes(r))surfaces[k]=SURFACE.sidewalk;
}
function patch(p,rx,ry,type){const minX=Math.max(0,Math.floor(p.x-rx)),maxX=Math.min(WORLD_W-1,Math.ceil(p.x+rx)),minY=Math.max(0,Math.floor(p.y-ry)),maxY=Math.min(WORLD_H-1,Math.ceil(p.y+ry));for(let y=minY;y<=maxY;y++)for(let x=minX;x<=maxX;x++){const k=index(x,y);if(land[k]<0||privateCells.has(key(x,y))||land[k]===15)continue;if(((x+.5-p.x)/rx)**2+((y+.5-p.y)/ry)**2<1)surfaces[k]=type;}}
for(const l of landmarks){
 if(['park','bayfront','playground','pirate-playground','splash-park','sculpture-park'].includes(l.kind))patch(l,l.kind==='bayfront'?15:8,l.kind==='bayfront'?21:7,SURFACE.grass);
 if(['mall','cocowalk','city-hall','museum','theater','domino','fountain','bayside','bayside-marina'].includes(l.kind))patch(l,7,5,SURFACE.sidewalk);
 if(['beach','guarded-beach','lighthouse'].includes(l.kind))patch(l,8,7,SURFACE.sand);
}
const tracks=[...ROADS.filter(r=>r.name!=='The Underline'),
 {points:[{x:81,y:66},{x:104,y:66}]},{points:[{x:81,y:82},{x:103,y:82}]},{points:[{x:78,y:90},{x:103,y:90}]},
 {points:[{x:84,y:34},{x:105,y:34}]},{points:[{x:84,y:41},{x:105,y:41}]},{points:[{x:84,y:49},{x:99,y:49}]}];
export function segmentDistance(p,a,b){const dx=b.x-a.x,dy=b.y-a.y,t=Math.max(0,Math.min(1,((p.x-a.x)*dx+(p.y-a.y)*dy)/(dx*dx+dy*dy||1)));return Math.hypot(p.x-a.x-t*dx,p.y-a.y-t*dy);}
function rasterLine(points,width,type,axis=false){for(let i=1;i<points.length;i++){const a=point(points[i-1]),b=point(points[i]),minX=Math.max(0,Math.floor(Math.min(a.x,b.x)-width/2-1)),maxX=Math.min(WORLD_W-1,Math.ceil(Math.max(a.x,b.x)+width/2+1)),minY=Math.max(0,Math.floor(Math.min(a.y,b.y)-width/2-1)),maxY=Math.min(WORLD_H-1,Math.ceil(Math.max(a.y,b.y)+width/2+1)),direction=Math.abs(b.x-a.x)>Math.abs(b.y-a.y)?1:2;for(let y=minY;y<=maxY;y++)for(let x=minX;x<=maxX;x++){const k=index(x,y);if(land[k]<0||privateCells.has(key(x,y))||land[k]===15||segmentDistance({x:x+.5,y:y+.5},a,b)>width/2)continue;surfaces[k]=type;if(axis)roadAxis[k]|=direction;}}}
for(const road of tracks)rasterLine(road.points,6.3,SURFACE.sidewalk);
for(const road of tracks)rasterLine(road.points,3.3,SURFACE.road,true);
for(const k of cells.flat().map(p=>index(Math.floor(p.x),Math.floor(p.y))))if(roadAxis[k]===3)crosswalks.add(k);
for(const road of ROADS.filter(r=>r.name==='The Underline')){rasterLine(road.points,6,SURFACE.grass);rasterLine(road.points,2.4,SURFACE.trail);}
rasterLine(KEY_LOOP,3.1,SURFACE.sidewalk);
for(const b of BRIDGES){rasterLine(b.points,b.width*SCALE,b.wood?SURFACE.boardwalk:SURFACE.sidewalk);if(!b.wood)rasterLine(b.points,Math.max(2,b.width*SCALE-3),SURFACE.road,true);}
// A lowered double-leaf deck covers the river itself, not the street approaches.
const riverY=58*SCALE,riverColumns=[];
for(let x=96*SCALE-7;x<=96*SCALE+7;x++)if(land[index(x,riverY)]>=0)riverColumns.push(x);
const riverLeft=Math.min(...riverColumns),riverRight=Math.max(...riverColumns)+1;
export const riverBridge=Object.freeze({x:(riverLeft+riverRight)/2,y:riverY,width:riverRight-riverLeft,length:2*SCALE});
for(let y=riverBridge.y-riverBridge.length/2;y<riverBridge.y+riverBridge.length/2;y++)for(let x=Math.floor(riverBridge.x-riverBridge.width/2);x<riverBridge.x+riverBridge.width/2;x++)if(land[index(x,y)]>=0)surfaces[index(x,y)]=SURFACE.bridge;
export const surfaceAt=(x,y)=>x>=0&&y>=0&&x<WORLD_W&&y<WORLD_H?surfaces[index(Math.floor(x),Math.floor(y))]:SURFACE.water;
export const surfaceColor=(x,y)=>PALETTE[surfaceAt(x,y)];
const hash=(x,y)=>{let n=Math.imul(x+17,374761393)^Math.imul(y+17,668265263);n=Math.imul(n^(n>>>13),1274126177);return ((n^(n>>>16))>>>0)/4294967296;};
export function makeMiamiScenery(clearings){
 const props=[];
 for(let y=8;y<WORLD_H-8;y+=8)for(let x=8;x<WORLD_W-8;x+=8){
  const p={x:x+.5,y:y+.5},k=index(x,y),r=land[k],s=surfaces[k],seed=hash(x,y);
  if(r<0||r===15||!isLand(p.x,p.y)||[SURFACE.road,SURFACE.bridge,SURFACE.boardwalk,SURFACE.private].includes(s)||clearings.some(q=>Math.hypot(p.x-q.x,p.y-q.y)<(q.radius||4.2)+1))continue;
  if(landmarks.some(l=>Math.hypot(p.x-l.x,p.y-l.y)<6))continue;
  const streetEdge=[[2,0],[-2,0],[0,2],[0,-2]].some(([dx,dy])=>surfaceAt(x+dx,y+dy)===SURFACE.road);
  let type=null;
  if(s===SURFACE.grass&&seed<.48)type=seed<.14&&[2,3].includes(r)?'miami-shade':'miami-palm';
  else if(s===SURFACE.sand&&seed<.16)type='miami-palm';
  else if(streetEdge&&seed<.65)type=seed<.27?'miami-palm':seed<.4?'miami-planter':seed<.53?'miami-bench':'miami-lamp';
  else if(s===SURFACE.paving&&seed<.035)type='miami-planter';
  if(type)props.push({...p,r,type,seed,decorative:true});
 }
 return props;
}
export const staticMoorings=landmarks.filter(l=>['marina','bayside-marina'].includes(l.kind)).map(l=>{
 let best=null,score=Infinity;
 for(let y=Math.floor(l.y)-14;y<=l.y+14;y++)for(let x=Math.floor(l.x)-14;x<=l.x+14;x++){
  if(!isLand(x+.5,y+.5))continue;
  for(const [dx,dy]of[[1,0],[-1,0],[0,1],[0,-1]]){
   let clear=true;for(const d of [1,2,3,4,5])for(const side of [-1,0,1]){const nx=x+dx*d-dy*side,ny=y+dy*d+dx*side;if(nx<0||ny<0||nx>=WORLD_W||ny>=WORLD_H||land[index(nx,ny)]>=0)clear=false;}
   const distance=Math.hypot(x+.5-l.x,y+.5-l.y);if(clear&&distance<score){score=distance;best={x:x+.5,y:y+.5,r:regionAt(l.x,l.y),type:'miami-mooring',id:`mooring-${l.id}`,angle:Math.atan2(dy,dx),length:4,boats:[{depth:2.1,side:-.85},{depth:3.8,side:.85}],decorative:true};}
  }
 }
 return best;
}).filter(Boolean);
