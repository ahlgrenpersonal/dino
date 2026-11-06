import { WORLD, WEAPONS, armorSegments, heroLean, eyePosition, roofSurface, SITE_COUNT } from './engine.js?v=world106';
const TAU=Math.PI*2;
const clamp=(n,a,b)=>Math.max(a,Math.min(b,n));
function path(c,points,fill,stroke,width=1){c.beginPath();points.forEach(([x,y],i)=>i?c.lineTo(x,y):c.moveTo(x,y));c.closePath();if(fill){c.fillStyle=fill;c.fill();}if(stroke){c.strokeStyle=stroke;c.lineWidth=width;c.stroke();}}
function line(c,x,y,tx,ty,color,w=2){c.beginPath();c.moveTo(x,y);c.lineTo(tx,ty);c.strokeStyle=color;c.lineWidth=w;c.lineCap='round';c.stroke();}
function oval(c,x,y,rx,ry,color){c.beginPath();c.ellipse(x,y,rx,ry,0,0,TAU);c.fillStyle=color;c.fill();}
function box(c,x,y,w,h,r,color,stroke){c.beginPath();c.roundRect(x,y,w,h,r);c.fillStyle=color;c.fill();if(stroke){c.strokeStyle=stroke;c.lineWidth=1.5;c.stroke();}}
function grad(c,x,y,tx,ty,stops){const g=c.createLinearGradient(x,y,tx,ty);stops.forEach(([p,color])=>g.addColorStop(p,color));return g;}
function glow(c,x,y,r,color){const g=c.createRadialGradient(x,y,0,x,y,r);g.addColorStop(0,color);g.addColorStop(1,'transparent');oval(c,x,y,r,r,g);}
function label(c,text,x,y,size=13,color='#ffe9cf',align='center'){c.font=`700 ${size}px system-ui,sans-serif`;c.textAlign=align;c.fillStyle=color;c.fillText(text,x,y);}
export function lightning(c,x,y,tx,ty,time,color='#b6ffff',w=3){
  const dx=tx-x,dy=ty-y,n=9,len=Math.hypot(dx,dy)||1;
  c.beginPath();c.moveTo(x,y);
  for(let i=1;i<n;i++){const j=Math.sin(i*19.7+time*32)*Math.sin(i/n*Math.PI)*12;c.lineTo(x+dx*i/n-dy/len*j,y+dy*i/n+dx/len*j);}
  c.lineTo(tx,ty);c.strokeStyle=color;c.lineWidth=w;c.lineJoin='round';c.stroke();
}
export function hero(c,x,y,size,time,{facing=1,flying=true,speed=0,vx=0,vy=0,flare=0,portrait=false}={}){
  c.save();c.translate(x,y);c.scale(size/80,size/80);
  const f=facing,lean=portrait?0:heroLean({landed:!flying,vx}),wave=Math.sin(time*9)*4;
  c.rotate(lean);
  // The red cape has a separate gold-lit edge and a flowing silhouette.
  const cape=grad(c,-35,-20,25,60,[[0,'#ff6e66'],[.32,'#d73758'],[1,'#7e234a']]);
  path(c,[[-f*13,-18],[-f*(35+(flying?25:0)),5+wave],[-f*(42+(flying?28:0)),44+wave],[-f*17,40],[f*3,54],[-f*4,-17]],cape);
  line(c,-f*14,-15,-f*(45+(flying?20:0)),39+wave,'#ffab83',2);
  path(c,[[-f*18,-10],[-f*37,27+wave],[-f*18,20]],'#ed4b60');
  if(flare>0||flying)glow(c,0,2,64,`rgba(79,226,255,${flare>0?.35:.15})`);
  // Boots and broad, readable limbs.
  const blue=grad(c,-20,0,22,20,[[0,'#256ebd'],[.5,'#318fda'],[1,'#143f87']]);
  line(c,-9,22,-11+(flying?-6:0),43,'#194d99',13);line(c,10,22,13+(flying?-4:0),42,'#287bd0',13);
  box(c,-22+(flying?-6:0),39,21,11,5,'#f6b64e');box(c,5+(flying?-4:0),39,23,11,5,'#ffd06d');
  path(c,[[-17,-19],[13,-19],[20,9],[13,28],[-14,28],[-20,7]],blue,'#65bef0',1.2);
  line(c,-16,-11,-27,9,'#2b85d0',13);line(c,-27,9,-f*27,22,'#215ca3',11);
  line(c,14,-10,27,flying&&speed>100?-16:3,'#419de1',13);line(c,27,flying&&speed>100?-16:3,32,flying?-10:17,'#2876be',11);
  oval(c,-f*27,23,7,7,'#f4bd94');oval(c,32,flying?-12:18,7,7,'#ffd0a5');
  box(c,-17,18,33,6,2,'#efb749');box(c,-5,17,11,8,2,'#ffe69a');
  path(c,[[1,-17],[-9,1],[-1,1],[-5,14],[12,-7],[3,-7],[8,-17]],'#fff1a4');
  oval(c,0,-25,12,9,'#cc8d6b');
  // Soft childlike face, sandy hair, small original domino mask.
  oval(c,1,-37,19,21,'#ffcba6');oval(c,-17,-35,4,6,'#f0af8d');oval(c,19,-35,4,6,'#f6bb95');
  const hair=grad(c,-19,-60,20,-32,[[0,'#ffe9ad'],[.5,'#d8ad6f'],[1,'#a7774c']]);
  path(c,[[-19,-35],[-24,-46],[-16,-59],[-1,-63],[15,-60],[23,-49],[19,-30],[14,-42],[4,-48],[-8,-43],[-15,-38]],hair);
  line(c,-15,-52,-5,-58,'#fff1c4',3);line(c,0,-54,9,-55,'#efd391',3);
  path(c,[[-16,-39],[-3,-41],[1,-37],[6,-41],[18,-38],[15,-29],[5,-30],[0,-27],[-6,-30],[-15,-30]],'#17538a');
  oval(c,-8,-35,4,3,'#d7ffff');oval(c,10,-35,4,3,'#d7ffff');oval(c,-7+f,-35,1.8,2.5,'#225d74');oval(c,10+f,-35,1.8,2.5,'#225d74');
  c.beginPath();c.arc(2,-26,6,.1,Math.PI-.1);c.strokeStyle='#9f574b';c.lineWidth=2;c.stroke();
  if(!portrait){
    const t=time*3;
    lightning(c,-31,-32,-42,9+wave,t,'#94f8ff',1.8);lightning(c,35,-30,42,20,t+.5,'#efffff',1.4);
    if(flying){line(c,-12,49,-16,61+Math.sin(t)*6,'#a5fcff',3);line(c,12,49,9,60+Math.cos(t)*6,'#e8ffff',2);}
  }
  c.restore();
}
function robot(c,e,time,ghost=false){
  if(e.type==='excavator'){excavator(c,e,time);return;}
  if(e.type==='wyvern'){stormwing(c,e,time);return;}
  const titan=e.type==='titan',s=titan?3.9:1;
  c.save();c.translate(e.x,e.y);c.scale(s,s);
  if(e.hit>0)c.globalAlpha=.55+Math.sin(time*40)*.3;
  const bob=e.type==='drone'?Math.sin(time*8+e.phase)*3:Math.sin(time*2+e.phase)*1.2;
  c.translate(0,bob);
  const metal=grad(c,-28,-32,29,32,[[0,'#bdd3dd'],[.22,'#7d99ad'],[.42,'#e0e9e4'],[.6,'#667c97'],[1,'#253a55']]);
  const dark=grad(c,-10,-20,20,30,[[0,'#324e66'],[1,'#142b43']]);
  if(e.type==='drone'){
    glow(c,0,10,46,'#ffba7e44');
    line(c,-40,0,40,0,'#30485c',7);oval(c,-37,-7,20,4,'#b4dfdc');oval(c,37,-7,20,4,'#b4dfdc');
    oval(c,0,0,25,18,metal);box(c,-18,-5,36,9,4,'#152c44');line(c,-11,-1,11,-1,'#ffbd77',3);
    path(c,[[-8,17],[0,30],[8,17]],'#90fbff');
  }else{
    oval(c,0,51,33,6,'#14243944');
    // Broken panels make giant progress visible.
    for(const f of [-1,1]){
      line(c,f*12,22,f*16,41,dark,12);box(c,f*16-10,37,23,13,3,metal,'#172e49');
      if(!titan||e.hp>e.maxHp*(f<0?.5:.25)){
        line(c,f*26,-12,f*32,15,dark,12);box(c,f*33-9,4,18,27,5,metal,'#243c55');
        path(c,[[f*15,-25],[f*35,-25],[f*42,-10],[f*22,-6]],metal,'#284561',1.3);
        line(c,f*27,-20,f*34,-16,'#f0ac78',2);
      }else lightning(c,f*22,-14,f*32,2,time,'#9efbff',1.2);
    }
    path(c,[[-21,-23],[20,-23],[25,4],[14,28],[-13,28],[-25,4]],metal,'#1b344e',1.5);
    path(c,[[-15,-14],[15,-14],[18,8],[0,19],[-17,8]],dark);
    for(let i=0;i<3;i++)line(c,-11,8+i*5,11,8+i*5,'#6b869a',2);
    if(titan&&e.hp<e.maxHp*.75){path(c,[[-13,-12],[10,-7],[0,14],[-14,2]],'#142536');lightning(c,-10,-8,9,8,time,'#ffe297',1);}
    glow(c,0,-3,17,'#ffad7655');oval(c,0,-3,8,8,'#492c41');oval(c,0,-3,5.4,5.4,'#ffcd8a');oval(c,-1,-4,2.6,2.6,'#fff6d5');
    box(c,-14,-48,28,29,9,metal,'#243950');path(c,[[-14,-34],[0,-30],[14,-34],[11,-23],[0,-18],[-11,-23]],dark);
    line(c,-10,-36,-3,-35,'#ffba6e',3);line(c,4,-35,11,-36,'#ffba6e',3);
    if(titan){line(c,-8,-47,0,-42,'#f5e7c8',1);line(c,0,-42,8,-47,'#e1e6da',1);}
  }
  c.restore();
}
function tree(c,x,y,s=1){
  c.save();c.translate(x,y);c.scale(s,s);line(c,0,0,0,-65,'#796c62',10);
  for(const [dx,dy,r] of [[-22,-65,28],[15,-78,32],[0,-100,31]]){oval(c,dx+4,dy+5,r,r,'#456b63');oval(c,dx-4,dy-4,r*.83,r*.84,'#729b73');oval(c,dx-12,dy-11,r*.5,r*.53,'#9eb786');}c.restore();
}
function pine(c,x,y,s=1){c.save();c.translate(x,y);c.scale(s,s);line(c,0,0,0,-90,'#6d6171',8);for(let i=0;i<3;i++){const by=-25-i*30;path(c,[[-38+i*5,by],[0,by-62],[38-i*5,by]],i%2?'#466e72':'#31566a');path(c,[[-12,by-43],[0,by-62],[13,by-42]],'#dce7e3');}c.restore();}
function miningRock(c,x,y,r,angle=0){
  c.save();c.translate(x,y);c.rotate(angle);
  const shape=[[-.82,-.5],[-.18,-.97],[.65,-.72],[1,.12],[.53,.84],[-.3,.94],[-.94,.25]].map(([a,b])=>[a*r,b*r]);
  path(c,shape,grad(c,-r,-r,r,r,[[0,'#dbb18a'],[.4,'#8c7b6e'],[1,'#454b54']]),'#343c46',3);
  path(c,[[-.82*r,-.5*r],[-.18*r,-.97*r],[.65*r,-.72*r],[.14*r,-.13*r]],'#e2bf9670');
  path(c,[[-.3*r,.94*r],[.14*r,-.13*r],[r,.12*r],[.53*r,.84*r]],'#333e4a66');
  line(c,-r*.35,-r*.45,r*.14,-r*.13,'#ffd6a482',2);line(c,r*.14,-r*.13,-r*.07,r*.43,'#403b3b',2);c.restore();
}
function excavator(c,e,time){
  c.save();c.translate(e.x,e.y);if(e.hit>0)c.globalAlpha=.65;
  const steel=grad(c,-240,-310,270,120,[[0,'#899da7'],[.22,'#3e5364'],[.65,'#263747'],[1,'#172838']]);
  const gold=grad(c,-150,-200,120,90,[[0,'#efd084'],[.5,'#b68d45'],[1,'#6e5635']]);
  const charge=Math.max(0,Math.min(1,1-((e.rockWindupUntil||0)-time)/1.05)),winding=(e.rockWindupUntil||0)>time;
  oval(c,10,132,320,22,'#19344755');
  // Two enormous crawler assemblies, with exposed rollers and steel tread plates.
  for(const [x,y,w] of [[-245,57,330],[40,70,265]]){
    box(c,x,y,w,76,32,'#172936','#83938d');
    for(let i=0;i<Math.floor(w/35);i++){const px=x+23+i*34;oval(c,px,y+39,24,26,'#536572');oval(c,px,y+39,11,13,'#b3b7a0');line(c,px-9,y+6,px+14,y+6,'#70818a',5);line(c,px-9,y+70,px+14,y+70,'#526671',5);}
  }
  box(c,-200,-35,480,108,15,steel,'#182d3d');box(c,-167,-92,277,71,7,gold,'#283c45');
  for(let i=0;i<9;i++){const x=-155+i*47;path(c,[[x,7],[x+21,7],[x-4,36],[x-25,36]],'#efc65c');}
  for(let i=0;i<6;i++)box(c,120+i*23,-14,12,48,3,'#172d3c','#7a8c91');
  // Industrial tower, upper control room and angry amber observation windows.
  box(c,35,-350,128,287,7,steel,'#213747');box(c,20,-373,164,72,9,gold,'#213747');
  path(c,[[35,-360],[169,-360],[155,-319],[47,-319]],'#172c3d','#b0bdac',3);
  line(c,48,-348,87,-337,'#ff9d58',7);line(c,113,-337,151,-348,'#ff9d58',7);
  for(let i=0;i<6;i++){line(c,57,-289+i*33,140,-289+i*33,'#83928c',3);line(c,65,-287+i*33,65,-266+i*33,'#d8b86b',3);}
  line(c,100,-374,100,-485,'#667c85',11);line(c,100,-485,-338,-280,'#b1bcb0',3);line(c,100,-485,279,-118,'#b1bcb0',3);
  box(c,225,-151,74,121,9,steel,'#1c3345');for(let i=0;i<4;i++)line(c,236,-132+i*23,286,-132+i*23,'#8a9994',3);
  // A long lattice conveyor boom connects the wheel to the main machine.
  const ax=-330,ay=-252,bx=102,by=-78,dx=bx-ax,dy=by-ay,len=Math.hypot(dx,dy),nx=-dy/len,ny=dx/len;
  line(c,ax,ay,bx,by,'#172b3a',71);line(c,ax,ay,bx,by,gold,55);line(c,ax,ay,bx,by,'#263845',23);
  for(let i=0;i<9;i++){const t=i/9,u=(i+1)/9;line(c,ax+dx*t+nx*25,ay+dy*t+ny*25,ax+dx*u-nx*25,ay+dy*u-ny*25,'#92a39e',5);}
  line(c,ax+nx*34,ay+ny*34,bx+nx*34,by+ny*34,'#d8c189',5);
  // The wheel stays intact as armor breaks: its motion remains readable through the whole fight.
  c.save();c.translate(-330,-280);c.rotate(time*.9);
  oval(c,0,0,172,172,'#172c3c');c.beginPath();c.arc(0,0,152,0,TAU);c.strokeStyle='#a2a49a';c.lineWidth=17;c.stroke();
  for(let i=0;i<12;i++){
    const a=i*TAU/12;c.save();c.rotate(a);line(c,35,0,148,0,'#71868c',12);line(c,44,-6,135,-6,'#bfba9b',3);
    path(c,[[148,-21],[189,-29],[204,-5],[184,27],[155,24]],gold,'#213645',5);path(c,[[164,-10],[189,-16],[190,5],[174,16]],'#263b49');
    if(i%3===0)miningRock(c,175,0,23,-a+time*.5);c.restore();
  }
  oval(c,0,0,49,49,steel);oval(c,0,0,30,30,'#c2a362');oval(c,0,0,15,15,winding?'#fff5c2':'#ffbf74');
  c.restore();
  if(winding){
    const a=-.8-charge*1.2,x=-330+Math.cos(a)*174,y=-280+Math.sin(a)*174;
    glow(c,x,y,69,'#ffb55b66');miningRock(c,x,y,35,-time);c.beginPath();c.arc(-330,-280,216,-2.1,-.8);c.strokeStyle='#ffd68e';c.lineWidth=5;c.stroke();
  }
  if(e.hp<e.maxHp*.65){path(c,[[-170,-72],[-58,-75],[-88,-18],[-166,-26]],'#152a3b');lightning(c,-155,-52,-73,-30,time,'#ffb86d',3);}
  if(e.hp<e.maxHp*.3){lightning(c,45,-250,142,-180,time,'#b9ffff',4);glow(c,100,-205,70,'#ffb35a33');}
  c.restore();
}
function stormwing(c,e,time){
  c.save();c.translate(e.x,e.y);if(e.hit>0)c.globalAlpha=.65;
  const wing=Math.sin(time*3)*28,metal=grad(c,-140,-80,140,80,[[0,'#d7d6e9'],[.5,'#7d8dae'],[1,'#344a70']]);
  for(const f of [-1,1]){
    path(c,[[f*23,-20],[f*112,-93-wing],[f*252,-63-wing],[f*187,26],[f*125,0],[f*88,57],[f*42,30]],metal,'#233b62',4);
    for(let i=0;i<3;i++)line(c,f*(60+i*48),-15-i*12,f*(100+i*46),-50-wing,'#a4c9d1',4);
    if(e.hp>e.maxHp*3/8){glow(c,f*128,-10,35,'#ae98ff66');oval(c,f*128,-10,14,14,'#34415d');oval(c,f*128,-10,8,8,'#d9b8ff');}
    else lightning(c,f*50,-5,f*138,-20,time,'#c2faff',3);
    path(c,[[f*17,35],[f*38,96],[f*63,111],[f*28,115],[f*3,59]],'#788da6','#253d5c',2);
  }
  path(c,[[-45,-39],[0,-64],[45,-39],[30,35],[0,66],[-30,35]],metal,'#21385c',4);
  path(c,[[-31,-48],[-25,-98],[0,-117],[25,-98],[31,-48],[0,-20]],metal,'#25365a',3);
  path(c,[[-25,-77],[-5,-69],[0,-61],[5,-69],[25,-77],[17,-50],[0,-38],[-17,-50]],'#223959');
  line(c,-21,-76,-6,-71,'#ffa5cf',5);line(c,7,-71,22,-76,'#ffa5cf',5);
  path(c,[[0,-112],[-18,-132],[0,-123],[18,-132]],'#d4c4ea');
  glow(c,0,3,45,'#c4a0ff66');oval(c,0,3,23,27,'#3a4265');oval(c,0,3,14,17,'#c8b4ff');oval(c,-3,-1,6,8,'#fff0ff');
  path(c,[[0,59],[20,108],[0,146],[-15,100]],'#91a6c3','#24385b',3);c.restore();
}
// Static, recognizable world postcards. Drawn locally; no downloaded image assets.
export function worldPicture(canvas,index){
  const c=canvas.getContext('2d');c.save();c.scale(canvas.width/720,canvas.height/240);
  const city=index===0,plains=index===1;
  c.fillStyle=grad(c,0,0,0,240,[[0,city?'#547eab':plains?'#4ca6cf':'#555786'],[1,city?'#ffcf9c':plains?'#d6edb2':'#d8c7ea']]);c.fillRect(0,0,720,240);
  glow(c,445,65,180,'#fff0b650');oval(c,445,65,29,29,city?'#fff0b5':plains?'#fff5cf':'#f3ebff');
  for(const [x,y] of [[60,45],[255,28],[570,32]]){oval(c,x,y,58,8,'#ffffff55');oval(c,x+20,y-6,27,11,'#ffffff55');}
  if(city){
    for(let i=0;i<12;i++){
      const x=i*65-15,h=45+(i*31)%75;c.fillStyle='#6c8d9b';c.fillRect(x,200-h,55,h);
    }
    for(let i=0;i<7;i++){
      const x=i*112-20,h=[107,140,85,120,72,100,95][i],y=225-h;
      box(c,x,y,89,h,2,grad(c,x,y,x+89,225,[[0,['#a87c75','#8fa6a5','#b4a28a'][i%3]],[1,'#566b80']]));
      c.fillStyle='#ffe2a9';c.fillRect(x-5,y-6,99,7);
      for(let row=y+15;row<218;row+=26)for(let col=x+13;col<x+80;col+=24){box(c,col,row,12,16,1,'#304f6a');c.fillStyle='#f1d49b';c.fillRect(col+2,row+2,8,6);}
      if(i===1){line(c,x+44,y-6,x+44,y-42,'#d6d4bf',3);path(c,[[x+32,y-6],[x+44,y-27],[x+56,y-6]],'#d0c9b4');}
    }
    c.fillStyle='#3e556c';c.fillRect(0,225,720,15);for(let x=15;x<720;x+=100)c.fillRect(x,232,45,3);
    tree(c,365,230,.52);
  }else if(plains){
    for(const [x,y,rx,ry,col] of [[80,219,240,100,'#84bc8a'],[500,225,340,130,'#75b18a'],[100,245,300,82,'#66a26d']])oval(c,x,y,rx,ry,col);
    oval(c,360,217,350,61,'#b6e0c4');oval(c,370,222,325,54,grad(c,0,170,0,270,[[0,'#9ae4db'],[1,'#448eb0']]));
    for(let i=0;i<5;i++)line(c,170+i*24,193+i*10,420+i*28,193+i*10,'#e3fff07a',2);
    path(c,[[0,205],[135,198],[250,240],[0,240]],'#6da65e');tree(c,125,220,.7);
    box(c,285,99,26,71,3,'#f3dfb6');path(c,[[278,102],[298,73],[318,102]],'#c8836d');
    for(let i=0;i<4;i++){const a=i*Math.PI/2+.3;line(c,298,105,298+Math.cos(a)*40,105+Math.sin(a)*40,'#fff5dc',7);}oval(c,298,105,6,6,'#6d7c70');
    for(let i=0;i<16;i++){const x=12+i*12,y=218+(i%3)*7;line(c,x,y,x,y-8,'#4d7d4f',2);oval(c,x,y-9,3,3,['#fff4ad','#ffe0ea','#ffffff'][i%3]);}
  }else{
    for(const [x,y,w,col] of [[100,37,160,'#8d98bc'],[365,12,185,'#7586aa'],[560,50,160,'#667d9e']]){
      path(c,[[x-w,240],[x,y],[x+w,240]],col);path(c,[[x-w*.24,y+49],[x,y],[x+w*.3,y+62],[x+6,y+43],[x-12,y+51]],'#f3f0f5');
    }
    path(c,[[0,225],[110,197],[260,226],[380,199],[530,220],[720,201],[720,240],[0,240]],'#d3dfdf');
    for(const [x,s] of [[28,.75],[140,.52],[340,.62],[685,.7]])pine(c,x,239,s);
    for(let i=0;i<24;i++)oval(c,(i*127)%720,12+(i*59)%200,1.6,1.6,'#ffffffaa');
  }
  // Matching boss silhouettes help a non-reader recognize each adventure.
  c.save();c.translate(plains?584:575,city?146:plains?191:129);const scale=city?.4:plains?.27:.4;c.scale(scale,scale);
  robot(c,{x:0,y:0,type:city?'titan':plains?'excavator':'wyvern',hp:24,maxHp:24,phase:0,hit:0},.2);c.restore();
  glow(c,220,108,72,'#b4ffff33');hero(c,220,111,69,0,{facing:1,flying:true,portrait:true});
  c.restore();
}
export class Renderer {
  constructor(canvas){
    this.canvas=canvas;this.c=canvas.getContext('2d',{alpha:false});this.width=1;this.height=1;this.camera={x:370,y:480};this.scale=1;this.reduced=false;
    this.backdrop=null;this.backdropLevel=null;this.cityCache=new Map();this.resize();
  }
  resize(){
    const r=this.canvas.getBoundingClientRect(),dpr=Math.min(globalThis.devicePixelRatio||1,2);
    if(r.width<1||r.height<1)return;
    this.width=r.width;this.height=r.height;this.scale=Math.min(r.width/620,r.height/730);this.scale=Math.max(.48,Math.min(this.scale,1.3));
    this.baseScale=this.scale;
    const w=Math.round(r.width*dpr),h=Math.round(r.height*dpr);
    if(this.canvas.width!==w||this.canvas.height!==h){this.canvas.width=w;this.canvas.height=h;this.backdrop=null;}
  }
  bounds(){const s=this.scale;return {left:this.camera.x-this.width/s/2,right:this.camera.x+this.width/s/2,top:this.camera.y-this.height/s/2,bottom:this.camera.y+this.height/s/2};}
  screenToWorld(x,y){return{x:this.camera.x+(x-this.width/2)/this.scale,y:this.camera.y+(y-this.height/2)/this.scale};}
  worldToScreen(x,y){return{x:(x-this.camera.x)*this.scale+this.width/2,y:(y-this.camera.y)*this.scale+this.height/2};}
  follow(g,dt,snap=false){
    const mining=g.enemies.find(e=>e.type==='excavator'&&e.hp>0&&Math.abs(e.x-g.player.x)<1150);
    this.scale=this.baseScale*(mining?.72:1);
    const b=this.height/this.scale/2,w=this.width/this.scale/2,p=g.player;
    const tx=clamp(p.x+(mining?Math.sign(mining.x-p.x)*190:p.facing*65),w,WORLD.width-w),ty=clamp(p.y-80,Math.min(b,480),Math.max(480,WORLD.height-b));
    const k=snap?1:1-Math.exp(-dt*5);
    this.camera.x+=(tx-this.camera.x)*k;this.camera.y+=(ty-this.camera.y)*k;
  }
  sky(g){
    const c=this.c,w=this.width,h=this.height,biome=g.level.biome;
    if(!this.backdrop||this.backdropLevel!==biome){
      const layer=document.createElement('canvas');layer.width=this.canvas.width;layer.height=this.canvas.height;const b=layer.getContext('2d');b.scale(layer.width/w,layer.height/h);
      const colors=biome==='city'?['#4d7297','#9db4bd','#f5d1ad','#edb68e']:biome==='plains'?['#4f92c6','#9ed8e6','#daecd0','#f4e6af']:['#3b426b','#8589b3','#c3bad1','#ecd2c6'];
      b.fillStyle=grad(b,0,0,0,h,[[0,colors[0]],[.32,colors[1]],[.7,colors[2]],[1,colors[3]]]);b.fillRect(0,0,w,h);
      glow(b,w*.75,h*.35,w*.7,biome==='mountains'?'#d5c5ff38':'#fff0c168');oval(b,w*.76,h*.34,biome==='mountains'?30:39,biome==='mountains'?30:39,biome==='mountains'?'#efedff':'#fff2cf');this.backdrop=layer;this.backdropLevel=biome;
    }
    c.drawImage(this.backdrop,0,0,w,h);
    const xOffset=this.camera.x*.06;c.globalAlpha=.25;
    for(let i=0;i<8;i++){const x=((i*237-xOffset)%(w+260)+w+260)%(w+260)-100,y=60+(i%3)*67;oval(c,x,y,90,12,'#fff4e2');oval(c,x+30,y-8,41,14,'#fff4e2');}c.globalAlpha=1;
    const horizon=this.worldToScreen(0,850).y;
    if(biome==='city')for(let layer=0;layer<3;layer++){
      const spacing=70+layer*23,par=.12+layer*.13,base=horizon-25-layer*12;
      for(let i=-3;i<Math.ceil(w/spacing)+4;i++){
        const idx=i+Math.floor(this.camera.x*par/spacing),x=i*spacing-(this.camera.x*par%spacing),bh=(110+((idx*71+layer*49)%190+190)%190)*(this.scale*.65+.35),bw=spacing-5;
        c.fillStyle=['#7b8e9d','#69818d','#526c7b'][layer];c.fillRect(x,base-bh,bw,bh);
        if(idx%5===0){c.fillRect(x+bw*.3,base-bh-18,bw*.4,18);line(c,x+bw/2,base-bh-18,x+bw/2,base-bh-50,c.fillStyle,2);}
        if(layer>0){c.fillStyle=layer===1?'#c0c4b055':'#e8c99966';for(let row=0;row<bh/23-1;row++)for(let col=0;col<3;col++)if((row+col+idx)%4)c.fillRect(x+12+col*19,base-bh+15+row*23,6,10);}
      }
    }else for(let layer=0;layer<3;layer++){
      const step=biome==='mountains'?280:460,par=.1+layer*.12,base=horizon+layer*25;
      for(let i=-2;i<Math.ceil(w/step)+3;i++){
        const idx=i+Math.floor(this.camera.x*par/step),x=i*step-(this.camera.x*par%step),peak=base-(biome==='mountains'?220+((idx*83+layer*43)%150+150)%150:100+((idx*53+layer*29)%110+110)%110);
        const color=biome==='mountains'?['#9a9fbc','#7785a7','#566d91'][layer]:['#acc89c','#82b68b','#5c9a80'][layer];
        c.beginPath();c.moveTo(x-step*.25,base);
        if(biome==='mountains'){c.lineTo(x+step*.2,peak+40);c.lineTo(x+step*.4,peak);c.lineTo(x+step*.61,peak+85);c.lineTo(x+step*.85,base);}
        else{c.bezierCurveTo(x,peak,x+step*.35,peak,x+step*.8,base);}
        c.lineTo(x+step,base+200);c.lineTo(x-step*.25,base+200);c.closePath();c.fillStyle=color;c.fill();
        if(biome==='mountains')path(c,[[x+step*.2,peak+40],[x+step*.4,peak],[x+step*.55,peak+65],[x+step*.4,peak+47],[x+step*.32,peak+65]],'#e7e8edaa');
      }
    }
  }
  architecture(g){
    if(g.level.biome!=='city'){this.countryside(g);this.landmarks(g);return;}
    const c=this.c,b=this.bounds(),left=Math.max(0,b.left-100),right=Math.min(WORLD.width,b.right+100);
    c.fillStyle=grad(c,0,850,0,1000,[[0,'#747e80'],[.45,'#465d6b'],[1,'#253b50']]);c.fillRect(left,850,right-left,200);
    c.fillStyle='#c4b39a';c.fillRect(left,836,right-left,14);c.fillStyle='#f8d7ac';c.fillRect(left,836,right-left,3);
    for(let x=Math.floor(left/140)*140;x<right;x+=140){c.fillStyle='#e8d7ae88';c.fillRect(x,915,65,5);line(c,x,850,x+30,900,'#efc49114',7);}
    for(let i=0;i<g.roofs.length;i++){
      const r=g.roofs[i];if(r.x+r.w<left||r.x>right)continue;
      c.fillStyle=grad(c,r.x,r.y,r.x+r.w,850,[[0,['#bda388','#a87d74','#8a9e9d'][i%3]],[1,'#686a72']]);c.fillRect(r.x,r.y,r.w,850-r.y);c.fillStyle='#4d5a6e';c.fillRect(r.x+r.w-14,r.y+10,14,840-r.y);
      for(let row=r.y+35;row<815;row+=65)for(let col=r.x+22;col<r.x+r.w-26;col+=45){box(c,col-3,row-4,29,43,2,'#d6b49a');box(c,col,row,22,34,1,'#3e596b');c.fillStyle=g.run.checkpoint>i?'#eacb8a':'#819ba1';c.fillRect(col+3,row+3,16,12);line(c,col+11,row,col+11,row+34,'#ad9e8c',2);}
      c.fillStyle='#4a596d';c.fillRect(r.x-8,r.y-11,r.w+16,13);c.fillStyle='#e7c6a3';c.fillRect(r.x-12,r.y-17,r.w+24,7);line(c,r.x+10,r.y-21,r.x+r.w-10,r.y-21,'#91f9e1',3);
      for(let px=r.x+14;px<r.x+r.w;px+=42)line(c,px,r.y-18,px,r.y-34,'#637579',2);line(c,r.x+14,r.y-34,r.x+r.w-15,r.y-34,'#687d84',2);
      box(c,r.x+40,r.y-50,48,30,3,'#5b7580');for(let k=0;k<4;k++)line(c,r.x+48,r.y-43+k*5,r.x+79,r.y-43+k*5,'#94a6a3',2);
      path(c,[[r.x+r.w*.7-9,r.y-29],[r.x+r.w*.7,r.y-23],[r.x+r.w*.7+9,r.y-29]],null,'#c5fff3',2);
      if(i%3===1){box(c,r.x+15,777,r.w-35,40,4,'#274e60');label(c,['SUNBEAM','SKY CAFE','FLOWER SHOP'][Math.floor(i/3)%3],r.x+r.w/2,802,12,'#ffe8b4');}
    }
    for(let x=Math.floor(left/390)*390+310;x<right;x+=390){tree(c,x,838,.85);line(c,x+50,836,x+50,676,'#536275',6);line(c,x+50,681,x+82,681,'#536275',5);box(c,x+70,674,26,9,4,'#ffe6aa');glow(c,x+84,692,60,'#ffd68c20');}
    if(right>WORLD.width-800){c.save();c.translate(WORLD.width-9600,0);line(c,8840,850,8840,545,'#5b7280',22);line(c,9520,850,9520,545,'#5b7280',22);c.beginPath();c.moveTo(8840,558);c.quadraticCurveTo(9170,735,9520,558);c.strokeStyle='#829297';c.lineWidth=9;c.stroke();for(let x=8880;x<9520;x+=65){const u=(x-8840)/680;line(c,x,558+4*177*u*(1-u),x,835,'#84999b',2);}c.restore();}
    this.landmarks(g);
  }
  countryside(g){
    const c=this.c,b=this.bounds(),mountain=g.level.biome==='mountains',left=Math.max(0,b.left-140),right=Math.min(WORLD.width,b.right+140),t=g.time;
    c.fillStyle=grad(c,0,850,0,1000,[[0,mountain?'#67748d':'#80ad69'],[1,mountain?'#34445f':'#3e745a']]);c.fillRect(left,836,right-left,180);line(c,left,836,right,836,mountain?'#dce3e4':'#d0e698',5);
    if(!mountain){
      for(let x=Math.floor(left/2200)*2200+700;x<right+700;x+=2200){
        if(x+650<left)continue;oval(c,x+270,838,510,100,'#b4dcca');oval(c,x+270,848,480,83,grad(c,0,770,0,930,[[0,'#96d6d6'],[.5,'#4d9fba'],[1,'#2b6b96']]));
        for(let i=0;i<14;i++){const y=790+i*9,offset=Math.sin(t*1.4+i)*12;line(c,x-80+i*15+offset,y,x+280+i*10+offset,y,'#d7f8e649',2);}
        for(let i=0;i<5;i++){line(c,x+70+i*75,850,x+70+i*75,775,'#866f56',7);}line(c,x+45,805,x+410,805,'#dbb884',15);line(c,x+45,780,x+410,780,'#d7c99e',3);
      }
      for(let x=Math.floor(left/180)*180+30;x<right;x+=180){tree(c,x,838,.7);for(let i=0;i<8;i++){const px=x+80+i*7;line(c,px,840,px-2,827,'#568951',2);oval(c,px-2,825,3,3,['#ffe795','#ffe9eb','#f2f9c7'][i%3]);}}
    }else{
      for(let x=Math.floor(left/230)*230;x<right;x+=230){pine(c,x+60,842,.8);path(c,[[x,839],[x+20,812],[x+58,816],[x+76,839]],'#596c84');line(c,x+14,819,x+55,821,'#e4e6df',4);}
      for(let i=0;i<18;i++){const x=left+((i*137+t*10)%Math.max(1,right-left)),y=120+((i*79+t*23)%650);oval(c,x,y,1.8,1.8,'#f0f2ff99');}
    }
    for(const r of g.roofs){
      if(r.x+r.w<left||r.x>right)continue;const y=roofSurface(r);
      path(c,[[r.x-10,y],[r.x+r.w+10,y],[r.x+r.w-16,850],[r.x+15,850]],grad(c,r.x,y,r.x+r.w,850,[[0,mountain?'#8090a2':'#a29c74'],[1,mountain?'#3e526e':'#5c7555']]));
      for(let i=0;i<4;i++)line(c,r.x+18,y+38+i*65,r.x+r.w-20,y+18+i*65,mountain?'#b3bcc05c':'#bdba8f55',3);
      box(c,r.x-12,y-5,r.w+24,10,4,mountain?'#e8edf0':'#b0d785');line(c,r.x+12,y-8,r.x+r.w-12,y-8,'#aaf8de',2);
      if(mountain){pine(c,r.x+r.w-40,y,.6);path(c,[[r.x+26,y],[r.x+38,y-32],[r.x+53,y]],'#c4b9ef');}
      else{for(let i=0;i<7;i++)oval(c,r.x+25+i*18,y-10,4,4,['#fff1af','#e4b9c8','#d8edd0'][i%3]);}
    }
    if(!mountain&&right>WORLD.width-1000){c.save();c.translate(WORLD.width-9600,0);c.fillStyle='#b7a486';c.fillRect(8730,832,870,32);for(let x=8750;x<9600;x+=70)line(c,x,848,x+25,848,'#786d5d',8);c.restore();}
  }
  landmarks(g){
    const c=this.c,b=this.bounds(),t=g.time;
    for(const site of g.sites.filter(s=>s.restore)){
      const x=site.restoreX,y=site.restoreY;if(x<b.left-220||x>b.right+220)continue;
      const lit=g.run.restored.includes(site.district);
      if(g.level.biome==='city'&&site.district%6===0){
        oval(c,x,832,140,12,'#263b4d55');box(c,x-120,798,240,32,10,'#baac9b');oval(c,x,800,119,25,'#ddd2b9');oval(c,x,797,104,18,lit?'#6ca7b4':'#758386');box(c,x-19,732,38,67,5,'#d2c5ac');oval(c,x,733,56,12,'#eddbb9');
        if(lit)for(let i=-3;i<=3;i++){c.beginPath();c.moveTo(x,724);c.quadraticCurveTo(x+i*19,645-Math.sin(t*2+i)*8,x+i*30,791);c.strokeStyle='#a9efea';c.lineWidth=3;c.stroke();}
      }else{
        line(c,x,836,x,y+35,g.level.biome==='mountains'?'#9c9cb7':'#657a71',9);
        if(g.level.biome==='plains'&&site.district%6===2){box(c,x-28,y-12,56,110,4,'#d7c49b');const a=lit?t*.7:0;for(let i=0;i<4;i++){const q=a+i*Math.PI/2;line(c,x,y,x+Math.cos(q)*78,y+Math.sin(q)*78,'#f6e5b5',12);}}
        else{box(c,x-30,y+18,60,22,5,'#758692');path(c,[[x,y-32],[x+25,y],[x,y+28],[x-25,y]],lit?'#b2ffe1':'#687f93',lit?'#e5ffed':'#96a8b2',2);}
        if(lit){glow(c,x,y,100,g.level.biome==='mountains'?'#c6b2ff55':'#a6ffdc55');path(c,[[x-10,y-20],[x-115,y-200],[x+115,y-200],[x+10,y-20]],grad(c,0,y-200,0,y,[[0,'#baffdf00'],[1,'#baffdf33']]));}
      }
      label(c,site.name.toUpperCase(),x,877,12,'#fff0cb');
      if(lit){label(c,'✦',x+50,y,22,'#ffe5a0');}
    }
  }
  draw(g,dt=0){
    this.resize();this.follow(g,dt);const c=this.c,w=this.width,h=this.height,dpr=this.canvas.width/w;
    c.setTransform(dpr,0,0,this.canvas.height/h,0,0);this.sky(g);
    c.save();c.translate(w/2,h/2);
    if(!this.reduced&&g.shake>0)c.translate(Math.sin(g.time*90)*g.shake*.35,Math.cos(g.time*73)*g.shake*.2);
    c.scale(this.scale,this.scale);c.translate(-this.camera.x,-this.camera.y);
    this.architecture(g);
    for(const r of g.rings)if(!r.taken){
      glow(c,r.x,r.y,57,'#ffd47130');c.beginPath();c.ellipse(r.x,r.y,23,37,0,0,TAU);c.strokeStyle='#ffe5a1';c.lineWidth=6;c.stroke();
      c.strokeStyle='#fff9db';c.lineWidth=1.5;c.stroke();label(c,'✦',r.x,r.y+6,20,'#fff2b5');
    }
    // Flight target reads as a destination, never as a second character.
    if(g.target){const a=g.target;c.setLineDash([4,7]);line(c,g.player.x,g.player.y,a.x,a.y,'#d4f9f344',2);c.setLineDash([]);c.beginPath();c.arc(a.x,a.y,16+Math.sin(g.time*5)*3,0,TAU);c.strokeStyle='#e0fff2aa';c.lineWidth=2;c.stroke();}
    const aim=g.enemies.find(e=>e.id===g.aim);
    for(const e of g.enemies){
      if(e.hp<=0||!g.isVisible(e,this.bounds()))continue;
      if(aim===e){c.beginPath();c.ellipse(e.x,e.y,e.radius+12,e.radius+12,0,0,TAU);c.setLineDash([8,9]);c.strokeStyle='#ffe4ad99';c.lineWidth=2;c.stroke();c.setLineDash([]);}
      robot(c,e,g.time);
      if(e.boss){
        label(c,e.name.toUpperCase(),e.x,e.y-228,17,'#fff0d0');
        const bars=armorSegments(e);bars.forEach((fill,i)=>{const x=e.x-bars.length*16+i*32;box(c,x,e.y-212,24,6,3,'#617d89');if(fill>0)box(c,x,e.y-212,24*fill,6,3,'#ffcc85');});
      }
    }
    const p=g.player;
    oval(c,p.x,WORLD.ground-1,23+Math.max(0,WORLD.ground-p.y)*.014,5,'#19374744');
    for(let i=1;i<p.trail.length;i++){
      const a=p.trail[i-1],b=p.trail[i];line(c,a.x,a.y+12,b.x,b.y+12,`rgba(139,250,255,${(1-b.age/.3)*.35})`,(1-b.age/.3)*20+1);
    }
    hero(c,p.x,p.y,76,g.time,{facing:p.facing,flying:!p.landed,speed:Math.hypot(p.vx,p.vy),vx:p.vx,vy:p.vy,flare:p.flare});
    for(const q of g.projectiles){
      if(q.cleared)continue;
      const b=this.bounds();if(q.x<b.left-80||q.x>b.right+80||q.y<b.top-80||q.y>b.bottom+80)continue;
      for(let i=1;i<q.trail.length;i++){const a=q.trail[i-1],t=q.trail[i];line(c,a.x,a.y,t.x,t.y,q.type==='missile'?'#ffd28c55':'#ffe5ab44',2+i*.5);}
      if(q.type==='rock'){
        for(let i=0;i<3;i++)oval(c,q.x-q.vx*(.07+i*.06),q.y-q.vy*(.07+i*.06),q.radius*(.6-i*.12),q.radius*(.5-i*.1),'#d3b39022');
        miningRock(c,q.x,q.y,q.radius,q.spin+g.time*2);
      }else if(q.type==='missile'){
        glow(c,q.x,q.y,36,'#ffd39344');c.save();c.translate(q.x,q.y);c.rotate(Math.atan2(q.vy,q.vx));
        path(c,[[-16,-6],[-41-Math.sin(g.time*40)*7,0],[-16,6]],'#ffbd65');path(c,[[-17,-3],[-33,0],[-17,3]],'#fff4b1');
        path(c,[[-7,-6],[-18,-16],[7,-6]],'#8db498','#3a5564',2);path(c,[[-7,6],[-18,16],[7,6]],'#8db498','#3a5564',2);
        box(c,-18,-7,32,14,5,'#dce5ca','#3a5564');path(c,[[10,-7],[26,0],[10,7]],'#95dd83','#3a5564',2);line(c,-6,-4,5,-4,'#ffffff',2);c.restore();
      }else{
        glow(c,q.x,q.y,33,'#ffc87866');oval(c,q.x,q.y,14,14,'#54674f');oval(c,q.x,q.y,11,11,'#ffc56d');oval(c,q.x-2,q.y-2,6,6,'#fff5c5');
      }
    }
    for(const f of g.effects){
      if(f.cancelled)continue;
      const k=1-f.age/f.life;c.save();c.globalAlpha=k;
      if(f.type==='rock-windup'&&!f.fired){
        const owner=g.enemies.find(e=>e.id===f.owner&&e.hp>0);
        if(owner){const origin=g.enemyMuzzle(owner);c.setLineDash([10,14]);c.beginPath();c.moveTo(origin.x,origin.y);c.quadraticCurveTo((origin.x+f.tx)/2,Math.min(origin.y,f.ty)-105,f.tx,f.ty);c.strokeStyle='#ffd79a66';c.lineWidth=3;c.stroke();c.setLineDash([]);c.beginPath();c.arc(f.tx,f.ty,48+Math.sin(g.time*8)*5,0,TAU);c.strokeStyle='#ffd59b99';c.lineWidth=3;c.stroke();}
      }
      if(f.type==='zap'){lightning(c,f.x,f.y,f.tx,f.ty,g.time,'#4edcff',9);lightning(c,f.x,f.y,f.tx,f.ty,g.time,'#e1ffff',3);}
      if(f.type==='laser'){
        const eye=eyePosition(p),tx=eye.x+Math.cos(f.angle)*WEAPONS.laserRange,ty=eye.y+Math.sin(f.angle)*WEAPONS.laserRange;
        // A short pink afterglow makes the gentle sweep readable without hiding targets.
        for(let i=1;i<=3;i++){const a=f.angle-f.sweep*.035*i;line(c,eye.x,eye.y,eye.x+Math.cos(a)*WEAPONS.laserRange,eye.y+Math.sin(a)*WEAPONS.laserRange,'#ff91bc17',16-i*3);}
        line(c,eye.x,eye.y-2,tx,ty-2,'#fa719b33',32);line(c,eye.x,eye.y-2,tx,ty-2,'#ff7db0',9);line(c,eye.x,eye.y+2,tx,ty+2,'#ffebf5',3);
        glow(c,eye.x,eye.y,50,'#ffa7cb88');
      }
      if(f.type==='chain')for(let i=0;i<f.fired;i++){
        const a=i?f.nodes[i-1]:{x:f.x,y:f.y},b=f.nodes[i],age=f.age-i*.075,strength=Math.max(0,1-age/.4);
        if(strength<=0)continue;c.save();c.globalAlpha*=strength;
        lightning(c,a.x,a.y,b.x,b.y,g.time+i*.4,'#33bfff',12);lightning(c,a.x,a.y,b.x,b.y,g.time+i*.4,'#b8ffff',4);lightning(c,a.x,a.y,b.x,b.y,g.time+i*.4,'#ffffff',1.5);
        glow(c,b.x,b.y,45,'#97ffff77');c.beginPath();c.arc(b.x,b.y,12+age*60,0,TAU);c.strokeStyle='#c6ffff';c.lineWidth=2;c.stroke();c.restore();
      }
      if(f.type==='sphere'){
        const r=Math.min(1,f.age/.55)*f.radius;
        const sphere=c.createRadialGradient(f.x-r*.23,f.y-r*.3,r*.05,f.x,f.y,Math.max(1,r));
        sphere.addColorStop(0,'#d1ffff08');sphere.addColorStop(.78,'#77e8ff14');sphere.addColorStop(.94,'#79eaff44');sphere.addColorStop(1,'#e3ffffbb');
        oval(c,f.x,f.y,r,r,sphere);c.beginPath();c.arc(f.x,f.y,r,0,TAU);c.strokeStyle='#e8ffff';c.lineWidth=3;c.stroke();
        for(let i=0;i<5;i++){const a=i*1.256+g.time;lightning(c,f.x+Math.cos(a)*r*.5,f.y+Math.sin(a)*r*.5,f.x+Math.cos(a)*r,f.y+Math.sin(a)*r,g.time,'#c5ffff',1.5);}
      }
      if(f.type==='intercept'){
        const color=f.kind==='laser'?'#ffb9dd':f.kind==='sphere'?'#d4ffe9':'#b3ffff',r=10+f.age*65;
        glow(c,f.x,f.y,r+12,color+'66');c.beginPath();c.arc(f.x,f.y,r,0,TAU);c.strokeStyle=color;c.lineWidth=2.5*k;c.stroke();
        for(let i=0;i<4;i++){const a=i*Math.PI/2+f.age*3;line(c,f.x+Math.cos(a)*r*.5,f.y+Math.sin(a)*r*.5,f.x+Math.cos(a)*r,f.y+Math.sin(a)*r,'#ffffff',2*k);}
      }
      if(f.type==='burst'){
        const r=(f.big?140:60)*(1-k);glow(c,f.x,f.y,Math.max(1,r),f.color+'88');
        c.beginPath();c.arc(f.x,f.y,r,0,TAU);c.strokeStyle=f.color;c.lineWidth=3*k;c.stroke();
        for(let i=0;i<6;i++){const a=i*TAU/6;line(c,f.x+Math.cos(a)*r*.5,f.y+Math.sin(a)*r*.5,f.x+Math.cos(a)*r,f.y+Math.sin(a)*r,'#fff2c3',3*k);}
      }
      if(f.type==='enemy-beam'){
        const angle=Math.atan2(f.ty-f.y,f.tx-f.x),tx=f.x+Math.cos(angle)*1400,ty=f.y+Math.sin(angle)*1400;
        if(f.age<f.charge){
          c.globalAlpha=.8;c.setLineDash([10,12]);line(c,f.x,f.y,f.tx,f.ty,'#ccffa3aa',2);c.setLineDash([]);
          c.beginPath();c.arc(f.tx,f.ty,30+Math.sin(g.time*9)*4,0,TAU);c.strokeStyle='#bdff91';c.lineWidth=2;c.stroke();glow(c,f.x,f.y,30+f.age*20,'#b1ff7955');
        }else{
          c.globalAlpha=Math.min(1,Math.max(0,(f.life-f.age)/.1));
          line(c,f.x,f.y,tx,ty,'#94ff5722',36);line(c,f.x,f.y-3,tx,ty-3,'#73ed5c',12);line(c,f.x,f.y+3,tx,ty+3,'#e9ffb7',4);glow(c,f.x,f.y,65,'#9fff7966');
        }
      }
      if(f.type==='body-hit'){
        const x=p.x+Math.cos(f.angle)*18,y=p.y+Math.sin(f.angle)*22;
        glow(c,x,y,45,'#ffd0a088');for(let i=0;i<6;i++){const a=f.angle-1+i*.4,r=12+f.age*100;line(c,x+Math.cos(a)*8,y+Math.sin(a)*8,x+Math.cos(a)*r,y+Math.sin(a)*r,'#eaffff',2);}
      }
      if(f.type==='split')for(const side of [-1,1]){
        c.save();c.translate(side*f.age*65,f.age*f.age*180);c.translate(f.x,f.y);c.rotate(side*f.age*.8);c.translate(-f.x,-f.y);
        const size=f.robot.boss?420:100;
        c.beginPath();c.rect(f.x+(side<0?-size:0),f.y-size,size,size*2.1);c.clip();robot(c,f.robot,g.time);line(c,f.x,f.y-size*.48,f.x,f.y+size*.45,'#ffe7ec',3);c.restore();
      }c.restore();
    }
    for(const s of g.particles){c.save();c.globalAlpha=1-s.age/s.life;c.translate(s.x,s.y);c.rotate(s.age*5);if(s.metal){box(c,-s.size,-s.size,s.size*2,s.size*(s.sliced?1:2),1,s.color);line(c,-s.size,-s.size,s.size,-s.size,'#f5edcc',1);}else oval(c,0,0,s.size,s.size*.5,s.color);c.restore();}
    c.restore();
    // A subtle cinematic vignette preserves bright, legible play in the center.
    const v=c.createRadialGradient(w*.5,h*.4,h*.2,w*.5,h*.5,Math.max(w,h)*.8);v.addColorStop(0,'#0a243100');v.addColorStop(1,'#122b4a50');c.fillStyle=v;c.fillRect(0,0,w,h);
  }
}
