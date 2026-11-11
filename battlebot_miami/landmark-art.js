// Original game illustrations, drawn from public building and park references.
import {rounded} from './bot-art.js?v=world18';
const ink='#345f68';
function line(c,x,y,xx,yy,color,width=.07){c.beginPath();c.moveTo(x,y);c.lineTo(xx,yy);c.strokeStyle=color;c.lineWidth=width;c.stroke();}
function oval(c,x,y,rx,ry,color){c.beginPath();c.ellipse(x,y,rx,ry,0,0,Math.PI*2);c.fillStyle=color;c.fill();}
function shape(c,pts,color,stroke=ink){c.beginPath();pts.forEach(([x,y],i)=>i?c.lineTo(x,y):c.moveTo(x,y));c.closePath();c.fillStyle=color;c.fill();if(stroke){c.lineWidth=.05;c.strokeStyle=stroke;c.stroke();}}
function text(c,s,x,y,size=.4){if(c.showLabels===false&&/[A-Za-z0-9]/.test(s))return;c.font=`800 ${size}px system-ui`;c.textAlign='center';c.lineWidth=.15;c.strokeStyle='#f4f1d8';c.strokeText(s,x,y);c.fillStyle=ink;c.fillText(s,x,y);}
function lawn(c,w=3,h=1.6){oval(c,0,.35,w,h,'#91c98b');oval(c,0,.3,w-.25,h-.2,'#aed99a');}
function swing(c,x,y){line(c,x-.8,y+.6,x-.5,y-1.2,'#6f8fa1',.12);line(c,x+.8,y+.6,x+.5,y-1.2,'#6f8fa1',.12);line(c,x-.5,y-1.2,x+.5,y-1.2,'#7bb1be',.13);for(const xx of [x-.2,x+.2])line(c,xx,y-1.15,xx,y-.1,'#6a7f7a',.04);rounded(c,x-.3,y-.1,.6,.13,.04,'#f5b36a');}
function slide(c,x,y,color='#ed9c6d'){rounded(c,x-.45,y-1.6,.9,1.4,.08,'#a0cbd5',ink,.04);shape(c,[[x-.65,y-1.6],[x,y-2.1],[x+.65,y-1.6]],'#e4cb82');shape(c,[[x+.3,y-1.1],[x+1.2,y+.35],[x+1.6,y+.35],[x+.65,y-1.1]],color);for(const yy of [-1.2,-.8,-.4])line(c,x-.5,y+yy,x-.1,y+yy,'#f7efcf',.06);}
export function panorama(c){
 lawn(c,3,1);rounded(c,-2.25,-.65,4.5,.95,.12,'#e2e3d1',ink,.07);
 // One continuous tower: chamfered blue-glass sides, pale balcony bands and a projecting crown.
 shape(c,[[-1.45,-.65],[-1.45,-8.6],[-1.12,-9.1],[1.12,-9.1],[1.45,-8.6],[1.45,-.65]],'#7baabc');
 shape(c,[[-1.45,-8.6],[-1.12,-9.1],[-1.12,-.65],[-1.45,-.65]],'#4f7d98');
 rounded(c,-.7,-8.75,1.4,8.1,.06,'#b9c5c4');
 for(let y=-8.65;y<-.8;y+=.27){line(c,-1.32,y,1.32,y,'#e8e5d4',.075);line(c,-.7,y+.1,.7,y+.1,'#889fa5',.045);}
 for(const x of [-1.08,1.08])line(c,x,-8.8,x,-.7,'#cbe7e4',.055);
 shape(c,[[-1.65,-8.95],[-1.25,-9.4],[1.25,-9.4],[1.65,-8.95],[1.45,-8.72],[-1.45,-8.72]],'#d9d9c6');
 shape(c,[[-1.34,-8.96],[-1.08,-9.2],[1.08,-9.2],[1.34,-8.96]],'#527e96');
 for(let x=-1.8;x<1.9;x+=.6)rounded(c,x,-.5,.45,.65,.025,'#577e8c');
 if(c.showLabels===false)text(c,'⌂',0,1.8,.7);text(c,'PANORAMA TOWER',0,-10.05,.48);text(c,'Trash Can Building',0,2,.43);text(c,'⌂ SAFE HOME',0,2.7,.36);
}
function mall(c,l,seen){
 rounded(c,-3,-1.8,2.5,2,.12,'#e2dfcc',ink,.05);rounded(c,.5,-2.4,2.6,2.6,.12,'#d3e1dc',ink,.05);
 for(const side of [-1,1])for(let y=-1.5;y<.1;y+=.5)rounded(c,side<0?-2.8:.7,y,2.1,.27,.02,'#78afb5');
 // A wave-like Climate Ribbon canopy connects the shopping blocks.
 for(let x=-2.6;x<=2.6;x+=.3){const y=-2.35+Math.sin(x*1.2)*.35;line(c,x,y,x+.3,y-.1,'#fff4d8',.2);line(c,x,y+.05,x,y+.55,'#a5c6c0',.04);}
 rounded(c,-.8,.1,1.6,.8,.12,'#efc994',ink,.06);text(c,seen?'✓':'ϟ',0,.72,.6);text(c,l.name,0,-3.35,.44);text(c,seen?'Trail tires found':'Trail tires inside',0,1.65,.36);
}
function play(c,l){
 lawn(c);const pirate=l.kind==='pirate-playground',hammock=l.id==='hammock';
 if(pirate){shape(c,[[-2,-.9],[1.1,-.9],[.7,.1],[-1.5,.1]],'#bd8a60');line(c,-.7,-.6,-.7,-2.8,'#a3815e',.09);shape(c,[[-.6,-2.6],[-.6,-1.3],[.5,-1.3]],'#e4f1db');slide(c,1,.2,'#84ccdf');oval(c,-1,.2,.25,.25,'#5c929b');}
 else{slide(c,-1,0,l.kind==='splash-park'?'#80d4df':'#eea36c');swing(c,1.2,-.1);}
 if(hammock){for(const x of [-3,3])line(c,x,.4,x,-3.1,'#cbd8d1',.2);line(c,-4,-3.1,4,-3.1,'#718d8f',.45);line(c,-4,-3.25,4,-3.25,'#bce1d5',.1);text(c,'THE UNDERLINE',0,-3.65,.32);}
 if(l.kind==='splash-park'){for(const x of [-2,-1.5,-1]){c.beginPath();c.moveTo(x,1);c.quadraticCurveTo(x-.2,-.4,x+.5,.8);c.strokeStyle='#78d9e5';c.lineWidth=.08;c.stroke();}rounded(c,-.5,.6,1.2,.6,.15,'#c1e9d0');}
 text(c,l.mapName||l.name,0,hammock?2.25:1.95,.4);
}
function groveTowers(c){for(const [x,h] of [[-1.6,3.5],[0,4.4],[1.6,4]]){rounded(c,x-.65,-h,1.3,h,.5,'#c9d5cd',ink,.055);for(let y=-h+.3;y<-.1;y+=.27){line(c,x-.5,y,x+.5,y,'#f3eddb',.08);line(c,x-.46,y+.1,x+.46,y+.1,'#8fb4b8',.08);}}text(c,'Park Grove towers',0,1,.4);}
function marina(c,l){
 rounded(c,-3,-.3,3.8,.7,.08,'#e3d4ac');
 for(let y=-2;y<=2;y+=1){line(c,.1,y,4,y,'#bd9e72',.17);for(let x=1;x<4;x+=.85){line(c,x,y-.45,x,y+.45,'#cdb78e',.1);for(const side of [-1,1]){c.save();c.translate(x,y+side*.4);shape(c,[[-.25,-.15],[.25,-.15],[.2,.2],[0,.4],[-.2,.2]],'#f7f6df');rounded(c,-.14,-.1,.28,.25,.04,'#89b6c8');c.restore();}}}
 rounded(c,-2.6,-1.6,2.8,1.1,.08,'#e4e0c9',ink,.05);rounded(c,-1.4,-2,.4,.5,.07,'#b5c6bc');for(let x=-2.35;x<-.1;x+=.4)rounded(c,x,-1.4,.25,.5,.02,'#5d949e');text(c,'Dinner Key Marina',.3,3,.43);text(c,'Historic waterfront',-1.2,-2.5,.28);
}
export function drawLandmark(c,l,{seen=false}={}){
 c.save();c.translate(l.x,l.y);
 switch(l.kind){
  case 'home':panorama(c);break;
  case 'mall':mall(c,l,seen);break;
  case 'playground':case 'pirate-playground':case 'splash-park':play(c,l);break;
  case 'grove-towers':groveTowers(c);break;
  case 'marina':marina(c,l);break;
  case 'cocowalk':
   lawn(c,2.5,1);for(const x of [-2.1,0,2.1]){rounded(c,x-.8,-1.5,1.6,1.5,.08,'#e9e3d0',ink,.04);for(let xx=x-.6;xx<x+.7;xx+=.4)line(c,xx,-1.3,xx,-.1,'#7da4a4',.15);}rounded(c,-1.6,.4,3.2,.25,.06,'#c8bd9d');text(c,'CocoWalk',0,-2.25,.48);break;
  case 'bayfront':lawn(c,4,2.7);for(const x of [-2.6,2.6]){rounded(c,x-.4,-.5,.8,.3,.04,'#bcaa80');}text(c,'Bayfront Park',0,3.4,.47);break;
  case 'fountain':
   oval(c,0,0,2.5,1.5,'#c7c7b2');oval(c,0,-.1,2.2,1.2,'#75bdce');oval(c,0,-.1,1.75,.85,'#97dae0');
   for(let i=0;i<12;i++){const a=i*Math.PI/6,x=Math.cos(a)*1.7,y=Math.sin(a)*.7;c.beginPath();c.moveTo(x,y);c.quadraticCurveTo(x*.55,-2.4,x*.3,y*.3);c.strokeStyle=i%2?'#d8fbef':'#a9e4ef';c.lineWidth=.085;c.stroke();}line(c,0,-.2,0,-2.9,'#d8ffff',.15);oval(c,0,-2.8,.3,.2,'#edffff');text(c,l.name,0,2.3,.4);break;
  case 'bayside':
   for(const x of [-2.4,-.8,.8,2.4]){rounded(c,x-.7,-1.6,1.4,1.7,.07,'#f1cfaa',ink,.04);shape(c,[[x-.9,-1.6],[x,-2.3],[x+.9,-1.6]],'#d5877e');rounded(c,x-.45,-1,.9,1,.025,'#75a4a9');}rounded(c,-3.2,.3,6.4,.4,.07,'#dbc9a2');text(c,l.name,0,-3,.43);break;
  case 'bayside-marina':
   for(let j=0;j<3;j++){const y=j*1.2-1.3;line(c,-1,y,3.3,y,'#c9ad82',.18);for(let x=.2;x<3.1;x+=.85){shape(c,[[x-.25,y+.25],[x+.25,y+.25],[x+.2,y+.7],[x,y+.9],[x-.2,y+.7]],'#f5f1d9');rounded(c,x-.15,y+.3,.3,.25,.03,'#82b3c4');}}
   for(const x of [-2.2,-.9]){oval(c,x,-1,.7,.3,'#e8c58c');shape(c,[[x-.9,-1.1],[x,-2],[x+.9,-1.1]],'#e99681');line(c,x,-1.1,x,-.4,ink,.06);}text(c,l.name,0,3,.4);break;
  case 'wheel':
   line(c,-1.2,1,0,-1.5,'#d4ddd4',.18);line(c,1.2,1,0,-1.5,'#d4ddd4',.18);c.beginPath();c.arc(0,-1.5,2,0,Math.PI*2);c.strokeStyle='#ecf2df';c.lineWidth=.14;c.stroke();
   for(let i=0;i<12;i++){const a=i*Math.PI/6,x=Math.cos(a)*2,y=-1.5+Math.sin(a)*2;line(c,0,-1.5,x,y,'#a4c6c8',.045);rounded(c,x-.25,y-.05,.5,.45,.09,['#e8bb8f','#a8d4dc','#e6a3ad'][i%3],ink,.035);}text(c,l.name,0,2,.4);break;
  case 'arena':
   rounded(c,-3,-1.4,6,2,.7,'#dee6da',ink,.05);oval(c,0,-1.4,3,.9,'#b7c9c8');oval(c,0,-1.45,2.1,.5,'#86a2ab');for(let x=-2.4;x<=2.4;x+=.6)rounded(c,x-.15,-.7,.3,.9,.03,'#76a6b3');text(c,l.name,0,1.7,.4);break;
  case 'sculpture-park':
   lawn(c);for(const [x,col] of [[-1.7,'#e7ae8c'],[0,'#d9d786'],[1.7,'#8bcad4']]){rounded(c,x-.5,-.6,1,.7,.15,col,ink,.03);oval(c,x+.5,-.8,.3,.35,col);line(c,x-.3,.1,x-.3,.4,ink,.06);line(c,x+.25,.1,x+.25,.4,ink,.06);}text(c,l.name,0,2.5,.4);break;
  case 'art-museum':
   rounded(c,-2.7,-1.2,5.4,1.4,.08,'#b3bfb5',ink,.04);line(c,-3.2,-1.4,3.2,-1.4,'#d8ccaa',.23);for(let x=-2.5;x<=2.5;x+=.6){line(c,x,-1.5,x,-.3,'#6e9a79',.15);rounded(c,x-.12,-.8,.24,.8,.08,'#82ae7e');}text(c,l.name,0,1,.35);break;
  case 'guarded-beach':
   lawn(c,2.8,1);for(const x of [-1.2,1.2])line(c,x,.7,x,-1.5,'#a98d60',.12);rounded(c,-1.5,-2,3,1.2,.08,'#efc68a',ink,.05);rounded(c,-1,-1.8,2,.55,.04,'#75aab9');shape(c,[[-1.9,-2],[0,-2.8],[1.9,-2]],'#e69979');line(c,1.6,-2,1.6,-3.4,ink,.06);shape(c,[[1.6,-3.4],[2.5,-3.1],[1.6,-2.9]],'#e67f78');for(let y=-.6;y<=.7;y+=.32)line(c,-.6,y,.6,y,'#d4b68b',.08);text(c,l.name,0,2,.4);break;
  case 'lighthouse':
   lawn(c,2.6,1);shape(c,[[-1,0],[-.65,-6],[.65,-6],[1,0]],'#f1efdb');rounded(c,-.85,-6.6,1.7,.8,.06,'#364e57');shape(c,[[-1,-6.7],[0,-7.4],[1,-6.7]],'#344b54');for(const y of [-1.7,-3.6,-5.2])rounded(c,-.13,y,.26,.45,.05,'#637e85');rounded(c,-.3,-.7,.6,.8,.04,'#889c99');line(c,-1,-5.9,1,-5.9,'#304b55',.1);text(c,l.name,0,1.6,.4);break;
  case 'twisting-towers':
   for(const side of [-1,1])for(let i=0;i<16;i++){const shift=Math.sin(i/15*Math.PI*.85)*side*.55;rounded(c,side*1.3-.8+shift,-.25-i*.24,1.6,.29,.05,i%2?'#dce8df':'#89b6c1',ink,.025);}text(c,l.name,0,1,.4);break;
  case 'curved-towers':
   for(const [x,h] of [[-1,4.2],[1,4.7]]){rounded(c,x-.8,-h,1.6,h,.3,'#96b4bc',ink,.04);for(let y=-h+.3;y<0;y+=.35)rounded(c,x-.95,y,1.9,.16,.08,'#e8e0c8',ink,.02);}text(c,l.name,0,1,.4);break;
  case 'city-hall':
   rounded(c,-2.7,-1.3,5.4,1.5,.08,'#eee3ca',ink,.04);rounded(c,-.4,-2.6,.8,1.4,.05,'#e5dcc6',ink,.04);shape(c,[[-.6,-2.6],[0,-3.1],[.6,-2.6]],'#9bacb4');for(let x=-2.3;x<2.4;x+=.7)rounded(c,x,-1,.4,.7,.03,'#77a4ae');text(c,l.name,0,1.4,.4);break;
  case 'domino':
   lawn(c);for(const [x,y] of [[-1.2,-.4],[1.2,-.4],[0,.8]]){rounded(c,x-.7,y-.45,1.4,.9,.06,'#efdfb4',ink,.04);for(const side of [-1,1]){rounded(c,x+side*.3-.15,y-.16,.3,.5,.03,'#f4f1da',ink,.02);oval(c,x+side*.3,y, .045,.045,ink);oval(c,x+side*.3,y+.17,.045,.045,ink);}}text(c,l.name,0,2.4,.4);break;
  case 'theater':
   rounded(c,-2,-2.5,4,2.5,.08,'#e6c693',ink,.04);rounded(c,-.6,-4.2,1.2,3.2,.05,'#97b6b4',ink,.04);for(let y=-3.8;y<-1.5;y+=.45)rounded(c,-.35,y,.7,.15,.03,'#f6e3b7');shape(c,[[-2.6,-1.2],[0,-1.6],[2.6,-1.2],[2.3,-.4],[-2.3,-.4]],'#ce8677');text(c,l.name,0,1.2,.4);break;
  case 'art-deco':
   for(const [x,h,col] of [[-1.5,2.3,'#efa9ac'],[.1,3,'#f0e5cc'],[1.6,2.5,'#b6dbd1']]){rounded(c,x-.6,-h,1.2,h,.2,col,ink,.04);for(let y=-h+.3;y<0;y+=.4)line(c,x-.5,y,x+.5,y,'#639fa6',.09);}text(c,'SOUTH OF FIFTH',0,1,.45);break;
  case 'pier':line(c,-.7,0,3.2,0,'#dfcc9d',.55);line(c,3.1,-.7,3.1,.7,'#f1deb3',.7);for(let x=-.7;x<3.5;x+=.4)line(c,x,-.35,x,.35,ink,.035);text(c,'South Pointe Pier',0,1.5,.37);break;
  default:c.restore();return false;
 }
 c.restore();return true;
}
