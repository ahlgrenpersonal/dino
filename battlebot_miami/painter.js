import {AREAS,BRIDGES,ROADS,LANDMARKS,HOME,KEY_LOOP,PRIVATE_ZONES,isPrivate,visibleAreas,weaponFor,regionAt,inside,onLine,dist,CHARGING_STATIONS,HOME_SAFE_RADIUS,nextChapter} from './world.js?v=world16';
import {bot,rounded,atlasBot,equipmentIcon} from './bot-art.js?v=world16';
import {peacock} from './wildlife-art.js?v=world16';
import {drawLandmark} from './landmark-art.js?v=world16';
const ink='#244647';
// The standard Adventure camera, paired with its 1.17-unit player artwork.
export const adventureZoom=width=>(width<600?Math.max(55,Math.min(76,width/6.3)):85)*.81;
function line(c,points,color,width){c.beginPath();points.forEach((p,i)=>i?c.lineTo(p.x,p.y):c.moveTo(p.x,p.y));c.strokeStyle=color;c.lineWidth=width;c.lineJoin='round';c.lineCap='round';c.stroke();}
function poly(c,points,fill,stroke,width=.1){c.beginPath();points.forEach(([x,y],i)=>i?c.lineTo(x,y):c.moveTo(x,y));c.closePath();c.fillStyle=fill;c.fill();if(stroke){c.strokeStyle=stroke;c.lineWidth=width;c.stroke();}}
function oval(c,x,y,rx,ry,fill){c.beginPath();c.ellipse(x,y,rx,ry,0,0,Math.PI*2);c.fillStyle=fill;c.fill();}
function label(c,txt,x,y,size=.43,color=ink){if(c.showLabels===false&&/[A-Za-z0-9]/.test(txt))return;c.font=`800 ${size}px system-ui`;c.textAlign='center';c.lineWidth=.16;c.strokeStyle='#edf5d9';c.strokeText(txt,x,y);c.fillStyle=color;c.fillText(txt,x,y);}
const hash=(x,y)=>{let n=Math.imul(x+131,374761393)^Math.imul(y+71,668265263);n=Math.imul(n^(n>>>13),1274126177);return ((n^(n>>>16))>>>0)/4294967296;};
function palm(c,x,y,s=1){c.save();c.translate(x,y);c.scale(s,s);oval(c,.2,.3,.6,.2,'#163e3724');line(c,[{x:0,y:.3},{x:.2,y:-1.2},{x:0,y:-1.7}],'#a78256',.16);for(let i=0;i<6;i++){const a=i*Math.PI/3;c.beginPath();c.moveTo(0,-1.7);c.quadraticCurveTo(Math.cos(a)*.7,-1.7+Math.sin(a)*.6,Math.cos(a)*1.1,-1.4+Math.sin(a)*.8);c.strokeStyle=i%2?'#3d916f':'#5fac78';c.lineWidth=.24;c.stroke();}c.restore();}
function building(c,x,y,h,color){poly(c,[[x-.6,y],[x+.6,y],[x+.8,y-.22],[x+.8,y-h-.2],[x+.55,y-h],[x-.6,y-h]],color,'#577f7e',.035);poly(c,[[x+.55,y],[x+.8,y-.22],[x+.8,y-h-.2],[x+.55,y-h]],'#6ba6a1',null);for(let yy=y-.35;yy>y-h;yy-=.32)line(c,[{x:x-.43,y:yy},{x:x+.4,y:yy}],'#d5f9e4',.07);}
export class MiamiPainter{
 constructor(canvas){this.canvas=canvas;this.c=canvas.getContext('2d');this.camera={...HOME};this.scale=76.5;this.baseScale=76.5;this.width=0;this.height=0;}
 resize(){const b=this.canvas.getBoundingClientRect(),d=Math.min(devicePixelRatio||1,2),previous=this.baseScale,first=!this.width;if(this.canvas.width!==Math.round(b.width*d)||this.canvas.height!==Math.round(b.height*d)){this.canvas.width=Math.round(b.width*d);this.canvas.height=Math.round(b.height*d);}if(b.width!==this.width){this.baseScale=adventureZoom(Math.max(1,b.width));this.scale=first?this.baseScale:this.scale*this.baseScale/previous;}this.width=b.width;this.height=b.height;this.dpr=d;}
 worldPoint(x,y){return {x:(x-this.width/2)/this.scale+this.camera.x,y:(y-this.height*.51)/this.scale+this.camera.y};}
 follow(g,dt){const p=g.player,bosses=g.enemies.filter(e=>e.boss&&e.hp>0&&g.awake(e)&&dist(e,p)<8);let target={x:p.x,y:p.y},zoom=this.baseScale;if(bosses.length){const left=Math.min(p.x-1.2,...bosses.map(e=>e.x-1.9)),right=Math.max(p.x+1.2,...bosses.map(e=>e.x+1.9)),top=Math.min(p.y-1.1,...bosses.map(e=>e.y-1.8)),bottom=Math.max(p.y+.8,...bosses.map(e=>e.y+1.1));zoom=Math.max(this.baseScale*.55,Math.min(this.baseScale,(this.width-32)/(right-left),(this.height-110)/(bottom-top)));target={x:(left+right)/2,y:(top+bottom)/2-30/zoom};}const smooth=1-Math.exp(-Math.max(0,dt)*5);this.scale+=(zoom-this.scale)*smooth;this.camera.x+=(target.x-this.camera.x)*smooth;this.camera.y+=(target.y-this.camera.y)*smooth;g.viewBounds={left:this.camera.x-this.width/this.scale/2,right:this.camera.x+this.width/this.scale/2,top:this.camera.y-this.height/this.scale*.51,bottom:this.camera.y+this.height/this.scale*.49};}
 terrain(c,save,t=0,map=false){
  const visible=visibleAreas(save),ids=new Set(visible.map(a=>a.id));
  for(const a of visible)for(const p of a.polys){poly(c,p,'#397d87',null);c.save();c.translate(0,-.35);poly(c,p,a.color,'#e5edcc',.28);c.restore();}
  for(const b of BRIDGES.filter(b=>ids.has(b.area))){line(c,b.points,'#426d79',b.width+1);line(c,b.points,'#e3e9d4',b.width+.3);line(c,b.points,b.wood?'#c7b18a':'#a6bbad',b.width-.4);c.setLineDash([.5,.6]);line(c,b.points,'#fcf4c7',.08);c.setLineDash([]);}
  for(const r of ROADS.filter(r=>ids.has(r.area))){line(c,r.points,'#91aa93',2.3);line(c,r.points,'#e8e3c5',1.8);}
  if(ids.has(1)){line(c,KEY_LOOP,'#f1e6c3',1.6);for(const p of PRIVATE_ZONES){poly(c,p,'#9eaea6','#687f7d',.12);}if(!map){for(const p of [{x:118,y:70},{x:123,y:70},{x:122,y:76}])building(c,p.x,p.y,2,'#a6bdc5');label(c,'PRIVATE RESIDENCES',121,73,.3);}}
  if(ids.has(7)){poly(c,[[184.5,28],[189.6,36],[189.5,56],[185,65],[182.8,65],[186.5,55],[187,36],[182.5,28]],'#f5e8bd',null);}
  if(map)return;
  oval(c,HOME.x,HOME.y,HOME_SAFE_RADIUS,HOME_SAFE_RADIUS,'#d8f5af30');c.beginPath();c.arc(HOME.x,HOME.y,HOME_SAFE_RADIUS,0,Math.PI*2);c.strokeStyle='#d4efb7';c.lineWidth=.06;c.stroke();
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
  for(const s of CHARGING_STATIONS.filter(s=>ids.has(s.area))){oval(c,s.x,s.y+.1,.9,.5,'#94e5b133');c.beginPath();c.ellipse(s.x,s.y+.1,.9,.5,0,0,Math.PI*2);c.strokeStyle='#a9efd0';c.lineWidth=.06;c.stroke();label(c,'＋',s.x+.65,s.y-.3,.42,'#e5ffdb');}
 }
 landmark(c,l,t,save={discoveries:[]}){const drawn=drawLandmark(c,l,{seen:save.discoveries?.includes(l.id)});if(l.equipment&&!save.discoveries?.includes(l.id)){c.save();c.translate(l.x,l.y+1.3);oval(c,0,0,.85,.7,'#fff1b3');c.scale(.021,.021);c.translate(-34,-34);equipmentIcon(c,l.equipment.type,l.equipment.id);c.restore();}if(drawn)return;c.save();c.translate(l.x,l.y);
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
  if(e.peacock){peacock(c,e.x,e.y,1.1,t,{hit:e.hit,moving:true});if(e.hp<e.maxHp){rounded(c,e.x-.4,e.y-.8,.8,.07,.03,'#264e58');rounded(c,e.x-.4,e.y-.8,.8*Math.max(0,e.hp/e.maxHp),.07,.03,'#f18a7c');}return;}
  const a=AREAS[e.area],boss=e.boss,s=boss?(e.king?1.9:1.7):.72;
  bot(c,e.x,e.y,s,{color:e.king?'#779a65':a.theme==='ghost'?'#b5e5e8':a.theme==='mummy'?'#ccb589':a.theme==='witch'?'#a991c6':a.theme==='vampire'?'#ad80ad':a.theme==='skeleton'?'#dbd5b9':'#8fb477',halloween:e.king?'zombie':a.theme,gun:e.king?'firejet':boss?weaponFor(a.reward).art:'bumper',armor:boss?'steel':'light',wheels:boss?'rover':'basic',angle:e.angle,hit:e.hit,swing:e.swing,health:e.hp/e.maxHp,reducedMotion:this.reducedMotion},t);
  if(boss&&e.area>=6&&!e.guardBroken){oval(c,e.x,e.y,.95,1.15,'#a3e8ff22');c.beginPath();c.ellipse(e.x,e.y,.95,1.15,0,0,Math.PI*2);c.strokeStyle='#b9f8ff';c.lineWidth=.07;c.stroke();label(c,'ϟ ☝',e.x,e.y+1.6,.5);}
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
 draw(g,dt){this.resize();this.c.showLabels=false;if(this.width<=0||this.height<=0)return;this.reducedMotion=matchMedia('(prefers-reduced-motion: reduce)').matches;const c=this.c,p=g.player;
  this.follow(g,dt);
  c.setTransform(this.dpr,0,0,this.dpr,0,0);c.fillStyle='#5ba8b1';c.fillRect(0,0,this.width,this.height);
  c.save();c.translate(this.width/2,this.height*.51);c.scale(this.scale,this.scale);c.translate(-this.camera.x,-this.camera.y);
  c.strokeStyle='#b8e4da33';c.lineWidth=.06;for(let y=Math.floor((this.camera.y-this.height/this.scale)/3)*3;y<this.camera.y+this.height/this.scale;y+=3)for(let x=Math.floor((this.camera.x-this.width/this.scale)/4)*4;x<this.camera.x+this.width/this.scale;x+=4){c.beginPath();c.moveTo(x,y);c.quadraticCurveTo(x+.4,y+.25,x+.9,y);c.stroke();}
  this.terrain(c,g.save,g.time);
  for(const d of g.drops){oval(c,d.x,d.y,.15,.1,'#264c4938');label(c,d.gears?'⚙':'◆',d.x,d.y,.27,d.gears?'#cce7dc':'#ffd35c');}
  if(g.route.length){c.setLineDash([.2,.35]);line(c,[p,...g.route],'#fffbe5',.12);c.setLineDash([]);const end=g.route.at(-1);oval(c,end.x,end.y,.25,.25,'#ffb37e');}
  const actors=g.enemies.filter(e=>e.hp>0&&Math.abs(e.x-this.camera.x)<this.width/this.scale&&Math.abs(e.y-this.camera.y)<this.height/this.scale).map(e=>({y:e.y,draw:()=>{this.actor(c,e,g.time);if(e.boss&&!g.awake(e))label(c,'🔒',e.x,e.y+1.5,.6);}}));
  actors.push({y:p.y,draw:()=>{bot(c,p.x,p.y,1.17,{color:g.save.color,gun:weaponFor(g.save.weapon).art,armor:g.save.build.armor,wheels:g.save.build.wheels,gadget:g.save.build.gadget,angle:p.angle,hit:p.hit,swing:p.swing,moving:p.moving,health:p.hp/g.maxHp(),shield:p.invincible>0||g.powerTime>0||(['shield','aegis'].includes(g.save.build.gadget)&&g.shieldCd===0),reducedMotion:this.reducedMotion},g.time);}});
  actors.sort((a,b)=>a.y-b.y).forEach(e=>e.draw());
  for(const q of g.projectiles){const w=weaponFor(q.weapon);c.save();c.translate(q.x,q.y);c.rotate(q.angle);if(q.weapon==='firejet'){poly(c,[[-.55,-.15],[-1.3,0],[-.55,.15]],'#ffd275',null);rounded(c,-.5,-.13,.6,.26,.05,'#6fe1ed',ink,.025);poly(c,[[0,-.23],[.5,0],[0,.23]],'#ff7148',ink,.035);poly(c,[[-.4,-.13],[-.6,-.37],[-.15,-.13],[-.15,.13],[-.6,.37],[-.4,.13]],'#f8e4b0',ink,.025);oval(c,-.5,0,.12,.1,'#fffbd1');}else if(q.weapon==='bubble'){oval(c,0,0,.28,.28,'#c4faffb0');c.beginPath();c.arc(0,0,.29,0,Math.PI*2);c.strokeStyle='#efffff';c.lineWidth=.045;c.stroke();oval(c,-.08,-.08,.07,.07,'#fff');}else if(q.weapon==='tide'){c.rotate(g.time*22);poly(c,[[-.4,-.2],[0,0],[.4,-.2],[.15,.2]],w.color,ink,.04);}else{line(c,[{x:-.55,y:0},{x:.1,y:0}],q.enemy?'#ff8a79':w.color,.17);oval(c,0,0,.16,.16,'#fffcdd');}c.restore();}
  for(const f of g.effects){const alpha=Math.max(0,f.life/f.max);c.globalAlpha=alpha;if(f.type==='beam')line(c,[{x:f.x,y:f.y},{x:f.tx,y:f.ty}],f.color,.15);else{c.beginPath();c.arc(f.x,f.y,(1-alpha)*2+.3,0,Math.PI*2);c.strokeStyle=f.color;c.lineWidth=f.type==='warning'?.08:.2;c.stroke();}}c.globalAlpha=1;c.restore();
 }
 mapPlace(c,l,x,y){c.save();c.translate(x,y);rounded(c,-29,-30,58,58,10,'#e8eed8ee','#d2e5d7',1);const scale=l.kind==='home'||l.kind==='lighthouse'?4:7;c.scale(scale,scale);c.translate(-l.x,-l.y+(l.kind==='home'?3.5:l.kind==='lighthouse'?2:0));this.landmark(c,l,0,{discoveries:[]});c.restore();}
 map(canvas,g,{showPlayer=true}={}){const c=canvas.getContext('2d'),visible=visibleAreas(g.save),points=visible.flatMap(a=>a.polys.flat()),minX=Math.min(...points.map(p=>p[0]))-6,maxX=Math.max(...points.map(p=>p[0]))+6,minY=Math.min(...points.map(p=>p[1]))-8,maxY=Math.max(...points.map(p=>p[1]))+8;canvas.width=600;canvas.height=760;const s=Math.min(550/(maxX-minX),700/(maxY-minY)),ox=(600-(maxX+minX)*s)/2,oy=(760-(maxY+minY)*s)/2;
  c.showLabels=false;c.fillStyle='#235767';c.fillRect(0,0,600,760);c.save();c.translate(ox,oy);c.scale(s,s);this.terrain(c,g.save,0,true);const next=nextChapter(g.save);if(next)for(const a of visible.filter(a=>a.id===next.id||next.id===1&&a.id===0))for(const points of a.polys)poly(c,points,'#ffd35c99','#ffe17b',2.5/s);
  for(const a of visible){const p=a.id?a.entry:HOME;oval(c,p.x,p.y,1.5,1.5,a.id===next?.id?'#ffd47b':'#e9f2d6');if(a.id)label(c,g.save.cleared.includes(`boss-${a.id}`)?'✓':'★',p.x,p.y+.45,1.2);}
  c.restore();
  for(const l of LANDMARKS.filter(l=>visible.some(a=>a.id===l.area))){const x=l.x*s+ox,y=l.y*s+oy;oval(c,x,y,4.5,4.5,l.equipment&&!g.save.discoveries.includes(l.id)?'#ffd46f':['playground','pirate-playground','splash-park'].includes(l.kind)?'#f1a7ab':'#80b9b1');}
  for(const a of visible){const l=LANDMARKS.find(l=>l.id===['panorama','key-park','domino','park-grove','cape-florida','skyviews','frost','south-of-fifth'][a.id])||LANDMARKS.find(l=>l.area===a.id);if(!l)continue;const x=l.x*s+ox,y=l.y*s+oy;this.mapPlace(c,l,x,y);}
  if(next){const p=next.camps.find((_,i)=>!g.save.camps.includes(`camp-${next.id}-${i}`))||next.arena;oval(c,ox+p.x*s,oy+p.y*s,13,13,'#ffe17b');label(c,'➜',ox+p.x*s,oy+p.y*s+6,22);}
  if(showPlayer)atlasBot(c,ox+g.player.x*s,oy+g.player.y*s,g.save,weaponFor(g.save.weapon).art);
  c.textAlign='start';c.fillStyle='#d7f7e9';c.font='800 28px system-ui';c.fillText('↑',550,40);this.mapTransform={s,ox,oy};
 }
}
