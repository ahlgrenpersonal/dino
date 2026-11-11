import {landmarks,land,privateCells,regionAt,WORLD_W,WORLD_H,bounds} from './miami-layout.js?v=world99';
import {drawLandmark as landmarkArt} from './miami-landmarks.js?v=world99';
import {SURFACE,PALETTE,surfaceAt,surfaceColor,surfaces,roadAxis,crosswalks,riverBridge,staticMoorings} from './miami-scenery.js?v=world99';
import {drawMiamiProp,sceneryBounds,drawRiverBridge} from './miami-street-art.js?v=world99';
export {drawMiamiProp};
export function miamiGround(c,x,y,t,g){
 const type=surfaceAt(x,y),k=y*WORLD_W+x;c.fillStyle=PALETTE[type];c.fillRect(x,y,1.02,1.02);
 if(type===SURFACE.water){if((x+y)%3===0){c.strokeStyle='#d5f4eb70';c.lineWidth=.025;c.beginPath();c.moveTo(x+.12,y+.55);c.lineTo(x+.69,y+.55+Math.sin(t*.8+x)*.025);c.stroke();}return;}
 if(type===SURFACE.road){
  c.strokeStyle='#dce3cd';c.lineWidth=.025;
  if(crosswalks.has(k)){c.fillStyle='#f2edda';for(let i=0;i<3;i++)c.fillRect(x+.07+i*.32,y+.08,.15,.84);}
  else if((x+y)%3!==0){c.beginPath();if(roadAxis[k]===2&&x%3===0){c.moveTo(x+.5,y+.12);c.lineTo(x+.5,y+.77);}if(roadAxis[k]===1&&y%3===0){c.moveTo(x+.12,y+.5);c.lineTo(x+.77,y+.5);}c.stroke();}
 }else if([SURFACE.paving,SURFACE.sidewalk,SURFACE.trail].includes(type)){
  c.strokeStyle=type===SURFACE.paving?'#abae9a26':'#acb5a044';c.lineWidth=.018;c.beginPath();c.moveTo(x,y+1);c.lineTo(x+1,y+1);if((x+y)%2===0){c.moveTo(x+1,y);c.lineTo(x+1,y+1);}c.stroke();
 }else if(type===SURFACE.boardwalk){c.fillStyle='#a78b6544';c.fillRect(x+.06,y,.025,1);c.fillRect(x+.55,y,.025,1);}
 else if(type===SURFACE.private&&[[1,0],[-1,0],[0,1],[0,-1]].some(([dx,dy])=>!privateCells.has(`${x+dx},${y+dy}`))){c.fillStyle='#4e805f';c.beginPath();c.ellipse(x+.5,y+.5,.45,.4,0,0,Math.PI*2);c.fill();c.fillStyle='#8ab785';c.beginPath();c.ellipse(x+.36,y+.32,.21,.14,0,0,Math.PI*2);c.fill();}
 else if(type===SURFACE.grass&&(x*7+y*11)%11===0){c.fillStyle='#6a9d7044';c.fillRect(x+.2,y+.6,.12,.025);c.fillRect(x+.46,y+.32,.04,.08);}
 else if(type===SURFACE.sand&&(x+y)%5===0){c.fillStyle='#d8bd8644';c.fillRect(x+.3,y+.55,.19,.018);c.fillRect(x+.57,y+.3,.09,.018);}
}
export function landmarkBounds(l){
 if(l.kind==='home')return {width:1.8,height:4.7,scale:.46};
 if(l.kind==='museum')return {width:4.2,height:5,scale:.85};
 if(l.kind==='lighthouse')return {width:2.8,height:6.2,scale:.72};
 if(['grove-towers','twisting-towers','curved-towers'].includes(l.kind))return {width:2.8,height:4.5,scale:.8};
 return {width:3.8,height:4.2,scale:.8};
}
export function environmentBounds(p){return p.type==='miami-landmark'?landmarkBounds({...p,kind:p.landmarkKind||p.kind}):sceneryBounds(p);}
export function environmentObjects(x0,y0,x1,y1,unlocked,boats=[]){
 const result=[];
 for(const l of landmarks){const r=regionAt(l.x,l.y),b=landmarkBounds(l);if(r<0||r>unlocked||l.x+b.width<x0||l.x-b.width>x1||l.y+2<y0||l.y-b.height>y1)continue;result.push({...l,landmarkKind:l.kind,r,y:l.y-(l.kind==='home'?.15:0),type:'miami-landmark',kind:'prop'});}
 for(const m of staticMoorings)if(m.r<=unlocked&&m.x>x0-5&&m.x<x1+5&&m.y>y0-5&&m.y<y1+5&&!boats.some(b=>Math.hypot(m.x-b.x,m.y-b.y)<4))result.push({...m,kind:'prop'});
 return result;
}
export function drawLandmark(c,p,t){const kind=p.landmarkKind||p.kind,scale=landmarkBounds({...p,kind}).scale;c.save();c.translate(p.x,p.y);c.scale(scale,scale);const labels=c.showLabels;c.showLabels=false;landmarkArt(c,{...p,kind,x:0,y:0},{world:true});c.showLabels=labels;c.restore();}
export function drawWorldDetails(c,x0,y0,x1,y1,unlocked){if(x1>riverBridge.x-6&&x0<riverBridge.x+6&&y1>riverBridge.y-5&&y0<riverBridge.y+5)drawRiverBridge(c,riverBridge);}
export function miamiMapBase(c,g,progress,detail){
 const {scale:s,ox,oy,visible,active,newArea}=progress;c.fillStyle=PALETTE[SURFACE.water];c.fillRect(0,0,600,760);
 for(let y=0;y<WORLD_H;y++)for(let x=0;x<WORLD_W;x++){const r=land[y*WORLD_W+x];if(!visible.has(r))continue;c.fillStyle=surfaceColor(x,y);c.fillRect(ox+x*s,oy+y*s,s+.15,s+.15);if(r===active){c.fillStyle=newArea?'#ffe06b28':'#ffe69a16';c.fillRect(ox+x*s,oy+y*s,s+.15,s+.15);}}
 if(visible.has(0)||visible.has(8)){c.save();c.translate(ox,oy);c.scale(s,s);drawRiverBridge(c,riverBridge);c.restore();}
 for(const l of landmarks){const r=regionAt(l.x,l.y);if(!visible.has(r))continue;c.save();c.translate(ox+l.x*s,oy+l.y*s);const size=l.kind==='home'?3.4:detail?3.7:2.6;c.scale(size,size);const labels=c.showLabels;c.showLabels=false;landmarkArt(c,{...l,x:0,y:0},{});c.showLabels=labels;c.restore();}
 if(active!==null){const b=bounds[active];c.save();c.strokeStyle='#e7ad31';c.lineWidth=2;c.setLineDash([3,5]);c.strokeRect(ox+b.x*s-3,oy+b.y*s-3,b.width*s+6,b.height*s+6);c.restore();}
}
