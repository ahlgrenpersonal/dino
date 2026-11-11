import {landmarks,land,regionAt,isRoad,coastColor,WORLD_W,WORLD_H,bridgeCells,bounds} from './miami-layout.js?v=world96';
import {drawLandmark as landmarkArt} from './miami-landmarks.js?v=world96';
export function miamiGround(c,x,y,t,g){
 const r=regionAt(x,y),k=`${x},${y}`;
 if(g.world.water.has(k)){c.fillStyle='#64b7c6';c.fillRect(x,y,1.02,1.02);if((x+y)%3===0){c.strokeStyle='#c1e9e577';c.lineWidth=.025;c.beginPath();c.moveTo(x+.1,y+.5);c.lineTo(x+.7,y+.5+Math.sin(t+x)*.035);c.stroke();}return;}
 c.fillStyle=isRoad(x,y)?bridgeCells.has(k)?'#d7c59e':'#d9cfae':coastColor(r);c.fillRect(x,y,1.02,1.02);
 if(isRoad(x,y)){c.fillStyle='#f6edd133';c.fillRect(x+.04,y+.04,.92,.06);}else if((x*7+y*11)%9===0){c.fillStyle='#4f8e5938';c.fillRect(x+.2,y+.6,.1,.04);c.fillRect(x+.4,y+.3,.04,.08);}
 if(g.world.blocks.has(k)&&land[y*WORLD_W+x]===0){c.fillStyle='#739e8b';c.fillRect(x+.1,y+.1,.8,.8);}
}
export function environmentObjects(x0,y0,x1,y1,unlocked){return landmarks.filter(l=>regionAt(l.x,l.y)>=0&&regionAt(l.x,l.y)<=unlocked&&l.x>x0-5&&l.x<x1+5&&l.y>y0-5&&l.y<y1+10).map(l=>({...l,landmarkKind:l.kind,r:regionAt(l.x,l.y),y:l.y-(l.kind==='home'?3:0),type:'miami-landmark',kind:'prop'}));}
export function drawLandmark(c,p,t,scale=.72){c.save();c.translate(p.x,p.y);c.scale(scale,scale);c.showLabels=false;landmarkArt(c,{...p,kind:p.landmarkKind||p.kind,x:0,y:0},{});c.restore();}
export function miamiMapBase(c,g,progress,detail){
 const {scale:s,ox,oy,visible,active,newArea}=progress;c.fillStyle='#71baca';c.fillRect(0,0,600,760);
 for(let y=0;y<WORLD_H;y++)for(let x=0;x<WORLD_W;x++){const r=land[y*WORLD_W+x];if(!visible.has(r))continue;c.fillStyle=r===active?(newArea?'#f3da84':'#e9dfa4'):coastColor(r);c.fillRect(ox+x*s,oy+y*s,s+.15,s+.15);if(isRoad(x,y)){c.fillStyle=bridgeCells.has(`${x},${y}`)?'#f4e7bd':'#f4ead1';c.fillRect(ox+x*s,oy+y*s,s+.15,s+.15);}}
 for(const l of landmarks){const r=regionAt(l.x,l.y);if(!visible.has(r))continue;c.save();c.translate(ox+l.x*s,oy+l.y*s);c.scale((detail?3.7:2.4),(detail?3.7:2.4));c.showLabels=false;landmarkArt(c,{...l,x:0,y:0},0);c.restore();}
 if(active!==null){const b=bounds[active];c.save();c.strokeStyle='#e7ad31';c.lineWidth=2;c.setLineDash([3,5]);c.strokeRect(ox+b.x*s-3,oy+b.y*s-3,b.width*s+6,b.height*s+6);c.restore();}
}
