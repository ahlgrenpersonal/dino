import {bounds as geographicBounds} from './miami-layout.js?v=world97';
import {currentMission} from './data.js?v=world97';
import {REGIONS,REGION_TILES,REGION_W,REGION_H,RETURNS,PANTHEON,areaUnlocked,pantheonUnlocked,returnActive,unlockedRegion} from './data.js?v=world97';

export function atlasProgress(save){
  const visible=new Set(REGIONS.map((_,r)=>r).filter(r=>areaUnlocked(save,r)||save.bosses.includes(r)));
  if(pantheonUnlocked(save))visible.add(PANTHEON.r);
  const mission=currentMission(save);
  const active=mission?mission.r:pantheonUnlocked(save)?save.royalCourt?.phase==='victory'?null:PANTHEON.r:save.bosses.includes(unlockedRegion(save))?null:unlockedRegion(save);
  const tiles=[],areas=[...visible].map(r=>geographicBounds[r]);
  const left=Math.min(...areas.map(b=>b.x)),top=Math.min(...areas.map(b=>b.y));
  const width=Math.max(...areas.map(b=>b.x+b.width))-left,height=Math.max(...areas.map(b=>b.y+b.height))-top;
  const scale=Math.min(552/width,712/height);
  return {visible,active,newArea:active!==null&&(!save.visited.includes(active)||mission?.postRoyal||active===PANTHEON.r&&save.royalRematchStarted),tiles,scale,ox:(600-width*scale)/2-left*scale,oy:(760-height*scale)/2-top*scale,bounds:{x:(600-width*scale)/2,y:(760-height*scale)/2,width:width*scale,height:height*scale}};
}

export function regionEdges(tiles){
  const cells=new Set(tiles.map(([x,y])=>`${x},${y}`)),edges=[];
  for(const [x,y] of tiles){
    if(!cells.has(`${x},${y-1}`))edges.push([x,y,x+1,y]);
    if(!cells.has(`${x+1},${y}`))edges.push([x+1,y,x+1,y+1]);
    if(!cells.has(`${x},${y+1}`))edges.push([x+1,y+1,x,y+1]);
    if(!cells.has(`${x-1},${y}`))edges.push([x,y+1,x,y]);
  }
  return edges;
}
