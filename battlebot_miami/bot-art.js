// Shared Adventure robot and equipment artwork.
import {miamiWeapon} from './miami-weapon-art.js?v=world26';
import {armorArt,wheelArt,gadgetArt,mobilityIcon} from './equipment-art.js?v=world26';
import {robotCostume} from './costumes.js?v=world26';
export function rounded(c,x,y,w,h,r,fill,stroke,line=2) {
  if(typeof fill==='string'&&/^#[0-9a-f]{6}$/i.test(fill)&&fill!=='#21383d'&&w>=9&&h>=9){const g=c.createLinearGradient(x,y,x+w*.4,y+h);g.addColorStop(0,shade(fill,27));g.addColorStop(.45,fill);g.addColorStop(1,shade(fill,-20));fill=g;}
  c.beginPath();c.roundRect(x,y,w,h,r);if(fill){c.fillStyle=fill;c.fill();}if(stroke){c.strokeStyle=stroke;c.lineWidth=line;c.stroke();}
}
function ellipse(c,x,y,rx,ry,fill){c.beginPath();c.ellipse(x,y,rx,ry,0,0,Math.PI*2);c.fillStyle=fill;c.fill();}
function line(c,x,y,x2,y2,color,width=2){c.beginPath();c.moveTo(x,y);c.lineTo(x2,y2);c.strokeStyle=color;c.lineWidth=width;c.stroke();}
function text(c,s,x,y,size=12,color='#fff',align='center'){c.font=`800 ${size}px system-ui`;c.textAlign=align;c.fillStyle=color;c.fillText(s,x,y);}
function bolt(c,x,y,s,color){c.beginPath();c.moveTo(x+s*.15,y-s*.55);c.lineTo(x-s*.3,y+s*.08);c.lineTo(x,y+s*.02);c.lineTo(x-s*.1,y+s*.55);c.lineTo(x+s*.35,y-s*.1);c.lineTo(x+s*.05,y-s*.05);c.closePath();c.fillStyle=color;c.fill();}
function shade(hex,amount){const n=parseInt(hex.slice(1),16);return `rgb(${[(n>>16)&255,(n>>8)&255,n&255].map(v=>Math.max(0,Math.min(255,Math.round(v+amount)))).join(',')})`;}
function polygon(c,points,fill,stroke='#20363a',width=2){c.beginPath();points.forEach(([x,y],i)=>i?c.lineTo(x,y):c.moveTo(x,y));c.closePath();if(fill){c.fillStyle=fill;c.fill();}if(stroke){c.strokeStyle=stroke;c.lineWidth=width;c.stroke();}}
function ring(c,x,y,r,color,width=2){c.beginPath();c.arc(x,y,r,0,Math.PI*2);c.strokeStyle=color;c.lineWidth=width;c.stroke();}
function novaStar(c,x,y,r,fill,stroke='#20363a',width=2){const points=[];for(let i=0;i<10;i++){const a=i*Math.PI/5-Math.PI/2,d=i%2?r*.44:r;points.push([x+Math.cos(a)*d,y+Math.sin(a)*d]);}polygon(c,points,fill,stroke,width);}
function blade(c,t=0,enemy=false){c.save();c.rotate(t);polygon(c,[[-17,-12],[2,-5],[18,-14],[10,1],[17,12],[-2,6],[-18,14],[-10,-1]],enemy?'#ffd8c9':'#e6f6ef');line(c,-12,-8,12,8,enemy?'#c25c76':'#63b9ad',3);ellipse(c,0,0,4,4,'#ffc85c');c.restore();}
function drone(c,t=0,enemy=false){rounded(c,-12,-7,24,16,4,enemy?'#ed9b85':'#f5cd68','#20363a',2);rounded(c,-8,-4,16,7,2,'#294c60');ellipse(c,-4,-1,2,2,enemy?'#ffe0b8':'#caffed');ellipse(c,4,-1,2,2,enemy?'#ffe0b8':'#caffed');for(const side of [-1,1]){line(c,side*10,-5,side*19,-10,'#385666',3);ellipse(c,side*19,-11,9,2,enemy?'#f2abc2':'#b8e9e8');line(c,side*19-7,-11,side*19+7,-11,'#fff8cc',1.5);}line(c,-5,11,5,11,'#f4fff9',2);}
export function categoryIcon(c,type,t=0){c.save();c.translate(22,18);const scale=type==='armor'?.58:.6;c.scale(scale,scale);if(type==='weapon'){c.translate(-31,-4);weapon(c,'blaster',t);}else if(type==='armor')armorArt(c,'steel');else if(type==='wheels')mobilityIcon(c,'grip');else{for(const [x,y,r] of [[-12,4,18],[16,-10,13]]){c.save();c.translate(x,y);polygon(c,Array.from({length:32},(_,i)=>{const a=i*Math.PI/16,s=i%4<2?r:r*.76;return [Math.cos(a)*s,Math.sin(a)*s];}),'#efd075');ellipse(c,0,0,r*.35,r*.35,'#345465');c.restore();}}c.restore();}
export function equipmentIcon(c,type,id,t=0){c.save();c.translate(34,34);if(type==='weapon'){c.scale(.9,.9);c.translate(-34,0);weapon(c,id,t);}else{c.scale(.8,.8);if(type==='armor')armorArt(c,id);else if(type==='wheels')mobilityIcon(c,id,t);else gadgetArt(c,id,t);}c.restore();}
function encounterRole(enemy){
  return enemy.replayVariant||enemy.encounterId==='harbor-duo'||enemy.encounterId==='scrap-split'?enemy.encounterRole||'':'';
}
function encounterShell(c,role,color){
  const ink='#20363a';
  if(role==='vanguard'){
    for(const side of [-1,1]){
      polygon(c,[[side*21,-24],[side*33,-16],[side*30,7],[side*24,16],[side*21,-2]],color,ink,2.5);
      line(c,side*25,-17,side*27,5,'#ffe7a0',3);
    }
    polygon(c,[[-13,-27],[-9,-37],[0,-31],[9,-37],[13,-27]],'#f1cf6e',ink,2);
    polygon(c,[[0,15],[7,21],[0,28],[-7,21]],'#ffe7a0',ink,2);
    ellipse(c,0,21,2,3,'#287c68');
  }else if(role==='bruiser'){
    for(const side of [-1,1]){
      rounded(c,side<0?-35:23,-25,12,43,4,color,ink,3);
      for(const y of [-17,9])rounded(c,side*29-4,y,8,5,1,'#ffe2a2',ink,1.5);
    }
    rounded(c,-21,19,42,8,2,'#f3cd80',ink,2);
    for(const x of [-12,0,12])line(c,x-3,20,x+2,25,ink,3);
  }else if(role==='skirmisher'){
    for(const side of [-1,1]){
      polygon(c,[[side*22,0],[side*31,11],[side*26,23],[side*20,18]],color,ink,2);
      line(c,side*24,11,side*27,15,'#d9faff',2);
    }
    rounded(c,-18,-28,36,6,2,'#c6efff',ink,2);
    line(c,-16,22,-5,22,'#d9faff',3);line(c,5,22,16,22,'#d9faff',3);
  }else if(role==='splitter'){
    // Three interlocked shell courses leave the eye and mouth bands unobstructed.
    for(const y of [-23,0,22]){
      rounded(c,-28,y-3,56,6,2,ink);
      line(c,-24,y-1,24,y-1,'#ead6ff',2);
      for(const x of [-19,19])rounded(c,x-3,y-4,6,9,1,'#bda0de',ink,1.5);
    }
    for(const side of [-1,1])polygon(c,[[side*23,-19],[side*31,-15],[side*31,-4],[side*23,-1]],color,ink,2);
  }else if(role==='fragment'){
    for(const side of [-1,1]){
      polygon(c,[[side*20,-23],[side*29,-29],[side*32,-18],[side*25,-13]],color,ink,2);
      rounded(c,side*23-3,17,6,7,1,'#ead6ff',ink,1.5);
    }
    line(c,-17,23,17,23,'#ead6ff',3);
  }
}
function workshopMarker(c,x,y){
  c.save();c.translate(x,y);ellipse(c,0,1,15,15,'#fff7d7');polygon(c,[[-12,-3],[0,-13],[12,-3]],'#1c3e64','#fff7d7',2);rounded(c,-10,-3,20,15,2,'#1c3e64','#fff7d7',2);rounded(c,-3,3,6,9,1,'#fff7d7');for(const side of [-1,1])rounded(c,side*6-2,1,4,4,1,'#fff7d7');c.restore();
}
function bossOutline(c,theme){
  const ink='#20363a',metal='#b6cfcb';
  for(const side of [-1,1]){
    c.save();c.scale(side,1);
    if(theme==='coast'){
      rounded(c,27,-17,13,39,6,metal,ink,2);line(c,33,-9,33,13,'#477f91',3);
      polygon(c,[[20,-31],[32,-48],[40,-31]],'#e8d18c',ink,2);
    }else if(theme==='scrapyard'){
      line(c,25,-12,40,-29,ink,7);rounded(c,34,-42,15,28,2,'#9cb6af',ink,2);
      rounded(c,34,-44,5,9,1,'#e9cf83',ink,1.5);rounded(c,44,-44,5,9,1,'#e9cf83',ink,1.5);
    }else if(theme==='jungle'){
      polygon(c,[[24,-22],[37,-43],[47,-29],[35,3],[25,10]],'#82b99b',ink,2);
      line(c,32,-7,38,-30,'#d6e6ae',2);
    }else if(theme==='storm'){
      line(c,23,-20,39,-39,ink,5);for(const y of [-30,-38,-46])ellipse(c,39,y,9,3,'#b9e5e9');
      line(c,39,-49,39,-56,'#e9e9bb',3);
    }else if(theme==='fortress'){
      rounded(c,25,-33,18,57,2,'#829da7',ink,2);for(const x of [25,37])rounded(c,x,-43,6,14,1,metal,ink,2);
      line(c,31,-18,37,-18,'#e5d08a',3);
    }else if(theme==='aurora'){
      polygon(c,[[24,18],[27,-30],[35,-52],[42,-22],[39,20]],'#b4e7ed',ink,2);
      line(c,35,-41,34,10,'#f2fff8',2);
    }else if(theme==='lunar'){
      rounded(c,26,-20,19,40,9,'#dbe2d1',ink,2);ellipse(c,35,-10,6,6,'#486f86');
      line(c,35,1,35,12,'#91c3ce',3);
    }else if(theme==='garden'){
      line(c,25,-15,36,-33,ink,5);for(const [x,y] of [[30,-35],[40,-35],[35,-44]])ellipse(c,x,y,7,7,'#88bb97');
      ellipse(c,35,-36,4,4,'#f9e9ad');
    }else if(theme==='orbital'){
      line(c,25,-13,40,-20,metal,5);rounded(c,33,-43,21,39,2,'#3f6d87',ink,2);
      for(const y of [-35,-24,-13])line(c,36,y,51,y,'#9bd2d5',1.5);line(c,44,-40,44,-7,'#9bd2d5',1.5);
    }else if(theme==='ancient'){
      polygon(c,[[25,23],[26,-29],[36,-48],[47,-29],[43,23]],'#b3c9a6',ink,2);
      polygon(c,[[31,-21],[36,-30],[41,-21],[36,-12]],'#eadca0',ink,1.5);line(c,36,-6,36,13,ink,2);
    }
    c.restore();
  }
}
export function weapon(c,id,t=0,action=0) {
  if(miamiWeapon(c,id,t,action))return;
  const ink='#20363a';c.save();c.lineJoin='round';c.lineCap='round';
  if(['sunbeam','swarm','supernova'].includes(id))c.translate(-Math.sin(action*Math.PI)*2.5,0);
  if(id==='bumper') {
    rounded(c,8,-10,16,20,4,'#477f98',ink,2.5);rounded(c,11,-8,10,5,2,'#96e0f1');
    line(c,23,0,46+action*10,0,'#e0e8d2',5);
    c.beginPath();c.moveTo(23,-7);for(let i=0;i<6;i++)c.lineTo(24+i*3.5+action*i*1.5,i%2?7:-7);c.strokeStyle=ink;c.lineWidth=6;c.stroke();c.strokeStyle='#ffd06a';c.lineWidth=3;c.stroke();
    rounded(c,43+action*10,-15,13,30,5,'#ee9c72',ink,2.5);rounded(c,49+action*10,-11,7,22,3,'#fce0a6');
  } else if(id==='bubble') {
    rounded(c,9,-10,27,20,5,'#88cdd7',ink,3);rounded(c,12,-8,16,5,2,'#edffff');rounded(c,32,-8,18,16,4,'#e1eee1',ink,2);ellipse(c,50,0,7,10,'#78b5c6');ellipse(c,50,0,4,6,'#ccfaff');line(c,19,11,16,17,ink,6);
    for(const [x,y,r] of [[30,-13,4],[21,0,3],[37,10,4]])ring(c,x,y,r,'#f4ffff',1.5);
  } else if(id==='blaster'||id==='neon') {
    rounded(c,9,-10,26,19,4,id==='neon'?'#a66495':'#416f9a',ink,3);
    rounded(c,13,-9,13,5,2,id==='neon'?'#ffb9e3':'#8fd9ec');rounded(c,31,-7,19,13,3,'#485b68',ink,3);
    rounded(c,44,-8,9,15,3,'#abc3c7',ink,2);rounded(c,48,-4,5,7,1,'#baf9ff');
    line(c,20,10,16,17,ink,7);line(c,35,-6,35,6,'#99c4d2',2);
    if(action>.5){c.globalAlpha=action;bolt(c,58,0,25,'#ceffff');c.globalAlpha=1;}
  } else if(id==='saw') {
    rounded(c,10,-4,24,8,3,'#b38a57',ink,2);
    c.save();c.translate(39,0);c.rotate(t*(action?28:7));
    c.beginPath();for(let i=0;i<32;i++){let a=i*Math.PI/16,r=i%2?14:19;c.lineTo(Math.cos(a)*r,Math.sin(a)*r);}c.closePath();c.fillStyle='#d6e2dd';c.fill();c.strokeStyle=ink;c.lineWidth=2;c.stroke();
    ellipse(c,0,0,11,11,'#7e959d');for(let i=0;i<4;i++){const a=i*Math.PI/2;ellipse(c,Math.cos(a)*7,Math.sin(a)*7,2,2,'#cee9e5');}ellipse(c,0,0,4,4,'#f9ce56');c.restore();
  } else if(id==='hammer') {
    c.save();c.rotate(-.45+(action?Math.sin(action*Math.PI)*1.8:0));
    rounded(c,6,-4,35,8,3,'#a77c51',ink,2.5);for(let i=0;i<3;i++)line(c,13+i*5,-3,13+i*5,3,'#d2a775',1);
    rounded(c,33,-18,25,36,5,'#9fafb3',ink,3);rounded(c,35,-16,21,7,3,'#e0eeec');rounded(c,35,10,21,6,2,'#647c82');
    line(c,36,-6,36,8,'#f0f9f3',1);line(c,55,-6,55,8,'#66848e',1.5);
    rounded(c,41,-18,8,36,2,'#708d94');bolt(c,45,0,18,'#ffe06b');c.restore();
  } else if(id==='lightning') {
    rounded(c,9,-10,28,20,5,'#7264a5',ink,3);rounded(c,15,-6,15,12,3,'#a8e4ea');
    for(const y of [-11,11]) {line(c,33,y,49,y,'#b7ced1',6);ellipse(c,49,y,5,5,'#bdffff');}
    if(action>.1){c.beginPath();c.moveTo(49,-11);c.lineTo(55,-3);c.lineTo(47,3);c.lineTo(49,11);c.strokeStyle='#cdffff';c.lineWidth=2;c.stroke();}
  } else if(id==='flame') {
    rounded(c,8,-11,25,22,5,'#da7451',ink,3);rounded(c,12,-16,12,9,3,'#f4c66d',ink,2);
    polygon(c,[[30,-7],[49,-12],[49,12],[30,7]],'#687f86');for(const y of [-7,0,7])ellipse(c,48,y,3,2,'#ffd770');
    if(action>0)for(let i=0;i<3;i++)polygon(c,[[51,-7+i*5],[66+action*14,-12+i*8],[61+action*20,i*6-6],[51,2+i*4]],i%2?'#fff2a5':'#ffad54',null);
  } else if(id==='frost') {
    rounded(c,7,-11,29,22,5,'#9ddbe9',ink,3);rounded(c,29,-8,24,16,3,'#e8ffff',ink,2);
    for(const x of [20,29,38])polygon(c,[[x,-7],[x-4,-17],[x+5,-12],[x+5,12],[x-4,17],[x,7]],'#75c5e1',ink,1.5);
    ellipse(c,53,0,4,7,'#398eae');if(action>0){line(c,56,0,68,0,'#efffff',4);ring(c,65,0,8,'#9cecff',2);}
  } else if(id==='boomerang') {
    rounded(c,8,-6,29,12,4,'#548f88',ink,3);if(action<.03){c.save();c.translate(40,0);blade(c,Math.PI/4);c.restore();}
  } else if(id==='tractor') {
    rounded(c,7,-10,30,20,5,'#547b9c',ink,3);c.beginPath();c.arc(35,0,13,Math.PI/2,Math.PI*1.5);c.strokeStyle='#e56e63';c.lineWidth=9;c.stroke();
    for(const y of [-13,13])rounded(c,33,y-5,18,10,2,y<0?'#fff5cf':'#8ee5ed',ink,2);
    if(action>0)for(let i=0;i<2;i++){c.beginPath();c.arc(49,0,10+i*8,-.9,.9);c.strokeStyle='#91f0e4';c.lineWidth=2;c.stroke();}
  } else if(id==='drone') {
    rounded(c,6,-15,40,30,5,'#456979',ink,3);rounded(c,12,-10,27,20,3,'#243f50');for(const y of [-14,14])line(c,12,y,40,y,'#f5d478',3);
    c.save();c.translate(30,-action*16);c.scale(.72,.72);drone(c,t);c.restore();
  } else if(id==='rail') {
    rounded(c,5,-12,24,24,4,'#587c80',ink,3);for(const y of [-7,7]){rounded(c,24,y-3,36,6,2,'#d4e9dd',ink,2);line(c,29,y,55,y,'#6bf5db',2);}
    for(let i=0;i<3;i++)rounded(c,15+i*6,-9,3,18,1,'#f4d477');if(action>0)line(c,32,0,73,0,'#eaffdd',4);
  } else if(id==='meteor') {
    c.save();c.rotate(-.5-action*.25);rounded(c,5,-12,27,24,5,'#c78762',ink,3);rounded(c,26,-16,25,32,5,'#627a87',ink,3);ellipse(c,51,0,5,13,'#263f50');ellipse(c,51,0,3,8,'#ffc56a');for(const y of [-10,10])line(c,30,y,44,y,'#efdb9d',3);c.restore();
  } else if(id==='gravity') {
    c.save();c.rotate(-.3+Math.sin(action*Math.PI)*1.5);rounded(c,5,-4,34,8,3,'#90b7ad',ink,2);rounded(c,33,-23,25,46,5,'#456778',ink,3);for(const y of [-19,19])rounded(c,30,y-4,31,8,2,'#b8ead7',ink,2);ellipse(c,46,0,8,12,'#263c60');ring(c,46,0,6,'#b5f9df',2);if(action>0)ring(c,46,0,15,'#93dbc9',2);c.restore();
  } else if(id==='crystalbeam') {
    rounded(c,6,-12,28,24,4,'#9283c5',ink,3);rounded(c,10,-9,18,5,2,'#e5dcff');
    for(const y of [-8,8]){rounded(c,29,y-3,30,6,2,'#efe7bf',ink,2);line(c,32,y,56,y,'#c7a6ff',2);}
    polygon(c,[[28,0],[43,-8],[60,0],[43,8]],'#d4c1ff',ink,2);ellipse(c,60,0,3,6,'#efffff');
    polygon(c,[[12,-13],[10,-21],[18,-17],[23,-24],[27,-13]],'#f0d889',ink,1.5);
    if(action>0)line(c,60,0,70,0,'#e4d4ff',4);
  } else if(id==='twinrockets') {
    rounded(c,6,-17,28,34,4,'#b94e46',ink,3);rounded(c,10,-13,17,6,2,'#f28a64');
    for(const y of [-11,11]){
      rounded(c,28,y-7,25,14,3,'#e6bd68',ink,2);rounded(c,39,y-4,14,8,2,'#3c454f',ink,1.5);
      polygon(c,[[45,y-4],[53,y],[45,y+4]],'#ff9a63',ink,1);
      if(action>0)line(c,53,y,62,y,'#fff0b1',3);
    }
    polygon(c,[[11,-18],[9,-26],[17,-22],[22,-29],[27,-18]],'#ffe49a',ink,1.5);
  } else if(id==='sunbeam') {
    rounded(c,6,-11,28,22,4,'#e3bb55',ink,3);rounded(c,10,-8,17,5,2,'#fff2b2');
    rounded(c,28,-7,30,14,3,'#54777d',ink,2.5);
    for(const x of [31,40,49]){rounded(c,x,-11,5,22,2,'#f6d779',ink,1.5);line(c,x+2,-7,x+2,7,'#fff4bf',1.5);}
    rounded(c,55,-12,5,24,2,'#e6bd50',ink,2);ellipse(c,60,0,3,8,'#fff3ae');
    ellipse(c,19,3,6,6,'#345863');ellipse(c,19,3,3,3,'#fff8ce');
    for(const y of [-5,5])line(c,13,3+y,15,3+y,'#fff8ce',1.5);
    if(action>0){line(c,60,0,67,0,'#fff5b5',3);}
  } else if(id==='swarm') {
    rounded(c,6,-17,34,34,4,'#4a8176',ink,3);rounded(c,10,-13,18,26,2,'#bce7ca',ink,2);
    for(const y of [-11,0,11]){
      rounded(c,25,y-5,20,10,2,'#7ab7a5',ink,2);rounded(c,35,y-3,10,6,1,'#244d55');
      polygon(c,[[37,y],[40,y-2],[44,y],[40,y+2]],'#e9ffb2',null);
      ellipse(c,16,y,2,2,'#f5e28c');line(c,21,y-2,23,y-2,'#3a6b64',1.5);
    }
    line(c,8,0,3,0,'#a8d7ca',4);
    if(action>0)for(const y of [-11,0,11])line(c,45,y,50,y,'#dcffbb',2);
  } else if(id==='supernova') {
    rounded(c,6,-14,28,28,4,'#687c9e',ink,3);rounded(c,10,-11,18,6,2,'#c8d8f1');
    for(const y of [-12,0,12]){
      rounded(c,29,y-5,23,10,2,'#becbdc',ink,2);rounded(c,42,y-3,10,6,1,'#31475f');
      polygon(c,[[46,y-3],[53,y],[46,y+3]],'#ffe49a',ink,1);
      line(c,32,y-2,39,y-2,'#fff0bd',1.5);
    }
    novaStar(c,19,5,8,'#fff0a6',ink,1.5);
    if(action>0)for(const y of [-12,0,12])line(c,53,y,58,y,'#fff5d4',2);
  } else if(id==='firejet') {
    rounded(c,6,-14,42,28,5,'#31475c',ink,3);
    rounded(c,11,-18,19,7,2,'#ffd36d',ink,2);
    for(const y of [-12,12])line(c,12,y,44,y,'#ff8a5d',3);
    rounded(c,37,-10,18,20,3,'#f4ba64',ink,2);
    polygon(c,[[43,-6],[60,0],[43,6]],'#ff8056',ink,2);
    polygon(c,[[31,-6],[37,-13],[40,-5],[40,5],[37,13],[31,6]],'#78dce1',ink,2);
    ellipse(c,28,0,5,7,'#93f8ff');
    if(action>0){polygon(c,[[12,-6],[-9-action*9,0],[12,6]],'#ffb84e',null);line(c,10,0,-5,0,'#fff3aa',4);}
  } else if(id==='rocket') {
    rounded(c,7,-14,39,27,6,'#455b62',ink,3);rounded(c,10,-12,32,7,2,'#839b9d');
    rounded(c,30,-16,19,31,4,'#8d9992',ink,3);rounded(c,33,-13,13,25,3,'#263f47');
    c.beginPath();c.moveTo(38,-8);c.lineTo(52,0);c.lineTo(38,8);c.closePath();c.fillStyle='#ff805b';c.fill();
    rounded(c,13,-19,14,6,2,'#e4bb54',ink,2);line(c,18,14,15,21,ink,7);line(c,9,0,4,0,'#d7dbb9',4);
    for(let j=0;j<3;j++)rounded(c,14+j*5,-2,3,9,1,'#253d47');ellipse(c,22,-8,2,2,'#c5f4bd');
  }
  c.restore();
}

export function bot(c,x,y,size,options={},t=0) {
  const { color='#ee6954',livery,halloween,armor='light',wheels='basic',gun='bumper',gadget='none',type='',region=0,theme='',encounterRole='',angle=0,hit=0,swing=0,moving=false,boss=false,shield=false,health=1,reducedMotion=false }=options;
  if(reducedMotion){t=0;}
  const damaged=health<=.5,critical=health<=.18;
  c.save();c.translate(x,y);c.scale(size/80,size/80);
  ellipse(c,0,27,30,9,'#122e3538');
  const bob=reducedMotion?0:moving?Math.sin(t*(critical?12:18))*(critical?2.7:1.8):Math.sin(t*2.3)*.7;c.translate(critical&&!reducedMotion?Math.sin(t*31)*.7:0,bob);
  line(c,-29,19,29,19,'#a5bbc0',6);
  for(const side of [-1,1]) {
    c.save();c.translate(side*27,20);c.scale(wheels==='rover'?.74:.65,wheels==='rover'?.74:.65);wheelArt(c,wheels,moving?t:0);c.restore();
  }
  const antenna=damaged?10:0;line(c,0,-29,antenna,-40,'#243b3f',4);ellipse(c,antenna,-42,3.7,3.7,critical?'#ff9a55':'#ffe08d');ellipse(c,antenna-1,-43,1.4,1.4,'#fffbe6');
  const grad=c.createLinearGradient(-22,-26,25,29);grad.addColorStop(0,hit>0?'#fff8c7':shade(color,25));grad.addColorStop(.38,hit>0?'#fff':color);grad.addColorStop(1,hit>0?'#fff':shade(color,-18));
  rounded(c,-26,-28,52,56,11,'#21383d','#172f33',3);
  rounded(c,-22,-25,44,48,8,grad);rounded(c,-19,-22,38,7,4,'#ffffff35');rounded(c,-20,16,40,7,3,'#102d372c');
  rounded(c,-21,-19,5,31,2,'#ffffff15');rounded(c,17,-17,4,31,2,'#12343e20');
  const heavyBoss=boss&&(!encounterRole||encounterRole==='bruiser'||encounterRole==='splitter');
  if(armor==='steel'||armor==='heavy'||heavyBoss) {
    const thick=armor==='heavy'||heavyBoss?6:3;
    for(const side of [-1,1]){rounded(c,side<0?-29:23,-23,thick+2,48,3,livery?.armor||'#587075','#243b40',2);for(const y of [-18,18])ellipse(c,side*26,y,2,2,'#e9c969');}
    if(armor==='heavy'||heavyBoss){rounded(c,-26,-30,52,9,3,'#f4d16a','#23393d',2);for(let i=0;i<5;i++)line(c,-20+i*10,-29,-23+i*10,-23,'#35494c',4);}
  }
  if(armor==='grove-shell'){for(const side of [-1,1])polygon(c,[[side*24,-27],[side*35,-14],[side*29,23],[side*22,13]],'#85c89b','#20363a',2);c.save();c.translate(0,19);c.scale(.28,.28);armorArt(c,'grove-shell');c.restore();}
  if(armor==='reflect') {
    c.save();rounded(c,-25,-28,50,54,10,null,'#d7fcff',3);
    c.beginPath();c.moveTo(-21,-17);c.lineTo(-4,-24);c.lineTo(19,17);c.lineTo(8,21);c.closePath();c.fillStyle='#eaffffa0';c.fill();c.restore();
  }
  if(['bastion','polar','star'].includes(armor)){
    for(const side of [-1,1]){rounded(c,side<0?-32:23,-25,9,50,3,livery?(armor==='polar'?livery.highlight:livery.armor):armor==='polar'?'#d9f8ff':armor==='star'?'#e8d18c':'#668ba3','#20363a',2);}
    c.save();c.translate(0,19);c.scale(.28,.28);armorArt(c,armor,livery);c.restore();
    if(armor==='bastion')for(const x of [-20,0,20])rounded(c,x-5,-34,10,13,2,'#bfd6df','#20363a',2);
    if(armor==='polar')for(const side of [-1,1])polygon(c,[[side*24,-26],[side*31,-39],[side*33,-20]],'#c4f5ff');
    if(armor==='star')for(const side of [-1,1])ellipse(c,side*27,-20,3,3,'#fff6c0');
  }
  if(encounterRole)encounterShell(c,encounterRole,color);
  else if(boss&&region>=5){
    bossOutline(c,theme);
  }
  for(const side of [-1,1]){ellipse(c,side*10,-8,6,7,'#20373c');ellipse(c,side*10,-9,4.8,5.5,'#fffbe6');ellipse(c,side*10+Math.cos(angle)*1.6,-9+Math.sin(angle),2.2,2.6,'#233c41');ellipse(c,side*10-1,-11,1.4,1.4,'#fff');}
  rounded(c,-13,8,26,7,3,'#28424a','#1e373b',1.5);for(let i=0;i<3;i++)rounded(c,-9+i*7,10,4,2,1,'#cce8be');
  if(damaged){
    for(const [x,y] of [[-18,-18],[-15,2],[7,18]]){line(c,x,y,x+7,y+6,'#263e46',2.7);line(c,x+1,y+2,x+7,y+7,'#e5ece1',1);}
    line(c,-25,0,-20,6,'#b9c0a6',3);
    if(critical){
      c.beginPath();c.moveTo(15,1);c.lineTo(22,5);c.lineTo(16,11);c.lineTo(21,19);c.lineTo(10,21);c.lineTo(9,10);c.closePath();c.fillStyle='#263d42';c.fill();
      line(c,13,7,20,14,'#ffc45c',2);line(c,19,5,12,18,'#e96c57',2);
      c.globalAlpha=reducedMotion?.7:.35+Math.abs(Math.sin(t*9))*.5;ellipse(c,10,-9,4.8,5.5,'#f19759');c.globalAlpha=1;
      if(!reducedMotion){const f=(t*3)%1;for(let i=0;i<3;i++)line(c,19+f*7,7-i*3,24+f*11,9-i*5,'#fff0a0',1.8*(1-f));}
    }
    for(let i=0;i<(critical?5:2);i++){const f=reducedMotion?(i+.5)/(critical?5:2):(t*(critical?.65:.4)+i/(critical?5:2))%1;c.globalAlpha=(1-f)*(critical?.52:.28);ellipse(c,-20+Math.sin(i*2+f*4)*6,-24-f*37,4+f*9,4+f*8,critical?'#607378':'#c9d5c6');}c.globalAlpha=1;
  }
  if(type==='hopper')for(const side of [-1,1]){const lift=moving?Math.sin(t*10)*3:0;line(c,side*20,24,side*31,32+lift,'#d1dfbb',5);line(c,side*31,32+lift,side*22,39,'#3f5d6e',5);rounded(c,side*22-8,36,16,6,2,'#f4d683','#20363a',2);}
  if(type==='medic'){rounded(c,-12,-35,24,13,3,'#e7ffda','#2a6554',2);line(c,-6,-29,6,-29,'#3c9b68',4);line(c,0,-34,0,-24,'#3c9b68',4);}
  if(!boss&&type==='tank')for(const side of [-1,1]){
    rounded(c,side<0?-40:26,-8,14,37,3,livery?.armor||'#587075','#20363a',3);
    for(const y of [0,10,20])line(c,side<0?-37:29,y,side<0?-29:37,y,'#b8cfca',2);
  }
  if(!boss&&type==='ranged'){
    line(c,-17,-31,17,-31,'#20363a',6);
    for(const side of [-1,1]){rounded(c,side*17-5,-37,10,12,2,'#779ba7','#20363a',2);ellipse(c,side*17,-32,2.5,2.5,'#fff0b4');}
  }
  if(type==='carrier'){rounded(c,-35,-22,12,43,4,livery?.armor||'#e9bd6b','#20363a',2);rounded(c,23,-22,12,43,4,livery?.armor||'#e9bd6b','#20363a',2);rounded(c,-22,-37,44,11,3,livery?.highlight||'#819a8d','#20363a',2);for(const x of [-14,0,14])ellipse(c,x,-32,3,3,'#fff0b4');}
  if(type==='burrow'){c.save();c.translate(0,-28);polygon(c,[[-16,0],[0,-23],[16,0]],'#d8e3dc');for(let i=0;i<3;i++)line(c,-4-i*4,-17+i*6,5+i*4,-13+i*6,'#667f88',2);c.restore();}
  if(type==='sentry'){rounded(c,-32,25,64,9,3,'#738d99','#20363a',2);line(c,-22,27,-38,35,'#345264',5);line(c,22,27,38,35,'#345264',5);}
  if(gadget!=='none'){c.save();c.translate(-33,-2);c.scale(.35,.35);gadgetArt(c,gadget,t);c.restore();}
  c.save();c.translate(Math.cos(angle)<0?-24:24,10);c.rotate(angle);weapon(c,gun,t,reducedMotion?(swing>0?.45:0):swing);c.restore();
  if(type==='shield'){c.save();c.rotate(angle);rounded(c,28,-24,13,48,5,livery?.highlight||'#b4dfd5','#20363a',3);line(c,33,-16,33,16,'#fff0ae',4);c.restore();}
  robotCostume(c,halloween);
  if(shield){ellipse(c,0,-1,40,43,'#90eaff17');c.beginPath();c.ellipse(0,-1,40,43,0,0,Math.PI*2);c.strokeStyle='#b9f5ed90';c.lineWidth=2;c.stroke();}
  c.restore();
}


export function atlasBot(c,x,y,save,gun=save.build.weapon){
 ellipse(c,x,y,33,33,'#173d68');ring(c,x,y,33,'#ffe17b',3);
 bot(c,x,y+2,56,{color:save.color,armor:save.build.armor,wheels:save.build.wheels,gun,gadget:save.build.gadget,angle:0,reducedMotion:true});
}
