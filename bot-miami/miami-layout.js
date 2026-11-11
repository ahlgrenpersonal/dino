import {AREAS,BRIDGES,ROADS,KEY_LOOP,PRIVATE_ZONES,LANDMARKS} from './miami-geography.js?v=world97';
import {PANTHEON,inPantheon} from './pantheon.js?v=world97';
export const SCALE=3,WORLD_W=612,WORLD_H=588;
export const point=p=>({x:Math.floor(p.x*SCALE)+.5,y:Math.floor(p.y*SCALE)+.5});
export const HOME=point({x:94,y:81});
export const names=['Brickell & Brickell Key','Little Havana','Coconut Grove','Dinner Key Marina','Hobie Beach','Virginia Key','Crandon Park','Cape Florida','Bayfront Park','Bayside & Downtown','Museum Park','Frost Science','Miami Beach','South of Fifth','South Pointe'];
export const landmarks=LANDMARKS.map(l=>({...l,...point(l)}));
export function inside(p,poly){let hit=false;for(let i=0,j=poly.length-1;i<poly.length;j=i++){const a=poly[i],b=poly[j];if((a[1]>p.y)!==(b[1]>p.y)&&p.x<(b[0]-a[0])*(p.y-a[1])/(b[1]-a[1])+a[0])hit=!hit;}return hit;}
export function onLine(p,points,width){return points.slice(1).some((b,i)=>{const a=points[i],dx=b.x-a.x,dy=b.y-a.y,t=Math.max(0,Math.min(1,((p.x-a.x)*dx+(p.y-a.y)*dy)/(dx*dx+dy*dy)));return Math.hypot(p.x-a.x-t*dx,p.y-a.y-t*dy)<width/2;});}
function chapter(area,p){if(area<=1)return 0;if(area===2)return 1;if(area===3)return p.y<118?2:3;if(area===4)return p.y>=166?7:p.y>=132?6:p.x<126?4:5;if(area===5)return p.y>=43?8:9;if(area===6)return p.y>=18?10:11;return p.y<44?12:p.y<56?13:14;}
function landRegion(x,y){const p={x:x/SCALE,y:y/SCALE},b=BRIDGES.find(b=>onLine(p,b.points,b.width));if(b)return b.name==='Bear Cut Bridge'?6:b.name==='MacArthur Causeway'?12:chapter(b.area,p);const a=AREAS.findLast(a=>a.polys.some(poly=>inside(p,poly)));return a?chapter(a.id,p):-1;}
export const land=new Int16Array(WORLD_W*WORLD_H).fill(-1),owners=new Int16Array(WORLD_W*WORLD_H).fill(-1);
export const cells=Array.from({length:16},()=>[]),privateCells=new Set(),roadCells=new Set(),bridgeCells=new Set();
const queue=[];
for(let y=0;y<WORLD_H;y++)for(let x=0;x<WORLD_W;x++){
 const k=y*WORLD_W+x,r=inPantheon(x+.5,y+.5)?15:landRegion(x+.5,y+.5);land[k]=owners[k]=r;
 if(r>=0){cells[r].push({x:x+.5,y:y+.5});queue.push([x,y,0]);}
 const p={x:(x+.5)/SCALE,y:(y+.5)/SCALE};
 if(PRIVATE_ZONES.some(poly=>inside(p,poly)))privateCells.add(`${x},${y}`);
 if(BRIDGES.some(b=>onLine(p,b.points,b.width)))bridgeCells.add(`${x},${y}`);
 if(ROADS.some(road=>onLine(p,road.points,1))||onLine(p,KEY_LOOP,1.15)||bridgeCells.has(`${x},${y}`))roadCells.add(`${x},${y}`);
}
// Bay cells keep Adventure's regional boat ownership; walking still requires land.
for(let i=0;i<queue.length;i++){const [x,y,d]=queue[i];if(d>=8)continue;for(const [dx,dy] of [[1,0],[-1,0],[0,1],[0,-1]]){const nx=x+dx,ny=y+dy,k=ny*WORLD_W+nx;if(nx<0||ny<0||nx>=WORLD_W||ny>=WORLD_H||owners[k]>=0)continue;owners[k]=owners[y*WORLD_W+x];queue.push([nx,ny,d+1]);}}
export const regionAt=(x,y)=>x>=0&&y>=0&&x<WORLD_W&&y<WORLD_H?owners[Math.floor(y)*WORLD_W+Math.floor(x)]:-1;
export const isLand=(x,y)=>x>=0&&y>=0&&x<WORLD_W&&y<WORLD_H&&land[Math.floor(y)*WORLD_W+Math.floor(x)]>=0&&!privateCells.has(`${Math.floor(x)},${Math.floor(y)}`);
export const isRoad=(x,y)=>roadCells.has(`${Math.floor(x)},${Math.floor(y)}`);
export const bounds=cells.map((list,r)=>r===15?{x:PANTHEON.x,y:PANTHEON.y,width:PANTHEON.width,height:PANTHEON.height}:({x:Math.min(...list.map(p=>p.x))-.5,y:Math.min(...list.map(p=>p.y))-.5,width:Math.max(...list.map(p=>p.x))-Math.min(...list.map(p=>p.x))+1,height:Math.max(...list.map(p=>p.y))-Math.min(...list.map(p=>p.y))+1}));
export const regionOrigin=r=>({x:bounds[r].x,y:bounds[r].y});
export const coastColor=r=>r>=4&&r<=7||r>=12?'#dfd2a6':r===2||r===3?'#91ba87':r===10||r===11?'#acd0bc':'#b1c8b5';
