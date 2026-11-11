// Original game illustrations, drawn from public building and park references.
import {rounded} from './bot-art.js?v=world25';
const ink='#294e59',cream='#f7eed7',glass='#427f98';
function line(c,x,y,xx,yy,color,width=.07){c.beginPath();c.moveTo(x,y);c.lineTo(xx,yy);c.strokeStyle=color;c.lineWidth=width;c.lineCap='round';c.lineJoin='round';c.stroke();}
function oval(c,x,y,rx,ry,color,stroke=null,width=.06){c.beginPath();c.ellipse(x,y,rx,ry,0,0,Math.PI*2);c.fillStyle=color;c.fill();if(stroke){c.strokeStyle=stroke;c.lineWidth=width;c.stroke();}}
function shape(c,pts,color,stroke=ink,width=.065){c.beginPath();pts.forEach(([x,y],i)=>i?c.lineTo(x,y):c.moveTo(x,y));c.closePath();c.fillStyle=color;c.fill();if(stroke){c.lineWidth=width;c.strokeStyle=stroke;c.stroke();}}
function text(c,s,x,y,size=.4){if(c.showLabels===false&&/[A-Za-z0-9]/.test(s))return;c.font=`800 ${size}px system-ui`;c.textAlign='center';c.lineWidth=.15;c.strokeStyle='#f4f1d8';c.strokeText(s,x,y);c.fillStyle=ink;c.fillText(s,x,y);}
function gradient(c,x,y,xx,yy,colors){const g=c.createLinearGradient(x,y,xx,yy);colors.forEach((col,i)=>g.addColorStop(i/(colors.length-1),col));return g;}
function shadow(c,x=0,y=.35,w=3,h=.8){oval(c,x+.2,y+.14,w,h,'#264d5330');}
function lawn(c,w=3,h=1.6){shadow(c,0,.5,w+.14,h*.75);oval(c,0,.4,w,h,'#629b6d',ink,.055);oval(c,-.03,.25,w-.15,h-.13,'#91ca8c');oval(c,-.35,.12,w*.68,h*.64,'#acd999');}
function path(c,x,y,xx,yy,w=.35){line(c,x,y,xx,yy,'#b5b78d',w+.1);line(c,x,y-.035,xx,yy-.035,'#e9dfbb',w);}
function bench(c,x,y,s=1){c.save();c.translate(x,y);c.scale(s,s);shadow(c,0,.22,.62,.18);for(const xx of [-.43,.43])line(c,xx,-.16,xx,.39,ink,.075);rounded(c,-.67,-.43,1.34,.38,.055,'#a77748',ink,.055);line(c,-.56,-.3,.56,-.3,'#e6bf7a',.075);rounded(c,-.7,-.02,1.4,.25,.055,'#d6aa68',ink,.055);line(c,-.6,.03,.6,.03,'#f1cd8c',.045);c.restore();}
function bush(c,x,y,s=.55){shadow(c,x,y+.14,s,.18);oval(c,x,y,s,.4*s,'#538d65');oval(c,x-.17*s,y-.1*s,s*.62,s*.4,'#80b979');oval(c,x+.28*s,y-.1*s,s*.52,s*.35,'#a5d08b');}
function parkTree(c,x,y,s=1){shadow(c,x+.1,y+.15,.75*s,.25*s);line(c,x,y+.18,x-.04*s,y-1.5*s,'#80694b',.17*s);line(c,x-.03*s,y-.7*s,x-.46*s,y-1.45*s,'#80694b',.1*s);oval(c,x-.5*s,y-1.55*s,.75*s,.61*s,'#397d59',ink,.045);oval(c,x+.29*s,y-1.8*s,.85*s,.7*s,'#4e9566',ink,.045);oval(c,x-.14*s,y-2.05*s,.74*s,.65*s,'#68ab72',ink,.045);oval(c,x-.3*s,y-2.24*s,.38*s,.25*s,'#a0cf86');}
function planter(c,x,y,w=1.2){rounded(c,x-w/2,y-.18,w,.4,.07,'#aa9470',ink,.045);line(c,x-w*.4,y+.08,x+w*.4,y+.08,'#d5c39c',.065);bush(c,x,y-.2,w*.4);}
function windowPane(c,x,y,w,h){rounded(c,x,y,w,h,.035,glass,ink,.035);shape(c,[[x+.06,y+.06],[x+w*.5,y+.06],[x+w*.22,y+h-.05],[x+.06,y+h-.05]],'#b7e3e033',null);line(c,x+.07,y+.08,x+w-.07,y+.08,'#a8dcdf',.045);}
function volume(c,x,y,w,h,{face='#e3dfcb',side='#9cbbb9',roof='#f6edda',depth=.3}={}){shadow(c,x+w*.5,y+.12,w*.58,.28);rounded(c,x,y-h,w,h,.08,face,ink,.065);shape(c,[[x+w,y],[x+w+depth,y-depth*.55],[x+w+depth,y-h-depth*.55],[x+w,y-h]],side);shape(c,[[x,y-h],[x+depth,y-h-depth*.55],[x+w+depth,y-h-depth*.55],[x+w,y-h]],roof);line(c,x+.08,y-h+.13,x+w-.08,y-h+.13,'#ffffffb0',.055);}
function swing(c,x,y){
 shadow(c,x,y+.5,1,.24);
 for(const side of [-1,1]){line(c,x+side*.82,y+.55,x+side*.58,y-1.5,ink,.15);line(c,x+side*1.06,y+.48,x+side*.58,y-1.5,'#78adbd',.12);line(c,x+side*.83,y+.24,x+side*1.02,y+.22,'#c7e8e2',.045);}
 line(c,x-.69,y-1.52,x+.69,y-1.52,ink,.17);line(c,x-.66,y-1.56,x+.64,y-1.56,'#acd6d9',.055);
 for(const seat of [-.3,.3]){for(const dx of [-.14,.14])line(c,x+seat+dx,y-1.46,x+seat+dx,y-.22,'#365e68',.04);rounded(c,x+seat-.2,y-.24,.4,.17,.055,'#efa35c',ink,.055);}
}
function slide(c,x,y,color='#ed9259',roof='#efca6d'){
 shadow(c,x+.45,y+.35,1.35,.28);
 for(const xx of [x-.45,x+.35])line(c,xx,y+.25,xx,y-1.7,'#436c78',.12);
 volume(c,x-.52,y-.85,1.04,.83,{face:'#65b6c2',side:'#3c8c9d',roof:'#a9e3d9',depth:.14});
 for(const xx of [-.42,-.12,.18,.43])line(c,x+xx,y-1.18,x+xx,y-1.68,'#e6efc7',.065);line(c,x-.5,y-1.68,x+.5,y-1.68,ink,.07);
 shape(c,[[x-.75,y-1.84],[x-.1,y-2.39],[x+.73,y-1.91],[x+.2,y-1.76]],roof,ink,.075);line(c,x-.64,y-1.88,x-.1,y-2.27,'#fff2af',.055);
 c.beginPath();c.moveTo(x+.29,y-1.29);c.bezierCurveTo(x+.62,y-1.15,x+.83,y+.28,x+1.47,y+.34);c.lineTo(x+1.78,y+.34);c.lineTo(x+1.78,y+.12);c.bezierCurveTo(x+.95,y+.14,x+.95,y-1.15,x+.66,y-1.39);c.closePath();c.fillStyle=color;c.fill();c.strokeStyle=ink;c.lineWidth=.065;c.stroke();
 c.beginPath();c.moveTo(x+.4,y-1.28);c.bezierCurveTo(x+.76,y-.88,x+.9,y+.22,x+1.67,y+.25);c.strokeStyle='#ffe9ae';c.lineWidth=.075;c.stroke();
 for(const side of [-1,1])line(c,x-.72+side*.17,y+.3,x-.72+side*.17,y-1.3,ink,.075);for(let yy=-1.12;yy<=.1;yy+=.29)line(c,x-.91,y+yy,x-.53,y+yy,'#f2d28f',.08);
}
function climbingNet(c,x,y){
 for(const side of [-1,1])line(c,x+side*.75,y+.4,x+side*.35,y-1.6,'#7e7761',.11);line(c,x-.35,y-1.6,x+.35,y-1.6,'#b3c8be',.1);
 for(let yy=-1.3;yy<.4;yy+=.3){const w=.35+(yy+1.6)*.2;line(c,x-w,y+yy,x+w,y+yy,'#d9bc78',.055);}for(const xx of [-.3,0,.3])line(c,x+xx,y-1.57,x+xx*2,y+.35,'#d5a46b',.045);
}
export function panorama(c){
 shadow(c,.3,.45,3.4,1.05);lawn(c,3,1);volume(c,-2.35,.2,4.7,1.0,{face:'#e6dfc8',side:'#8aa7ad',roof:'#f3ecdb',depth:.35});
 // One blue-glass shaft with deep balcony bands and a wide chamfered crown.
 shape(c,[[-1.45,-.8],[-1.45,-8.62],[-1.12,-9.14],[1.12,-9.14],[1.45,-8.62],[1.45,-.8]],gradient(c,-1.5,-5,1.5,-5,['#3e718b','#80b8c5','#5d91a9']),ink,.095);
 shape(c,[[1.1,-9.05],[1.45,-8.62],[1.45,-.8],[1.1,-.8]],'#355d78',null);shape(c,[[-1.45,-8.62],[-1.12,-9.14],[-1.12,-.8],[-1.45,-.8]],'#5284a1',null);rounded(c,-.66,-8.82,1.32,8.02,.04,'#aeb9b8');
 for(let y=-8.65;y<-.87;y+=.29){line(c,-1.34,y+.08,1.34,y+.08,'#335a7360',.105);line(c,-1.39,y,1.39,y,'#e8e6d5',.085);line(c,-.65,y+.105,.65,y+.105,'#6e888f',.065);}
 for(const x of [-1.05,-.73,.73,1.05])line(c,x,-8.8,x,-.83,'#d2e8e5',.045);
 shape(c,[[-1.68,-8.96],[-1.26,-9.46],[1.26,-9.46],[1.68,-8.96],[1.46,-8.7],[-1.46,-8.7]],'#d6d8ca',ink,.095);shape(c,[[-1.35,-8.99],[-1.06,-9.23],[1.06,-9.23],[1.35,-8.99]],'#45667c',ink,.055);line(c,-1.48,-8.87,1.48,-8.87,'#fff5df',.08);
 for(let x=-1.9;x<1.9;x+=.64)windowPane(c,x,-.56,.49,.69);rounded(c,-.35,-.5,.7,.7,.025,'#294e62',ink,.06);line(c,0,-.4,0,.18,'#d3ebe0',.04);
 planter(c,-2.8,.4,.7);planter(c,2.8,.4,.7);path(c,-1.4,1.05,1.4,1.05,.35);
 if(c.showLabels===false)text(c,'⌂',0,1.8,.7);text(c,'PANORAMA TOWER',0,-10.05,.48);text(c,'Trash Can Building',0,2,.43);text(c,'⌂ SAFE HOME',0,2.7,.36);
}
function mall(c,l,seen){
 shadow(c,0,.3,3.4,.8);volume(c,-3,.15,2.5,2.1,{face:'#e4dfc8',side:'#94b4b7',roof:'#f7eecf'});volume(c,.5,.15,2.6,2.7,{face:'#c2d9d6',side:'#7b9fa7',roof:'#eff1de'});
 for(const [x,w] of [[-2.8,2.1],[.7,2.15]])for(let y=-1.6;y<.1;y+=.6){windowPane(c,x,y,w,.35);line(c,x-.03,y+.39,x+w+.03,y+.39,'#f8efd8',.075);}
 // Broad folded panels keep the Climate Ribbon legible at the play camera's scale.
 for(let x=-2.7;x<2.7;x+=.23){const y=-2.47+Math.sin(x*1.13)*.34;shape(c,[[x,y],[x+.24,y-.08],[x+.22,y+.29],[x-.01,y+.34]],'#f7edd2','#7899a1',.025);line(c,x,y+.35,x,y+.67,'#486f7a',.035);}
 line(c,-2.8,-2.14,2.72,-2.05,'#c3ddd6',.055);path(c,-2.8,.6,2.8,.6,.55);rounded(c,-.8,.1,1.6,.8,.12,'#edc17c',ink,.08);rounded(c,-.69,.19,1.38,.1,.025,'#ffebbc');text(c,seen?'✓':'ϟ',0,.72,.6);
 planter(c,-2.65,.9,.85);planter(c,2.65,.9,.85);text(c,l.name,0,-3.35,.44);text(c,seen?'Trail tires found':'Trail tires inside',0,1.65,.36);
}
function play(c,l){
 const pirate=l.kind==='pirate-playground',hammock=l.id==='hammock',splash=l.kind==='splash-park',crandon=l.id==='crandon-play',peacock=l.id==='peacock',riverside=l.id==='riverside-play',brickell=l.id==='1814-park';
 lawn(c,3.15,1.7);oval(c,0,.35,2.75,1.18,splash?'#599fa5':brickell?'#b8a57b':'#c1ac7d');oval(c,-.07,.24,2.62,1.08,splash?'#9bd9d0':riverside?'#b6cd95':crandon?'#c6dadd':'#e1d1a1');
 if(pirate){
  shadow(c,-.7,.15,1.8,.35);shape(c,[[-2.4,-.9],[.7,-.9],[.36,.13],[-1.81,.13]],'#a9734b',ink,.09);for(const y of [-.65,-.35])line(c,-2.12,y,.52,y,'#d9a76b',.055);for(const x of [-1.6,-.8,-.03])oval(c,x,-.38,.19,.19,'#315b73','#e8c28c',.045);
  line(c,-1,-.7,-1,-3,'#6b6d5a',.12);shape(c,[[-.91,-2.86],[-.91,-1.43],[.42,-1.43]],'#f2edcc',ink,.065);line(c,-.91,-2.85,.25,-1.53,'#c9d4c6',.035);for(const x of [-2,-1.4,-.8,-.2,.35])line(c,x,-.9,x,-1.19,'#e9c18b',.06);line(c,-2,-1.2,.35,-1.2,'#f0d4a1',.07);slide(c,.85,.15,'#59b9d4','#edcd73');
 }else if(peacock){
  slide(c,-1.4,.15,'#e8a25c','#77bdb8');climbingNet(c,1.25,-.15);line(c,-.5,-1.18,.5,-1.18,'#ce9b62',.18);for(const x of [-.4,-.05,.3])line(c,x,-1.1,x,-.67,'#f0cb90',.045);
 }else if(riverside){
  climbingNet(c,-1.45,-.1);slide(c,.3,.18,'#66b39d','#d9c581');bush(c,-2.5,.62,.45);
 }else if(crandon){
  slide(c,-1.05,.1,'#5aaecb','#8db9d0');swing(c,1.2,-.05);for(const x of [-2.7,2.6])line(c,x,.4,x,-2.45,'#7b9194',.08);shape(c,[[-2.9,-2.4],[-.2,-2.95],[2.8,-2.4],[.2,-2.18]],'#e9ece0',ink,.065);
 }else{
  slide(c,-1.15,.05,splash?'#4db6d1':hammock?'#ec9051':'#dd8062',hammock?'#f2cf73':brickell?'#87b5c8':'#e2d18d');swing(c,1.22,-.03);
 }
 if(brickell){for(let x=-2.9;x<3;x+=.35)line(c,x,1.21,x,1.65,'#688d81',.055);line(c,-2.9,1.25,2.9,1.25,'#b5cdb6',.07);}
 if(hammock){for(const x of [-3,3]){shape(c,[[x-.13,.35],[x+.16,.35],[x+.12,-3],[x-.12,-3]],'#bcc5bc',ink,.055);line(c,x-.06,-2.9,x-.06,.19,'#eff0d9',.055);}shape(c,[[-4.15,-3.2],[3.95,-3.2],[4.2,-3.03],[-3.9,-3.03]],'#afc8c6',ink,.055);rounded(c,-4.05,-3.03,8.12,.28,.06,'#5c7b87',ink,.065);line(c,-4,-3.18,4,-3.18,'#f0e9cf',.055);text(c,'THE UNDERLINE',0,-3.65,.32);}
 if(splash){oval(c,-1.55,.75,1.1,.5,'#6dc6ce',ink,.04);for(const x of [-2.25,-1.73,-1.2]){c.beginPath();c.moveTo(x,1);c.quadraticCurveTo(x-.05,-.85,x+.58,.8);c.strokeStyle='#469eaf';c.lineWidth=.13;c.stroke();c.strokeStyle='#e3ffef';c.lineWidth=.065;c.stroke();oval(c,x+.58,.8,.1,.06,'#f0ffff');}}
 bench(c,-2.65,.85,.55);bush(c,2.63,.75,.38);text(c,l.mapName||l.name,0,hammock?2.25:1.95,.4);
}
function groveTowers(c){
 shadow(c,0,.35,2.85,.6);for(const [x,h] of [[-1.65,3.65],[0,4.55],[1.65,4.1]]){rounded(c,x-.67,-h,1.34,h,.48,gradient(c,x-.67,0,x+.67,0,['#829fa7','#d5ded5','#9dbab9']),ink,.075);for(let y=-h+.35;y<-.15;y+=.3){oval(c,x,y,.63,.11,'#d9dfcf');line(c,x-.53,y+.12,x+.5,y+.12,'#52838f',.08);line(c,x-.49,y+.16,x-.15,y+.16,'#a4d4d5',.04);}line(c,x+.42,-h+.45,x+.42,-.12,'#456f7a55',.07);oval(c,x,-h+.22,.48,.14,'#e9e6d3');}for(const x of [-2.1,1.8])planter(c,x,.32,.8);text(c,'Park Grove towers',0,1,.4);
}
function boat(c,x,y,{s=1}={}){
 c.save();c.translate(x,y);c.scale(s,s);
 oval(c,.08,.2,.47,.78,'#287b9150');
 // Long pointed hull, inset deck and blue cabin distinguish a yacht from a pickup icon.
 shape(c,[[-.4,-.66],[.4,-.66],[.43,.28],[.26,.68],[0,.97],[-.26,.68],[-.43,.28]],'#fcf3d9',ink,.065);
 shape(c,[[-.28,-.5],[.28,-.5],[.29,.31],[0,.71],[-.29,.31]],'#c6c9ae',null);
 rounded(c,-.24,-.38,.48,.76,.08,'#f6f3df',ink,.05);rounded(c,-.2,-.3,.4,.3,.045,'#286c86',ink,.04);
 line(c,-.29,-.55,.29,-.55,'#fffdf0',.065);line(c,-.29,.17,.29,.17,'#a1bbbf',.05);line(c,0,.39,0,.72,'#f6f5df',.07);
 c.restore();
}
function sideBoat(c,x,y,{s=1,sail=false}={}){
 c.save();c.translate(x,y);c.scale(s,s);
 oval(c,.1,.35,1.85,.3,'#297f9255');line(c,-1.8,.49,1.73,.49,'#c9f3ec',.075);
 if(sail){
  line(c,-.02,.02,-.02,-2.73,ink,.085);
  shape(c,[[.08,-2.58],[.08,-.27],[1.38,-.27]],'#fff1c9',ink,.075);
  line(c,.17,-2.25,1.2,-.36,'#d9c99d',.04);
  shape(c,[[-.15,-2.24],[-1.14,-.27],[-.15,-.27]],'#91d7df',ink,.065);
  line(c,.02,-.22,1.45,-.22,'#577c80',.065);
 }else{
  shape(c,[[-1.15,-.06],[-.85,-.73],[.47,-.73],[.93,-.06]],'#edf1dd',ink,.07);
  shape(c,[[-.76,-.61],[-.23,-.61],[-.23,-.18],[-.97,-.18]],'#347f97',ink,.04);
  shape(c,[[-.1,-.61],[.37,-.61],[.71,-.18],[-.1,-.18]],'#347f97',ink,.04);
  line(c,-.94,-.79,.6,-.79,'#fff4d5',.12);
 }
 shape(c,[[-1.7,-.05],[1.78,-.05],[1.3,.47],[-1.25,.47],[-1.55,.28]],'#f8f0d7',ink,.085);
 shape(c,[[-1.52,.21],[1.54,.21],[1.3,.47],[-1.25,.47]],'#3f7d95',null);
 line(c,-1.53,.03,1.54,.03,'#fffdf0',.065);
 for(const xx of [-.8,-.27,.26])oval(c,xx,.1,.08,.065,'#3c7c92');
 if(sail){rounded(c,-1.15,-.24,.78,.2,.045,'#baa373',ink,.04);line(c,-1.54,-.05,-1.54,-.4,'#668890',.045);}
 c.restore();
}
function docks(c){
 // This cyan basin is an illustration panel, not a change to the playable shoreline.
 shadow(c,2.1,.4,2.85,2.05);rounded(c,-.25,-2.25,5.05,4.8,.65,'#347f96',ink,.085);rounded(c,-.2,-2.27,4.94,4.63,.6,'#78cbd5',ink,.055);
 rounded(c,.05,-2.06,4.45,4.08,.46,'#97e1df');
 for(const [x,y,w] of [[.35,-1.92,.65],[3.3,-1.81,.8],[.45,.83,.7],[3.5,.87,.6],[1.15,2.08,.7]])line(c,x,y,x+w,y,'#d4f4e6',.07);
 // Two clearly separated finger piers and four prominent boats replace the old grid.
 for(const y of [-.55,1.24]){
  line(c,-.35,y+.1,4.35,y+.1,'#2a637749',.28);line(c,-.4,y,4.25,y,'#8f7350',.27);line(c,-.37,y-.055,4.22,y-.055,'#efd39a',.15);
  for(const x of [.6,2.1,3.65]){line(c,x,y-.13,x,y+.13,'#ad8b5a',.035);oval(c,x,y-.15,.07,.06,'#6a735f');}
 }
 boat(c,1.05,-1.65,{s:.83});boat(c,3.3,-1.65,{s:.83});
 sideBoat(c,1.1,.28,{s:.58});sideBoat(c,2.65,1.65,{s:.92,sail:true});
}
function marina(c,l){
 docks(c);
 rounded(c,-3,-.3,3.65,.7,.08,'#b59a6b',ink,.075);rounded(c,-2.95,-.33,3.55,.42,.06,'#e5d2a4');for(let x=-2.85;x<.6;x+=.24)line(c,x,-.32,x,.12,'#a28f6b',.025);
 volume(c,-2.7,-.45,2.72,1.2,{face:'#e4d8b7',side:'#91b1b3',roof:'#f0e6c9',depth:.23});rounded(c,-1.43,-2.14,.4,.53,.065,'#e6dfc8',ink,.055);oval(c,-1.23,-2.08,.09,.09,'#6b8e95');for(let x=-2.44;x<-.1;x+=.43)windowPane(c,x,-1.45,.27,.58);
 line(c,-2.75,-.4,.16,-.4,'#fff0cf',.08);text(c,'Dinner Key Marina',.3,3,.43);text(c,'Historic waterfront',-1.2,-2.5,.28);
}
function cocowalk(c){
 lawn(c,2.9,1.25);path(c,-2.5,.65,2.5,.65,.35);volume(c,-2.75,.1,1.65,2.0,{face:'#e9e4d3',side:'#a7bfb9',roof:'#f7efd9',depth:.23});volume(c,1.1,.1,1.65,2.0,{face:'#e9e4d3',side:'#9cb8b5',roof:'#f7efd9',depth:.23});volume(c,-.93,-.75,1.85,1.5,{face:'#dfe4d8',side:'#92b0ab',roof:'#e8cf9a',depth:.2});for(const x of [-2.55,-1.92,1.3,1.93])windowPane(c,x,-1.3,.48,1.18);for(let x=-2.75;x<2.8;x+=.3){if(x>-.95&&x<1)continue;line(c,x,-2.07,x+.14,-1.76,'#b79765',.075);}for(const y of [-1.72,-.92])line(c,-.82,y,.81,y,'#7a9f9c',.09);rounded(c,-1.1,.65,2.2,.22,.035,'#b6a27d',ink,.04);rounded(c,-1.2,.83,2.4,.18,.035,'#deceaa',ink,.035);parkTree(c,0,.22,.7);text(c,'CocoWalk',0,-2.85,.48);
}
function fountain(c,l){
 shadow(c,0,.42,2.7,.95);oval(c,0,.15,2.55,1.5,'#8faaa6',ink,.065);oval(c,0,-.03,2.55,1.5,'#e3ddc5',ink,.07);oval(c,0,-.08,2.24,1.23,'#4d9bb2',ink,.045);oval(c,-.12,-.1,1.94,1.02,'#80cbd3');for(let i=0;i<10;i++){const a=i*Math.PI/5,x=Math.cos(a)*1.7,y=Math.sin(a)*.7;c.beginPath();c.moveTo(x,y);c.quadraticCurveTo(x*.63,-2.15,x*.23,y*.22);c.strokeStyle='#3b8fa9';c.lineWidth=.135;c.stroke();c.strokeStyle=i%2?'#ddfff0':'#c7eff4';c.lineWidth=.075;c.stroke();oval(c,x,y,.14,.055,'#d8ffed');}line(c,0,-.2,0,-2.9,'#60b7c9',.22);line(c,-.025,-.2,-.025,-2.9,'#e5fff0',.09);oval(c,0,-2.8,.22,.14,'#eafff0');text(c,l.name,0,2.3,.4);
}
function cityHall(c,l){
 shadow(c,0,.3,3,.55);volume(c,-2.7,.1,5.4,1.5,{face:'#e7dec8',side:'#9db5b1',roof:'#f6e9ca',depth:.3});for(let x=-2.35;x<2.4;x+=.67)windowPane(c,x,-1.13,.39,.77);volume(c,-.48,-1.3,.96,1.4,{face:'#e7ddc7',side:'#b3beb1',roof:'#eff0da',depth:.13});shape(c,[[-.65,-2.71],[-.02,-3.2],[.66,-2.71]],'#90b0b4',ink,.065);oval(c,0,-2.27,.16,.18,'#f5e9cd',ink,.035);line(c,0,-2.27,0,-2.37,ink,.03);line(c,0,-2.27,.08,-2.22,ink,.03);rounded(c,-.36,-.9,.72,1,.025,'#4c798b',ink,.04);line(c,-2.72,-.02,2.72,-.02,'#f8e9cc',.12);text(c,l.name,0,1.4,.4);
}
function guardedBeach(c,l){
 shadow(c,.2,.7,2.1,.5);oval(c,0,.7,2.7,1,'#ead39f');for(const x of [-1.18,1.18]){line(c,x,.8,x,-1.65,'#786d52',.17);line(c,x+.05,.67,x+.05,-1.55,'#c7ad77',.055);}volume(c,-1.5,-.65,3,1.3,{face:'#f1c480',side:'#d69c68',roof:'#fff0c8',depth:.18});windowPane(c,-1.15,-1.69,2.3,.6);shape(c,[[-1.9,-2.05],[-.05,-2.88],[1.88,-2.05]],'#d97f63',ink,.075);line(c,-1.55,-2.09,-.05,-2.75,'#f2b383',.06);line(c,-1.67,-.64,1.7,-.64,'#e4c387',.18);for(const x of [-1.5,-.9,.9,1.5])line(c,x,-.61,x,-1.1,ink,.055);line(c,-1.55,-1.1,1.55,-1.1,'#f5e7c7',.07);shape(c,[[-.58,-.57],[.58,-.57],[.83,.85],[-.83,.85]],'#aa8a5c',ink,.05);for(let y=-.45;y<=.7;y+=.26)line(c,-.62,y,.62,y,'#e8d0a1',.105);line(c,1.6,-2,1.6,-3.4,ink,.065);shape(c,[[1.6,-3.4],[2.5,-3.1],[1.6,-2.9]],'#e67f78');text(c,l.name,0,2,.4);
}
export function drawLandmark(c,l,{seen=false}={}){
 c.save();c.translate(l.x,l.y);
 switch(l.kind){
  case 'home':panorama(c);break;
  case 'mall':mall(c,l,seen);break;
  case 'playground':case 'pirate-playground':case 'splash-park':play(c,l);break;
  case 'grove-towers':groveTowers(c);break;
  case 'marina':marina(c,l);break;
  case 'cocowalk':cocowalk(c);break;
  case 'bayfront':lawn(c,4,2.7);path(c,-3,1.3,3,1.3,.45);path(c,-.5,-1.4,-.5,1.5,.38);for(const x of [-2.6,2.6])bench(c,x,-.25,.8);for(const x of [-2,2.1])bush(c,x,1.6,.55);text(c,'Bayfront Park',0,3.4,.47);break;
  case 'fountain':fountain(c,l);break;
  case 'bayside':shadow(c,0,.3,3.4,.65);for(const x of [-2.4,-.8,.8,2.4]){volume(c,x-.7,.1,1.4,1.85,{face:'#efcda3',side:'#b68f77',roof:'#ebad89',depth:.16});shape(c,[[x-.93,-1.75],[x,-2.5],[x+.94,-1.75]],'#cc776d',ink,.07);line(c,x-.65,-1.81,x,-2.37,'#f3b7a0',.06);windowPane(c,x-.47,-1.15,.94,1.18);rounded(c,x-.66,-1.37,1.32,.22,.035,'#f5e2b7',ink,.04);}path(c,-3.2,.55,3.2,.55,.5);text(c,l.name,0,-3,.43);break;
  case 'bayside-marina':
   docks(c);for(const x of [-2.1,-.9]){volume(c,x-.6,-.55,1.2,.8,{face:'#efce9f',side:'#bd9a7a',roof:'#eeb995',depth:.12});shape(c,[[x-.85,-1.38],[x,-2.08],[x+.86,-1.38]],'#d97f6c',ink,.065);}text(c,l.name,0,3,.4);break;
  case 'wheel':shadow(c,0,1,1.65,.35);rounded(c,-1.35,.83,2.7,.3,.05,'#a8b5a9',ink,.065);for(const side of [-1,1]){line(c,side*1.13,.83,0,-1.5,ink,.24);line(c,side*1.1,.81,0,-1.5,'#e6e9d9',.13);}c.beginPath();c.arc(0,-1.5,2,0,Math.PI*2);c.strokeStyle=ink;c.lineWidth=.25;c.stroke();c.strokeStyle='#eef1dc';c.lineWidth=.12;c.stroke();for(let i=0;i<12;i++){const a=i*Math.PI/6,x=Math.cos(a)*2,y=-1.5+Math.sin(a)*2;line(c,0,-1.5,x,y,'#96bdc1',.065);rounded(c,x-.3,y-.06,.6,.56,.11,['#e7bb83','#8acbd8','#e6a1ad'][i%3],ink,.065);rounded(c,x-.21,y+.05,.42,.23,.045,'#356e82');line(c,x-.2,y+.39,x+.2,y+.39,'#fbebcd',.035);}oval(c,0,-1.5,.16,.16,'#e8d9a2',ink,.055);text(c,l.name,0,2,.4);break;
  case 'arena':shadow(c,0,.45,3.1,.65);rounded(c,-3,-1.4,6,2.05,.64,gradient(c,-3,0,3,0,['#a9c1bf','#f1ebd7','#b5c7c1']),ink,.075);for(let x=-2.5;x<=2.5;x+=.48)windowPane(c,x,-.82,.26,1.02);oval(c,0,-1.37,3,.92,'#d4ddd2',ink,.07);oval(c,0,-1.43,2.32,.62,'#76949c',ink,.045);oval(c,0,-1.43,1.85,.4,'#3f6576');line(c,-2.4,.51,2.4,.51,'#f4ead2',.08);text(c,l.name,0,1.7,.4);break;
  case 'sculpture-park':
   lawn(c);for(const [x,col] of [[-1.7,'#e7ae8c'],[0,'#d9d786'],[1.7,'#8bcad4']]){rounded(c,x-.5,-.6,1,.7,.15,col,ink,.03);oval(c,x+.5,-.8,.3,.35,col);line(c,x-.3,.1,x-.3,.4,ink,.06);line(c,x+.25,.1,x+.25,.4,ink,.06);}text(c,l.name,0,2.5,.4);break;
  case 'art-museum':shadow(c,0,.3,3.1,.6);volume(c,-2.7,.13,5.4,1.5,{face:'#a8bfba',side:'#6d969b',roof:'#d0d4bd',depth:.16});for(let x=-2.4;x<2.4;x+=.65)windowPane(c,x,-1.05,.49,1.12);shape(c,[[-3.2,-1.63],[-2.65,-2.07],[3.55,-2.07],[3.2,-1.63]],'#c7b58a',ink,.075);rounded(c,-3.2,-1.64,6.4,.23,.035,'#8c805f',ink,.06);for(let x=-2.7;x<=2.8;x+=.62){line(c,x,-1.55,x,.1,'#486e70',.06);for(const yy of [-1.15,-.78,-.42])oval(c,x+.1,yy,.17,.27,'#659b69');}text(c,l.name,0,1,.35);break;
  case 'guarded-beach':guardedBeach(c,l);break;
  case 'lighthouse':shadow(c,.2,.3,1.5,.5);oval(c,0,.25,2.5,.9,'#dcc897');shape(c,[[-1,0],[-.65,-6],[.65,-6],[1,0]],gradient(c,-1,0,1,0,['#bcc7b8','#fcf1d6','#d0d5c3']),ink,.09);rounded(c,-.87,-6.65,1.74,.88,.06,'#36515d',ink,.07);for(const x of [-.52,0,.52])windowPane(c,x-.15,-6.5,.3,.56);shape(c,[[-1.05,-6.74],[0,-7.47],[1.05,-6.74]],'#35505a',ink,.08);line(c,-.77,-6.75,0,-7.32,'#718a8a',.055);for(const y of [-1.7,-3.6,-5.2])rounded(c,-.14,y,.28,.46,.07,'#3f6471',ink,.035);rounded(c,-.33,-.78,.66,.82,.06,'#637f81',ink,.04);line(c,-1,-5.84,1,-5.84,'#304b55',.12);for(const x of [-.91,-.47,0,.47,.91])line(c,x,-5.82,x,-6.1,ink,.045);line(c,-1.03,-6.1,1.03,-6.1,'#6b8587',.07);text(c,l.name,0,1.6,.4);break;
  case 'twisting-towers':shadow(c,0,.3,3,.5);for(const side of [-1,1]){for(let i=0;i<16;i++){const shift=Math.sin(i/15*Math.PI*.85)*side*.55,x=side*1.3+shift,y=-.25-i*.24;rounded(c,x-.78,y,1.56,.3,.065,'#487d91',ink,.035);shape(c,[[x-.88,y],[x-.67,y-.1],[x+.88,y-.1],[x+.76,y+.045],[x-.88,y+.045]],'#dce9db',ink,.035);line(c,x-.59,y+.13,x+.61,y+.13,'#93c2cd',.04);}planter(c,side*1.4,.25,.85);}text(c,l.name,0,1,.4);break;
  case 'curved-towers':
   for(const [x,h] of [[-1,4.2],[1,4.7]]){rounded(c,x-.8,-h,1.6,h,.3,gradient(c,x-.8,0,x+.8,0,['#537e91','#a5c6cd','#476f85']),ink,.07);for(let y=-h+.3;y<0;y+=.35)rounded(c,x-.95,y,1.9,.16,.08,'#e8e0c8',ink,.02);}text(c,l.name,0,1,.4);break;
  case 'city-hall':cityHall(c,l);break;
  case 'domino':lawn(c);path(c,-2.5,1.1,2.5,1.1,.3);for(const [x,y] of [[-1.2,-.4],[1.2,-.4],[0,.8]]){shadow(c,x,y+.2,.88,.3);line(c,x,y,x,y+.5,'#677a70',.16);rounded(c,x-.75,y-.48,1.5,.96,.1,'#c3ad7e',ink,.065);rounded(c,x-.67,y-.43,1.34,.8,.055,'#eee2b9');for(const side of [-1,1]){rounded(c,x+side*.3-.16,y-.23,.32,.54,.04,'#fcf3d8',ink,.045);line(c,x+side*.3-.1,y+.04,x+side*.3+.1,y+.04,ink,.025);for(const yy of [-.11,.16])oval(c,x+side*.3,y+yy,.045,.045,ink);}for(const side of [-1,1])rounded(c,x+side*.91-.12,y-.14,.24,.4,.05,'#8a9e91',ink,.045);}text(c,l.name,0,2.4,.4);break;
  case 'theater':shadow(c,0,.35,2.55,.5);volume(c,-2,.05,4,2.55,{face:'#e6c38d',side:'#ba9673',roof:'#f3d49c',depth:.24});volume(c,-.62,-1,1.24,3.2,{face:'#8cacae',side:'#587e89',roof:'#c6d7cf',depth:.13});for(let y=-3.78;y<-1.55;y+=.45)rounded(c,-.38,y,.76,.17,.04,'#f6d985',ink,.035);shape(c,[[-2.6,-1.18],[0,-1.6],[2.6,-1.18],[2.28,-.42],[-2.28,-.42]],'#b76962',ink,.08);line(c,-2.17,-.57,2.17,-.57,'#edbd87',.09);for(let x=-1.95;x<2;x+=.32)oval(c,x,-.67,.05,.05,'#fff0af');for(const x of [-1.42,.82])windowPane(c,x,-.29,.6,.35);text(c,l.name,0,1.2,.4);break;
  case 'art-deco':shadow(c,0,.35,2.8,.55);for(const [x,h,col] of [[-1.5,2.3,'#e99da7'],[.1,3,'#ecdfbd'],[1.6,2.5,'#a1d1c4']]){volume(c,x-.61,0,1.22,h,{face:col,side:'#6e9da5',roof:'#f5e8c8',depth:.17});for(let y=-h+.38;y<-.2;y+=.4)windowPane(c,x-.43,y,.86,.19);rounded(c,x-.13,-h-.23,.26,.8,.03,'#f9eac8',ink,.035);line(c,x-.54,-.13,x+.53,-.13,'#f8e9cb',.1);}path(c,-2.4,.4,2.5,.4,.3);text(c,'SOUTH OF FIFTH',0,1,.45);break;
  case 'pier':
   line(c,-.7,.13,3.2,.13,'#416c7333',.7);shape(c,[[-.75,-.28],[3.16,-.28],[3.3,.05],[-.61,.05]],'#e5cd99',ink,.06);rounded(c,-.61,.05,3.91,.23,.035,'#a28b60',ink,.05);shape(c,[[2.88,-.85],[3.55,-.85],[3.69,.71],[3.02,.71]],'#e6cea1',ink,.065);for(let x=-.6;x<3.3;x+=.32)line(c,x,-.25,x+.11,.04,'#af9569',.035);for(let x=-.65;x<3.1;x+=.6){line(c,x,-.28,x,-.65,'#67817f',.055);line(c,x,.05,x,.44,'#67817f',.055);}line(c,-.65,-.64,3,-.64,'#dce8d3',.07);line(c,-.65,.44,3,.44,'#dce8d3',.07);text(c,'South Pointe Pier',0,1.5,.37);break;
  default:c.restore();return false;
 }
 c.restore();return true;
}
