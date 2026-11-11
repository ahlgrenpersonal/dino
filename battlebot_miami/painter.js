import {AREAS,BRIDGES,ROADS,LANDMARKS,HOME,KEY_LOOP,PRIVATE_ZONES,isPrivate,visibleAreas,weaponFor,regionAt,inside,onLine,dist} from './world.js?v=world10';
import {bot,rounded} from './bot-art.js?v=world10';
import {peacock} from './wildlife-art.js?v=world10';
import {drawLandmark} from './landmark-art.js?v=world10';
const ink='#244647';
function line(c,points,color,width){c.beginPath();points.forEach((p,i)=>i?c.lineTo(p.x,p.y):c.moveTo(p.x,p.y));c.strokeStyle=color;c.lineWidth=width;c.lineJoin='round';c.lineCap='round';c.stroke();}
function poly(c,points,fill,stroke,width=.1){c.beginPath();points.forEach(([x,y],i)=>i?c.lineTo(x,y):c.moveTo(x,y));c.closePath();c.fillStyle=fill;c.fill();if(stroke){c.strokeStyle=stroke;c.lineWidth=width;c.stroke();}}
function oval(c,x,y,rx,ry,fill){c.beginPath();c.ellipse(x,y,rx,ry,0,0,Math.PI*2);c.fillStyle=fill;c.fill();}
function label(c,txt,x,y,size=.43,color=ink){if(c.showLabels===false&&/[A-Za-z0-9]/.test(txt))return;c.font=`800 ${size}px system-ui`;c.textAlign='center';c.lineWidth=.16;c.strokeStyle='#edf5d9';c.strokeText(txt,x,y);c.fillStyle=color;c.fillText(txt,x,y);}
const hash=(x,y)=>{let n=Math.imul(x+131,374761393)^Math.imul(y+71,668265263);n=Math.imul(n^(n>>>13),1274126177);return ((n^(n>>>16))>>>0)/4294967296;};
function palm(c,x,y,s=1){c.save();c.translate(x,y);c.scale(s,s);oval(c,.2,.3,.6,.2,'#163e3724');line(c,[{x:0,y:.3},{x:.2,y:-1.2},{x:0,y:-1.7}],'#a78256',.16);for(let i=0;i<6;i++){const a=i*Math.PI/3;c.beginPath();c.moveTo(0,-1.7);c.quadraticCurveTo(Math.cos(a)*.7,-1.7+Math.sin(a)*.6,Math.cos(a)*1.1,-1.4+Math.sin(a)*.8);c.strokeStyle=i%2?'#3d916f':'#5fac78';c.lineWidth=.24;c.stroke();}c.restore();}
function building(c,x,y,h,color){poly(c,[[x-.6,y],[x+.6,y],[x+.8,y-.22],[x+.8,y-h-.2],[x+.55,y-h],[x-.6,y-h]],color,'#577f7e',.035);poly(c,[[x+.55,y],[x+.8,y-.22],[x+.8,y-h-.2],[x+.55,y-h]],'#6ba6a1',null);for(let yy=y-.35;yy>y-h;yy-=.32)line(c,[{x:x-.43,y:yy},{x:x+.4,y:yy}],'#d5f9e4',.07);}
export class MiamiPainter{
 constructor(canvas){this.canvas=canvas;this.c=canvas.getContext('2d');this.camera={...HOME};this.scale=24;this.width=1;this.height=1;}
 resize(){const b=this.canvas.getBoundingClientRect(),d=Math.min(devicePixelRatio||1,2);if(this.canvas.width!==Math.round(b.width*d)||this.canvas.height!==Math.round(b.height*d)){this.canvas.width=Math.round(b.width*d);this.canvas.height=Math.round(b.height*d);}this.width=b.width;this.height=b.height;this.dpr=d;this.scale=Math.max(.01,Math.min(Math.max(1,b.width)/(b.width<600?23:42),Math.max(1,b.height)/17));}
 worldPoint(x,y){return {x:(x-this.width/2)/this.scale+this.camera.x,y:(y-this.height/2)/this.scale+this.camera.y};}
 terrain(c,save,t=0,map=false){
  const visible=visibleAreas(save),ids=new Set(visible.map(a=>a.id));
  for(const a of visible)for(const p of a.polys){poly(c,p,'#397d87',null);c.save();c.translate(0,-.35);poly(c,p,a.color,'#e5edcc',.28);c.restore();}
  for(const b of BRIDGES.filter(b=>ids.has(b.area))){line(c,b.points,'#426d79',b.width+1);line(c,b.points,'#e3e9d4',b.width+.3);line(c,b.points,b.wood?'#c7b18a':'#a6bbad',b.width-.4);c.setLineDash([.5,.6]);line(c,b.points,'#fcf4c7',.08);c.setLineDash([]);}
  for(const r of ROADS.filter(r=>ids.has(r.area))){line(c,r.points,'#91aa93',2.3);line(c,r.points,'#e8e3c5',1.8);}
  if(ids.has(1)){line(c,KEY_LOOP,'#f1e6c3',1.6);for(const p of PRIVATE_ZONES){poly(c,p,'#9eaea6','#687f7d',.12);}if(!map){for(const p of [{x:118,y:70},{x:123,y:70},{x:122,y:76}])building(c,p.x,p.y,2,'#a6bdc5');label(c,'PRIVATE RESIDENCES',121,73,.3);}}
  if(ids.has(7)){poly(c,[[184.5,28],[189.6,36],[189.5,56],[185,65],[182.8,65],[186.5,55],[187,36],[182.5,28]],'#f5e8bd',null);}
  if(map)return;
  const b={left:this.camera.x-this.width/2/this.scale-3,right:this.camera.x+this.width/2/this.scale+3,top:this.camera.y-this.height/2/this.scale-1,bottom:this.camera.y+this.height/2/this.scale+5};
  for(let y=Math.floor(b.top/3)*3;y<b.bottom;y+=3)for(let x=Math.floor(b.left/3)*3;x<b.right;x+=3){
   const p={x:x+hash(x,y),y:y+hash(y,x)},r=regionAt(p),a=AREAS[r];if(!ids.has(r)||!a||isPrivate(p)||hash(x,y)<.25)continue;
   if(BRIDGES.some(b=>onLine(p,b.points,b.width+2))||ROADS.some(r=>onLine(p,r.points,4))||LANDMARKS.some(l=>dist(l,p)<3)||a.camps?.some(q=>dist(q,p)<2.4)||a.arena&&dist(a.arena,p)<3||dist(HOME,p)<3||(Math.abs(p.x-HOME.x)<3&&p.y<HOME.y&&p.y>HOME.y-11))continue;
   if([0,1,5].includes(r)&&hash(x,y)>.4)building(c,p.x,p.y,.7+hash(x,y)*1.3,['#b0d4cc','#efc6ae','#c0cee3'][Math.floor(hash(x,y)*3)]);else if(r===4){palm(c,p.x,p.y,.65);if(hash(y,x)>.6){oval(c,p.x+.7,p.y,.55,.23,'#e98b84');}}else palm(c,p.x,p.y,.7+hash(y,x)*.25);
  }
  for(const a of visible.filter(a=>a.id))for(const [i,p] of a.camps.entries()){
   const done=save.camps.includes(`camp-${a.id}-${i}`);oval(c,p.x,p.y,1.9,1.15,done?'#88c69b66':'#60787235');rounded(c,p.x-.3,p.y-.35,.6,.65,.1,done?'#9ff4b9':'#ffdd79',ink,.05);rounded(c,p.x-.12,p.y-.55,.24,.15,.03,'#f4e7b8');label(c,done?'✓':'ϟ',p.x,p.y+.13,.44,ink);
  }
  for(const l of LANDMARKS.filter(l=>ids.has(l.area)&&l.x>b.left-6&&l.x<b.right+6&&l.y>b.top&&l.y<b.bottom+8))this.landmark(c,l,t,save);
 }
 landmark(c,l,t,save={discoveries:[]}){if(drawLandmark(c,l,{seen:save.discoveries?.includes(l.id)}))return;c.save();c.translate(l.x,l.y);
  if(l.kind==='museum'){
   rounded(c,-3,-1.1,6,1.3,.12,'#e9f2e5',ink,.05);oval(c,-1,-1.3,1.3,1,'#8ec3d0');poly(c,[[-2.3,-1.3],[-2.3,-.9],[.3,-.9],[.3,-1.3]],'#8ec3d0',null);rounded(c,.7,-2,2.1,1.6,.12,'#e9f2e5',ink,.05);for(let i=0;i<4;i++)line(c,[{x:1+i*.45,y:-1.8},{x:1+i*.45,y:-.65}],'#87bac4',.1);label(c,'FROST SCIENCE',0,-2.8,.48);
  }else if(l.kind==='beach'){
   palm(c,0,-.1,.8);poly(c,[[.6,-.4],[2,-.4],[1.3,-1.25]],'#ef9890',ink,.04);line(c,[{x:1.3,y:-.4},{x:1.3,y:.2}],ink,.05);label(c,l.name,0,1.2,.44);
  }else if(l.kind==='cafe'){
   rounded(c,-1.5,-1.2,3,1.2,.1,'#f0ad83',ink,.04);for(let i=0;i<6;i++)rounded(c,-1.5+i*.5,-1.3,.5,.35,.03,i%2?'#fff1c8':'#e77f76');label(c,'CALLE OCHO',0,-1.8,.5);
  }else if(l.kind==='grove'||l.kind==='park'){for(const x of [-1,0,1])palm(c,x,0,.8);label(c,l.name,0,1,.44);}
  else{building(c,-.5,0,1.8,'#b6cee1');building(c,.6,.2,2.4,'#d6bcc8');label(c,l.name,0,1.1,.44);}
  c.restore();
 }
 actor(c,e,t){
  if(e.peacock){peacock(c,e.x,e.y,2,t,{hit:e.hit,moving:true});if(e.hp<e.maxHp){rounded(c,e.x-.65,e.y-1.35,1.3,.1,.05,'#264e58');rounded(c,e.x-.65,e.y-1.35,1.3*Math.max(0,e.hp/e.maxHp),.1,.05,'#f18a7c');}return;}
  const a=AREAS[e.area],boss=e.boss,s=boss?(e.king?2.9:2.65):1.55;
  bot(c,e.x,e.y,s,{color:e.king?'#779a65':a.theme==='ghost'?'#b5e5e8':a.theme==='mummy'?'#ccb589':a.theme==='witch'?'#a991c6':a.theme==='vampire'?'#ad80ad':a.theme==='skeleton'?'#dbd5b9':'#8fb477',halloween:e.king?'zombie':a.theme,gun:e.king?'firejet':boss?weaponFor(a.reward).art:'bumper',armor:boss?'steel':'light',wheels:boss?'rover':'basic',angle:e.angle,hit:e.hit,swing:e.swing,health:e.hp/e.maxHp,reducedMotion:this.reducedMotion},t);
  if(boss){c.save();c.translate(e.x,e.y);c.scale(s/80,s/80);
   if(e.king){poly(c,[[-24,-36],[-30,-58],[-15,-48],[0,-65],[15,-48],[30,-58],[24,-36]],'#ffe28c',ink,2);for(const x of [-13,0,13])oval(c,x,-42,3,4,'#f19b69');for(const x of [-38,38]){rounded(c,x-5,6,10,22,2,'#425b65',ink,2);poly(c,[[x-5,26],[x,40+Math.sin(t*10)*3],[x+5,26]],'#ffb652',null);}}
   else if(e.area===6){poly(c,[[-23,-35],[-26,-52],[-12,-44],[0,-62],[13,-44],[26,-52],[23,-35]],'#c8eaff',ink,2);oval(c,0,-44,5,7,'#a287df');for(const side of [-1,1])poly(c,[[side*26,2],[side*46,22],[side*28,37]],'#e6e6ff',ink,2);}
   else if(e.area===1){poly(c,[[-26,-35],[-17,-51],[0,-42],[18,-51],[26,-35]],'#e48cc3',ink,2);oval(c,-16,-12,10,5,'#29374c');oval(c,13,-12,10,5,'#29374c');line(c,[{x:-6,y:-12},{x:3,y:-12}],'#fff0cb',2);}
   else if(e.area===2){for(const side of [-1,1])poly(c,[[side*18,-32],[side*40,-27],[side*38,13],[side*23,7]],'#51b7ac',ink,2);poly(c,[[-19,-31],[0,-54],[20,-31]],'#e2ba64',ink,2);}
   else if(e.area===3){for(const side of [-1,1]){line(c,[{x:side*30,y:10},{x:side*40,y:-25},{x:side*50,y:-34}],'#6a9565',4);oval(c,side*47,-32,8,4,'#b8dd8b');}}
   else if(e.area===4){poly(c,[[-33,-35],[-24,-55],[0,-46],[24,-55],[33,-35]],'#427f96',ink,2);oval(c,0,-43,5,4,'#f6ecd2');line(c,[{x:-38,y:24},{x:-38,y:-22}],'#c4ab75',3);poly(c,[[-38,-22],[-60,-18],[-38,-7]],'#eb9b78',ink,2);}
   else if(e.area===5){for(const side of [-1,1]){rounded(c,side*32-8,-28,16,30,5,'#4b526b',ink,2);oval(c,side*32,-10,4,6,'#e695b4');}line(c,[{x:-30,y:-27},{x:-23,y:-41},{x:23,y:-41},{x:30,y:-27}],'#65627e',5);}
   c.restore();
  }
  if(e.hp<e.maxHp){rounded(c,e.x-.65,e.y-1.35,1.3,.1,.05,'#264e58');rounded(c,e.x-.65,e.y-1.35,1.3*Math.max(0,e.hp/e.maxHp),.1,.05,'#f18a7c');}
 }
 draw(g,dt){this.resize();this.c.showLabels=g.save.details===true;if(this.width<=0||this.height<=0)return;this.reducedMotion=matchMedia('(prefers-reduced-motion: reduce)').matches;const c=this.c,p=g.player;
  this.camera.x+=(p.x-this.camera.x)*Math.min(1,dt*8);this.camera.y+=(p.y-(dist(p,HOME)<6&&this.height/this.scale<23?3:0)-this.camera.y)*Math.min(1,dt*8);
  c.setTransform(this.dpr,0,0,this.dpr,0,0);c.fillStyle='#5ba8b1';c.fillRect(0,0,this.width,this.height);
  c.save();c.translate(this.width/2,this.height/2);c.scale(this.scale,this.scale);c.translate(-this.camera.x,-this.camera.y);
  c.strokeStyle='#b8e4da33';c.lineWidth=.06;for(let y=Math.floor((this.camera.y-this.height/this.scale)/3)*3;y<this.camera.y+this.height/this.scale;y+=3)for(let x=Math.floor((this.camera.x-this.width/this.scale)/4)*4;x<this.camera.x+this.width/this.scale;x+=4){c.beginPath();c.moveTo(x,y);c.quadraticCurveTo(x+.4,y+.25,x+.9,y);c.stroke();}
  this.terrain(c,g.save,g.time);
  if(g.route.length){c.setLineDash([.2,.35]);line(c,[p,...g.route],'#fffbe5',.12);c.setLineDash([]);const end=g.route.at(-1);oval(c,end.x,end.y,.25,.25,'#ffb37e');}
  const actors=g.enemies.filter(e=>e.hp>0&&Math.abs(e.x-this.camera.x)<this.width/this.scale&&Math.abs(e.y-this.camera.y)<this.height/this.scale).map(e=>({y:e.y,draw:()=>{this.actor(c,e,g.time);if(e.boss&&!g.awake(e))label(c,g.save.details?(e.king&&g.campsIn(e.area)===3?'CLEAR ALL OTHER BOSSES':'3 BATTERIES FIRST'):'🔒',e.x,e.y+1.5,.6);}}));
  actors.push({y:p.y,draw:()=>{if(p.invincible>0&&Math.floor(g.time*12)%2)c.globalAlpha=.65;bot(c,p.x,p.y,1.9,{color:g.save.color,gun:weaponFor(g.save.weapon).art,armor:['light','steel','heavy'][g.save.armor],wheels:['basic','grip','speed'][g.save.wheels],angle:p.angle,hit:p.hit,swing:p.swing,moving:p.moving,health:p.hp/g.maxHp(),shield:g.powerTime>0,reducedMotion:this.reducedMotion},g.time);c.globalAlpha=1;label(c,'YOU',p.x,p.y+1.3,.35,'#203a45');}});
  actors.sort((a,b)=>a.y-b.y).forEach(e=>e.draw());
  for(const q of g.projectiles){const w=weaponFor(q.weapon);c.save();c.translate(q.x,q.y);c.rotate(q.angle);if(q.weapon==='firejet'){poly(c,[[-.55,-.15],[-1.3,0],[-.55,.15]],'#ffd275',null);rounded(c,-.5,-.13,.6,.26,.05,'#6fe1ed',ink,.025);poly(c,[[0,-.23],[.5,0],[0,.23]],'#ff7148',ink,.035);poly(c,[[-.4,-.13],[-.6,-.37],[-.15,-.13],[-.15,.13],[-.6,.37],[-.4,.13]],'#f8e4b0',ink,.025);oval(c,-.5,0,.12,.1,'#fffbd1');}else if(q.weapon==='bubble'){oval(c,0,0,.28,.28,'#c4faffb0');c.beginPath();c.arc(0,0,.29,0,Math.PI*2);c.strokeStyle='#efffff';c.lineWidth=.045;c.stroke();oval(c,-.08,-.08,.07,.07,'#fff');}else if(q.weapon==='tide'){c.rotate(g.time*22);poly(c,[[-.4,-.2],[0,0],[.4,-.2],[.15,.2]],w.color,ink,.04);}else{line(c,[{x:-.55,y:0},{x:.1,y:0}],q.enemy?'#ff8a79':w.color,.17);oval(c,0,0,.16,.16,'#fffcdd');}c.restore();}
  for(const f of g.effects){const alpha=Math.max(0,f.life/f.max);c.globalAlpha=alpha;if(f.type==='beam')line(c,[{x:f.x,y:f.y},{x:f.tx,y:f.ty}],f.color,.15);else{c.beginPath();c.arc(f.x,f.y,(1-alpha)*2+.3,0,Math.PI*2);c.strokeStyle=f.color;c.lineWidth=f.type==='warning'?.08:.2;c.stroke();}}c.globalAlpha=1;c.restore();
 }
 mapPlace(c,l,x,y){c.save();c.translate(x,y);rounded(c,-29,-30,58,58,10,'#e8eed8ee','#d2e5d7',1);const scale=l.kind==='home'||l.kind==='lighthouse'?4:7;c.scale(scale,scale);c.translate(-l.x,-l.y+(l.kind==='home'?3.5:l.kind==='lighthouse'?2:0));this.landmark(c,l,0,{discoveries:[]});c.restore();}
 map(canvas,g){const c=canvas.getContext('2d'),visible=visibleAreas(g.save),points=visible.flatMap(a=>a.polys.flat()),minX=Math.min(...points.map(p=>p[0]))-6,maxX=Math.max(...points.map(p=>p[0]))+6,minY=Math.min(...points.map(p=>p[1]))-8,maxY=Math.max(...points.map(p=>p[1]))+8;canvas.width=900;canvas.height=720;const s=Math.min(850/(maxX-minX),660/(maxY-minY)),ox=(900-(maxX+minX)*s)/2,oy=(720-(maxY+minY)*s)/2;
  c.showLabels=g.save.details===true;c.fillStyle='#235767';c.fillRect(0,0,900,720);c.save();c.translate(ox,oy);c.scale(s,s);this.terrain(c,g.save,0,true);
  for(const a of visible){const p=a.id?a.entry:HOME;oval(c,p.x,p.y,1.5,1.5,a.id===g.save.unlocked?'#ffd47b':'#e9f2d6');if(a.id)label(c,g.save.cleared.includes(`boss-${a.id}`)?'✓':'★',p.x,p.y+.45,1.2);}
  bot(c,g.player.x,g.player.y,3,{color:g.save.color,gun:weaponFor(g.save.weapon).art},0);c.restore();
  const callout=(text,p,dx,dy,sub='')=>{const px=p.x*s+ox,py=p.y*s+oy;c.font='800 25px system-ui';const bw=Math.max(c.measureText(text).width+24,sub?c.measureText(sub).width*.8+24:0),bh=sub?68:43,cx=Math.max(bw/2+12,Math.min(888-bw/2,px+dx)),cy=Math.max(bh/2+14,Math.min(650-bh/2,py+dy));line(c,[{x:px,y:py},{x:cx,y:cy}],'#d2edcf',2);rounded(c,cx-bw/2,cy-bh/2,bw,bh,7,'#edf3dcee','#7fa99c',1);c.fillStyle='#264b52';c.textAlign='center';c.fillText(text,cx,cy+(sub?-6:8));if(sub){c.font='19px system-ui';c.fillText(sub,cx,cy+20);}};
  if(g.save.details)for(const a of visible){if(a.id===4)continue;const offsets=[[-120,-5],[100,-28],[-125,-65],[-170,75],[],[120,-20],[125,-22],[95,-55]][a.id];callout(a.short,a.id?a.entry:HOME,...offsets,a.id===0?'Panorama Tower':'');}
  if(g.save.details&&visible.some(a=>a.id===4)){callout('Hobie Beach',{x:116,y:110},-40,-28);callout('Virginia Key',{x:130,y:116},125,32);callout('Crandon Beach',{x:142,y:151},110,30,'Key Biscayne');}
  for(const l of LANDMARKS.filter(l=>visible.some(a=>a.id===l.area))){const x=l.x*s+ox,y=l.y*s+oy;oval(c,x,y,4.5,4.5,l.reward?'#ffd46f':['playground','pirate-playground','splash-park'].includes(l.kind)?'#f1a7ab':'#80b9b1');}
  if(!g.save.details)for(const a of visible){const l=LANDMARKS.find(l=>l.id===['panorama','key-park','domino','park-grove','cape-florida','skyviews','frost','south-of-fifth'][a.id])||LANDMARKS.find(l=>l.area===a.id);if(!l)continue;const x=l.x*s+ox,y=l.y*s+oy;this.mapPlace(c,l,x,y);}
  c.textAlign='start';c.fillStyle='#d7f7e9';c.font='800 28px system-ui';c.fillText(g.save.details?'N ↑':'↑',825,40);if(g.save.details){c.font='23px system-ui';c.fillText('Game geography · north up',22,695);}this.mapTransform={s,ox,oy};
 }
}
