import { WORLD, WEAPONS, armorSegments, bossShieldUp, heroLean, eyePosition, roofSurface, SITE_COUNT } from './engine.js?v=world108';
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
  if(e.type==='crab'){magmaBastion(c,e,time);return;}
  if(e.type==='dreadnought'){orbitDreadnought(c,e,time);return;}
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
  if(e.armored){
    const plate=grad(c,-35,-40,35,25,[[0,'#e3c88f'],[.4,'#8f91a0'],[1,'#344354']]);
    if(e.type==='drone'){
      path(c,[[-27,-5],[-21,-24],[0,-30],[21,-24],[27,-5],[13,-11],[-13,-11]],plate,'#283448',2);
      for(const f of [-1,1])path(c,[[f*22,-10],[f*44,-8],[f*42,11],[f*26,17]],plate,'#293b4d',2);
    }else{
      for(const f of [-1,1])path(c,[[f*14,-29],[f*37,-29],[f*45,-13],[f*29,-7]],plate,'#283448',2.5);
      path(c,[[-19,-18],[0,-24],[19,-18],[19,6],[0,21],[-19,6]],plate,'#293b4d',2);
      path(c,[[-12,-13],[0,-18],[12,-13],[10,2],[0,11],[-10,2]],'#3a465c');
      line(c,-9,-6,0,1,'#ffcd80',3);line(c,0,1,9,-6,'#ffcd80',3);
      box(c,-18,-49,36,13,4,plate,'#293b4d');
    }
    // Two distinct armor lights remain readable without text or a health bar.
    const py=e.type==='drone'?-40:-63;
    box(c,-18,py-7,36,12,5,'#142d41','#9b9e9a');
    for(let i=0;i<2;i++){
      const fill=clamp(e.hp-i,0,1),x=-13+i*15;
      box(c,x,py-3,11,5,2,'#53606a');if(fill>0)box(c,x,py-3,11*fill,5,2,'#ffd088');
    }
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
function magmaBastion(c,e,time){
  c.save();c.translate(e.x,e.y);if(e.hit>0)c.globalAlpha=.7;
  const shell=grad(c,-150,-110,170,120,[[0,'#bb795e'],[.25,'#644b54'],[.65,'#302e40'],[1,'#182b38']]);
  const edge='#e59b6a',pulse=.65+Math.sin(time*3)*.15;
  oval(c,0,127,216,15,'#100e224d');glow(c,0,50,150,'#ff793329');
  // Six broad articulated legs stay inside the engine's two lower armor lobes.
  for(const f of [-1,1])for(let i=0;i<3;i++){
    const x=f*(72+i*28),knee=f*(119+i*28),step=Math.sin(time*3+i*1.8+f)*5;
    line(c,x,34,knee,55+step,'#182b39',28);line(c,x,34,knee,55+step,'#a47667',18);
    line(c,knee,55+step,f*(143+i*27),111,'#243344',23);
    path(c,[[f*(132+i*27),96],[f*(151+i*27),100],[f*(164+i*27),119],[f*(129+i*27),119]],shell,'#1b2c3a',2);
    oval(c,knee,55+step,13,13,'#c78c68');oval(c,knee,55+step,6,6,'#ffbf72');
  }
  for(const f of [-1,1]){
    const rise=Math.sin(time*2+f)*7;
    line(c,f*77,-10,f*155,-31,'#152c3b',35);line(c,f*77,-10,f*155,-31,'#8b6261',23);
    oval(c,f*154,-31,20,20,'#e3a36d');oval(c,f*154,-31,9,9,'#493749');
    // Paired mining pincers make the crab silhouette clear from either side.
    path(c,[[f*153,-64],[f*184,-107+rise],[f*231,-109+rise],[f*254,-77],[f*204,-79],[f*188,-52]],shell,'#efaa76',3);
    path(c,[[f*165,-45],[f*197,-29],[f*247,-43],[f*232,-3],[f*190,5],[f*155,-22]],shell,'#b77d65',3);
    line(c,f*193,-91+rise,f*225,-91+rise,'#ffcf77',5);line(c,f*200,-13,f*226,-23,'#ff874a',4);
    for(let i=0;i<3;i++)path(c,[[f*(188+i*18),-77],[f*(196+i*18),-66],[f*(202+i*18),-78]],'#ffe4b3');
  }
  path(c,[[-107,-40],[-80,-85],[-31,-104],[31,-104],[80,-85],[107,-40],[95,42],[54,79],[-54,79],[-95,42]],shell,edge,4);
  path(c,[[-75,-50],[-44,-81],[44,-81],[75,-50],[56,0],[0,23],[-56,0]],'#433d51','#cc8060',3);
  for(const f of [-1,1]){
    path(c,[[f*17,-72],[f*40,-56],[f*70,-43],[f*54,-20],[f*15,-38]],'#263040','#8c6263',2);
    line(c,f*21,-55,f*53,-42,'#ffbd70',7);
    for(let i=0;i<3;i++)line(c,f*58,14+i*13,f*84,4+i*13,'#d78c60',4);
  }
  glow(c,0,27,57,`rgba(255,122,54,${pulse*.35})`);oval(c,0,27,26,30,'#2c293b','#eead70');oval(c,0,27,16,21,'#ffac58');oval(c,-3,23,7,12,'#fff0b6');
  for(let i=0;i<4;i++)box(c,-32+i*18,-102,10,18,2,'#dfb08c','#674c54');
  if(e.hp<e.maxHp*.6){lightning(c,-65,-67,-22,-27,time,'#ffc77a',3);lightning(c,56,14,78,47,time+.8,'#ffad5d',2);}
  c.restore();
}
function orbitDreadnought(c,e,time){
  c.save();c.translate(e.x,e.y);if(e.hit>0)c.globalAlpha=.72;
  const hull=grad(c,-210,-110,190,90,[[0,'#e0d7f1'],[.22,'#94a5cb'],[.55,'#4c5c87'],[1,'#243754']]);
  const dark=grad(c,0,-95,0,95,[[0,'#283952'],[1,'#101f3e']]);
  // Four luminous engine wells are separate from the solid side pods.
  for(const f of [-1,1]){
    for(const offset of [-22,25]){
      const x=f*(154+offset),length=35+Math.sin(time*9+offset)*8;
      glow(c,x,93,49,'#a997ff2b');path(c,[[x-15,76],[x-10,100+length],[x,119+length],[x+10,100+length],[x+15,76]],grad(c,0,78,0,155,[[0,'#d3d7ff9c'],[1,'#7d8fff00']]));
    }
    path(c,[[f*90,-24],[f*145,-66],[f*215,-52],[f*244,0],[f*223,64],[f*146,85],[f*99,54]],hull,'#1e2e4d',4);
    path(c,[[f*132,-15],[f*194,-29],[f*223,5],[f*197,39],[f*135,48]],dark,'#a2b8d3',2);
    for(let i=0;i<4;i++)line(c,f*(142+i*17),47,f*(140+i*17),67,'#a8b8e8',6);
    oval(c,f*155,6,30,24,'#202b4d','#bcc5ef');oval(c,f*155,6,21,16,'#9c99f2');oval(c,f*155-3,3,10,7,'#d5ffff');
  }
  path(c,[[-153,-29],[-95,-69],[0,-85],[95,-69],[153,-29],[138,39],[75,81],[0,109],[-75,81],[-138,39]],hull,'#172947',4);
  path(c,[[-103,-33],[-56,-63],[0,-72],[56,-63],[103,-33],[73,3],[0,26],[-73,3]],'#405077','#a1b3d8',2);
  // The high bridge and its twin angled windows give the mothership a face.
  path(c,[[-69,-72],[-54,-132],[-18,-158],[18,-158],[54,-132],[69,-72],[36,-46],[-36,-46]],hull,'#233456',3);
  path(c,[[-45,-122],[-8,-115],[0,-102],[8,-115],[45,-122],[35,-88],[0,-73],[-35,-88]],'#142b49','#9dbbd7',2);
  line(c,-34,-108,-11,-101,'#edb9fa',6);line(c,11,-101,34,-108,'#edb9fa',6);
  line(c,-8,-151,-8,-174,'#afc9e8',3);oval(c,-8,-177,5,5,'#cef6ff');
  path(c,[[-65,23],[0,45],[65,23],[47,71],[0,93],[-47,71]],dark,'#9da9cb',2);
  glow(c,0,43,57,'#a29bff44');oval(c,0,43,29,21,'#283258','#c7bafa');oval(c,0,43,18,12,'#d1b5ff');oval(c,-3,40,9,5,'#f1ffff');
  for(const f of [-1,1])for(let i=0;i<4;i++)oval(c,f*(46+i*18),-17+i*4,4,3,'#c7f7ff');
  if(e.hp<e.maxHp*.6){lightning(c,-95,21,-52,55,time,'#cabdff',3);path(c,[[49,-52],[81,-32],[55,-17],[39,-37]],'#25334e');}
  c.restore();
}
function bossBarrier(c,e,time){
  if(!bossShieldUp(e,time))return;
  const lava=e.type==='crab',rx=lava?282:285,ry=lava?170:204,y=e.y-(lava?4:20),color=lava?'#ffc377':'#b3c1ff';
  c.save();c.globalAlpha*=.85;oval(c,e.x,y,rx,ry,lava?'#ff9e3b09':'#aaadff0b');
  for(let i=0;i<6;i++){
    const start=i*TAU/6+.035+Math.sin(time*1.4)*.012;
    c.beginPath();c.ellipse(e.x,y,rx,ry,0,start,start+TAU/6-.09);c.strokeStyle=color;c.lineWidth=4;c.stroke();
    c.beginPath();c.ellipse(e.x,y,rx-9,ry-7,0,start+.03,start+.26);c.strokeStyle=lava?'#ff8a5488':'#86baff88';c.lineWidth=2;c.stroke();
  }
  for(const f of [-1,1]){
    const x=e.x+f*238,hy=y-22;
    path(c,[[x-18,hy-11],[x,hy-22],[x+18,hy-11],[x+18,hy+11],[x,hy+22],[x-18,hy+11]],lava?'#ffc58615':'#b5c9ff18',color,2);
  }
  c.restore();
}
function ringedPlanet(c,x,y,r){
  c.save();c.translate(x,y);c.rotate(-.28);
  c.beginPath();c.ellipse(0,0,r*1.72,r*.43,0,0,TAU);c.strokeStyle='#bbbded66';c.lineWidth=r*.15;c.stroke();
  oval(c,0,0,r,r,grad(c,-r,-r,r,r,[[0,'#e0deef'],[.35,'#aca4d2'],[.7,'#6874ac'],[1,'#344879']]));
  c.save();c.beginPath();c.arc(0,0,r,0,TAU);c.clip();
  for(let i=0;i<6;i++)line(c,-r,-r*.65+i*r*.28,r,-r*.32+i*r*.28,i%2?'#e1d1e826':'#48558c36',r*.12);c.restore();
  c.beginPath();c.ellipse(0,0,r*1.72,r*.43,0,0,Math.PI);c.strokeStyle='#d6c5edaa';c.lineWidth=r*.13;c.stroke();
  c.beginPath();c.ellipse(0,0,r*1.8,r*.48,0,0,Math.PI);c.strokeStyle='#d7ebff66';c.lineWidth=2;c.stroke();c.restore();
}
// Static, recognizable world postcards. Drawn locally; no downloaded image assets.
export function worldPicture(canvas,index){
  const c=canvas.getContext('2d');c.save();c.scale(canvas.width/720,canvas.height/240);
  const city=index===0,plains=index===1,volcano=index===3,space=index===4;
  c.fillStyle=grad(c,0,0,0,240,[[0,city?'#547eab':plains?'#4ca6cf':volcano?'#30233f':space?'#101b3b':'#555786'],[1,city?'#ffcf9c':plains?'#d6edb2':volcano?'#ef9464':space?'#54577e':'#d8c7ea']]);c.fillRect(0,0,720,240);
  if(space){for(let i=0;i<65;i++)oval(c,(i*113+21)%720,12+(i*47)%176,i%7===0?1.8:.9,i%7===0?1.8:.9,'#dbe9ffbb');ringedPlanet(c,423,69,48);}
  else{glow(c,445,65,180,volcano?'#ff9c4a33':'#fff0b650');oval(c,445,65,29,29,city?'#fff0b5':plains?'#fff5cf':volcano?'#ffcf9b':'#f3ebff');
    for(const [x,y] of [[60,45],[255,28],[570,32]]){oval(c,x,y,58,8,volcano?'#4e3b4a66':'#ffffff55');oval(c,x+20,y-6,27,11,volcano?'#4e3b4a66':'#ffffff55');}}
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
  }else if(volcano){
    for(const [x,peak,width,color] of [[100,68,175,'#7d515c'],[363,35,190,'#654451'],[670,92,180,'#493c4f']]){
      path(c,[[x-width,226],[x-36,peak],[x+28,peak-7],[x+width,226]],color);
      path(c,[[x-31,peak+2],[x+21,peak-5],[x+49,peak+59],[x+5,peak+39]],'#ed976c');line(c,x+4,peak+20,x+28,peak+78,'#ffbb75',4);
    }
    path(c,[[0,187],[140,179],[278,219],[383,188],[512,211],[720,190],[720,240],[0,240]],'#342d42');
    path(c,[[0,231],[154,209],[304,233],[415,210],[544,227],[720,206],[720,233],[549,240],[412,229],[304,247],[147,226],[0,245]],'#e87340');
    line(c,17,235,146,218,'#ffd28e',4);line(c,403,219,535,234,'#ffc778',3);
    for(const [x,h] of [[29,47],[81,72],[306,49],[354,64]]){path(c,[[x,215],[x-3,215-h],[x+10,203-h],[x+24,210-h],[x+26,219]],'#4a4359','#8e6670',2);line(c,x+9,209-h,x+15,205,'#dd8c623d',2);}
    for(let i=0;i<20;i++)oval(c,(i*91)%720,20+(i*53)%185,1.4,2.5,'#ffd39a99');
  }else if(space){
    path(c,[[0,221],[110,194],[243,221],[368,200],[542,222],[720,190],[720,240],[0,240]],'#707b9e');
    path(c,[[0,231],[145,219],[282,233],[485,217],[720,226],[720,240],[0,240]],'#414e78');
    for(const [x,y,rx] of [[85,228,38],[290,232,26],[446,222,30]]){oval(c,x,y,rx,9,'#303e64');c.beginPath();c.ellipse(x,y-2,rx,9,0,Math.PI,TAU);c.strokeStyle='#adb4ce';c.lineWidth=2;c.stroke();}
    for(const [x,h] of [[55,87],[305,65],[372,105]]){box(c,x,221-h,9,h,2,'#273f65','#879fc9');line(c,x+4,221-h,x+58,221-h,'#b6eaff',4);line(c,x+55,221-h,x+55,221-h+23,'#687ca9',4);oval(c,x+54,221-h+26,5,5,'#aef5ff');}
    box(c,96,206,137,14,5,'#293a5e','#919ed0');line(c,102,205,226,205,'#b6c7ff',3);
  }else{
    for(const [x,y,w,col] of [[100,37,160,'#8d98bc'],[365,12,185,'#7586aa'],[560,50,160,'#667d9e']]){
      path(c,[[x-w,240],[x,y],[x+w,240]],col);path(c,[[x-w*.24,y+49],[x,y],[x+w*.3,y+62],[x+6,y+43],[x-12,y+51]],'#f3f0f5');
    }
    path(c,[[0,225],[110,197],[260,226],[380,199],[530,220],[720,201],[720,240],[0,240]],'#d3dfdf');
    for(const [x,s] of [[28,.75],[140,.52],[340,.62],[685,.7]])pine(c,x,239,s);
    for(let i=0;i<24;i++)oval(c,(i*127)%720,12+(i*59)%200,1.6,1.6,'#ffffffaa');
  }
  // Matching boss silhouettes help a non-reader recognize each adventure.
  c.save();c.translate(plains?584:575,city?146:plains?191:volcano?171:space?126:129);const scale=city?.4:plains?.27:volcano?.45:space?.47:.4;c.scale(scale,scale);
  robot(c,{x:0,y:0,type:city?'titan':plains?'excavator':volcano?'crab':space?'dreadnought':'wyvern',hp:24,maxHp:24,phase:0,hit:0},.2);c.restore();
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
    const shieldBoss=g.enemies.find(e=>(e.type==='crab'||e.type==='dreadnought')&&e.hp>0&&Math.abs(e.x-g.player.x)<950);
    this.scale=this.baseScale*(mining?.72:shieldBoss?.82:1);
    const b=this.height/this.scale/2,w=this.width/this.scale/2,p=g.player;
    const lookahead=mining?Math.sign(mining.x-p.x)*190:shieldBoss?Math.sign(shieldBoss.x-p.x)*205:p.facing*65;
    const tx=clamp(p.x+lookahead,w,WORLD.width-w),ty=clamp(p.y-80,Math.min(b,480),Math.max(480,WORLD.height-b));
    const k=snap?1:1-Math.exp(-dt*5);
    this.camera.x+=(tx-this.camera.x)*k;this.camera.y+=(ty-this.camera.y)*k;
  }
  sky(g){
    const c=this.c,w=this.width,h=this.height,biome=g.level.biome;
    if(!this.backdrop||this.backdropLevel!==biome){
      const layer=document.createElement('canvas');layer.width=this.canvas.width;layer.height=this.canvas.height;const b=layer.getContext('2d');b.scale(layer.width/w,layer.height/h);
      const colors=biome==='city'?['#4d7297','#9db4bd','#f5d1ad','#edb68e']:biome==='plains'?['#4f92c6','#9ed8e6','#daecd0','#f4e6af']:biome==='volcano'?['#29243d','#674553','#c2785c','#f2b77d']:biome==='space'?['#0d1936','#1d2b50','#3b456c','#76778e']:['#3b426b','#8589b3','#c3bad1','#ecd2c6'];
      b.fillStyle=grad(b,0,0,0,h,[[0,colors[0]],[.32,colors[1]],[.7,colors[2]],[1,colors[3]]]);b.fillRect(0,0,w,h);
      if(biome==='space'){
        for(let i=0;i<95;i++){const r=i%13===0?1.9:i%4===0?1.3:.65;oval(b,((i*137+23)%997)/997*w,((i*83+41)%719)/719*h*.88,r,r,i%3?'#dceaffaa':'#cdb3eaff');}
        glow(b,w*.7,h*.27,Math.min(w*.5,220),'#a2a6ff1c');ringedPlanet(b,w*.72,h*.28,Math.min(107,w*.17));
      }else{glow(b,w*.75,h*.35,w*.7,biome==='mountains'?'#d5c5ff38':biome==='volcano'?'#ffad6338':'#fff0c168');oval(b,w*.76,h*.34,biome==='mountains'?30:39,biome==='mountains'?30:39,biome==='mountains'?'#efedff':biome==='volcano'?'#ffd2a1':'#fff2cf');}
      this.backdrop=layer;this.backdropLevel=biome;
    }
    c.drawImage(this.backdrop,0,0,w,h);
    if(biome==='space'){
      const horizon=this.worldToScreen(0,850).y;
      for(let layer=0;layer<2;layer++){
        const step=125+layer*65,par=.12+layer*.12,base=horizon+layer*12;
        for(let i=-2;i<Math.ceil(w/step)+2;i++){
          const index=i+Math.floor(this.camera.x*par/step),x=i*step-(this.camera.x*par%step),high=60+((index*47+layer*17)%80+80)%80;
          path(c,[[x,base],[x+12,base-high],[x+step*.55,base-high-9],[x+step*.72,base-35],[x+step,base]],layer?'#324967':'#475578');
          line(c,x+25,base-high,x+25,base-high-44,'#69809e',3);oval(c,x+25,base-high-47,2.5,2.5,'#a4e1f2');
          if(layer)for(let k=0;k<3;k++)line(c,x+27+k*12,base-high+20,x+32+k*12,base-high+20,'#89b5d0',2);
        }
      }return;
    }
    if(biome==='volcano'){
      const horizon=this.worldToScreen(0,850).y;
      for(let layer=0;layer<3;layer++){
        const step=350-layer*45,par=.09+layer*.11,base=horizon+layer*22;
        for(let i=-2;i<Math.ceil(w/step)+3;i++){
          const index=i+Math.floor(this.camera.x*par/step),x=i*step-(this.camera.x*par%step),peak=base-150-layer*30-((index*61)%100+100)%100;
          path(c,[[x-step*.3,base+100],[x+step*.26,peak+15],[x+step*.39,peak],[x+step*.51,peak+14],[x+step*.62,peak+6],[x+step*1.12,base+100]],['#9a6570','#785365','#4c4054'][layer]);
          if(layer<2){line(c,x+step*.4,peak+9,x+step*.56,peak+14,'#eaa07177',5);path(c,[[x+step*.45,peak+15],[x+step*.49,peak+66],[x+step*.62,peak+111],[x+step*.54,peak+62]],'#ec95664d');}
        }
      }
      for(let i=0;i<24;i++){const x=((i*137-this.camera.x*.1+g.time*(6+i%3))%Math.max(1,w)+w)%w,y=40+((i*71-g.time*(7+i%4))%Math.max(1,h*.78)+h*.78)%(h*.78);oval(c,x,y,i%4===0?1.6:.8,i%4===0?2.5:1.2,i%4===0?'#ffdb9d99':'#e7ba9c55');}return;
    }
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
  frontierGround(g){
    const c=this.c,b=this.bounds(),lava=g.level.biome==='volcano',left=Math.max(0,b.left-160),right=Math.min(WORLD.width,b.right+160),t=g.time;
    c.fillStyle=grad(c,0,836,0,1000,[[0,lava?'#514351':'#657493'],[1,lava?'#241f34':'#283c61']]);c.fillRect(left,836,right-left,200);
    line(c,left,836,right,836,lava?'#df9b76':'#b4c3db',4);
    if(lava){
      // Winding molten channels sit below the flyable layer; their warm rims stay readable.
      for(let x=Math.floor((left-650)/1750)*1750+350;x<right+500;x+=1750){
        path(c,[[x,851],[x+145,850],[x+260,879],[x+370,860],[x+640,879],[x+730,939],[x+560,976],[x+310,949],[x+160,979],[x-50,940]],'#211f32');
        path(c,[[x+5,860],[x+139,858],[x+257,893],[x+378,875],[x+632,892],[x+690,933],[x+551,958],[x+304,932],[x+162,963],[x-23,933]],grad(c,0,855,0,965,[[0,'#ffcb7b'],[.28,'#eb813e'],[1,'#ad4b36']]));
        line(c,x+31,869,x+132,870,'#ffebb0',3);line(c,x+278,905,x+375,888,'#ffc675',3);line(c,x+458,908,x+593,918,'#ffce873b',5);
        for(let i=0;i<7;i++){const px=x+45+i*83,py=909+Math.sin(i*1.9+t*.7)*14;oval(c,px,py,12+i%3*5,3,'#ffe1a236');}
      }
      for(let x=Math.floor(left/240)*240+30;x<right;x+=240){
        const high=28+((Math.floor(x/240)*29)%58+58)%58;
        path(c,[[x,836],[x-8,836-high],[x+13,820-high],[x+39,829-high],[x+46,836]],grad(c,x,836-high,x+46,836,[[0,'#716176'],[1,'#2b2e43']]),'#927078',1.5);
        line(c,x+14,824-high,x+19,831,'#db916b66',2);
      }
    }else{
      // Lunar craters, landing circles and launch gantries replace terrestrial vegetation.
      for(let x=Math.floor(left/410)*410+55;x<right;x+=410){
        oval(c,x,885,56,16,'#304363');c.beginPath();c.ellipse(x,881,56,16,0,Math.PI,TAU);c.strokeStyle='#99a9c0';c.lineWidth=3;c.stroke();oval(c,x+7,887,32,7,'#425677');
      }
      for(let x=Math.floor(left/1350)*1350+290;x<right+250;x+=1350){
        oval(c,x+115,853,148,22,'#263858');c.beginPath();c.ellipse(x+115,850,143,20,0,0,TAU);c.strokeStyle='#9bbce4';c.lineWidth=3;c.stroke();
        c.beginPath();c.ellipse(x+115,850,114,14,0,0,TAU);c.setLineDash([14,13]);c.strokeStyle='#9be8ef';c.lineWidth=2;c.stroke();c.setLineDash([]);
        box(c,x-91,667,17,169,4,'#2d4163','#8a9dc1');box(c,x-97,659,116,16,4,'#536789','#96b1d0');
        for(let i=0;i<4;i++)line(c,x-87,692+i*34,x-76,705+i*34,'#9baed5',3);
        line(c,x+10,675,x+10,722,'#90aacb',5);box(c,x-3,720,25,16,5,'#80d4e8','#c6f0ff');glow(c,x+9,730,48,'#a3dfff17');
        line(c,x+276,836,x+276,783,'#758bab',5);oval(c,x+276,775,8,8,'#bac5ff');
      }
      for(let x=Math.floor(left/160)*160+40;x<right;x+=160){line(c,x,836,x,823,'#6a81a2',3);box(c,x-5,817,10,7,2,'#bdc8f2');}
    }
    for(const r of g.roofs){
      if(r.x+r.w<left||r.x>right)continue;const y=roofSurface(r);
      if(lava){
        // Faceted basalt columns use the exact shared landing height.
        path(c,[[r.x-10,y],[r.x+r.w+10,y],[r.x+r.w-6,850],[r.x+5,850]],grad(c,r.x,y,r.x+r.w,850,[[0,'#796575'],[.4,'#4e4158'],[1,'#2b2d42']]),'#9c7279',2);
        for(let i=0;i<4;i++){const px=r.x+(i+1)*r.w/5;line(c,px,y+8,px-5,842,'#a37b804d',2);}
        path(c,[[r.x-11,y],[r.x+12,y-8],[r.x+r.w-15,y-8],[r.x+r.w+11,y],[r.x+r.w-6,y+8],[r.x+5,y+8]],'#9b7a83','#d5a08f',2);
        line(c,r.x+16,y,r.x+r.w-16,y,'#ffd098',3);
        path(c,[[r.x+r.w*.6,y+26],[r.x+r.w*.54,y+82],[r.x+r.w*.65,y+117],[r.x+r.w*.57,y+177]],null,'#ec946d66',3);
        for(let i=0;i<3;i++)path(c,[[r.x+24+i*24,y],[r.x+31+i*24,y-25-i%2*12],[r.x+42+i*24,y]],i%2?'#b18a9c':'#806c91','#d8aab4',1.5);
      }else{
        for(const px of [r.x+19,r.x+r.w-20]){line(c,px,y+11,px,850,'#324b6c',13);line(c,px-4,y+18,px-4,843,'#8e9cbe',3);}
        for(let k=0;k<3;k++){const top=y+35+k*Math.max(30,(845-y)/3),bottom=Math.min(846,top+Math.max(25,(845-y)/3));line(c,r.x+20,top,r.x+r.w-20,bottom,'#677c9b',4);}
        box(c,r.x-13,y,r.w+26,18,5,'#485e82','#b4bfda');line(c,r.x-5,y,r.x+r.w+5,y,'#b8eaff',4);
        for(let px=r.x+14;px<r.x+r.w;px+=36)line(c,px,y+8,px+12,y+8,'#a99de3',3);
        box(c,r.x+23,y-37,50,35,6,'#3b5075','#b0bfda');oval(c,r.x+47,y-21,11,8,'#243958');oval(c,r.x+47,y-21,6,4,'#a0eff6');
        line(c,r.x+r.w-24,y,r.x+r.w-24,y-42,'#8fa8cc',4);oval(c,r.x+r.w-24,y-47,6,6,'#c2b6ff');
      }
    }
  }
  countryside(g){
    if(g.level.biome==='volcano'||g.level.biome==='space'){this.frontierGround(g);return;}
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
      if(g.level.biome==='volcano'||g.level.biome==='space'){
        const lava=g.level.biome==='volcano',accent=lava?'#ffd496':'#b5edff';
        line(c,x,836,x,y+28,lava?'#77606b':'#758bad',11);
        box(c,x-45,y+20,90,27,6,lava?'#544254':'#374d72',lava?'#c08d7e':'#acb8d8');
        if(lava){
          path(c,[[x-32,y+21],[x-24,y-20],[x,y-53],[x+24,y-20],[x+32,y+21]],grad(c,x-30,y-50,x+30,y+25,[[0,'#ad8f9f'],[1,'#493c52']]),'#ddb1a1',2);
          path(c,[[x,y-35],[x+14,y-9],[x,y+14],[x-14,y-9]],lit?'#ffcc7b':'#735969');
          for(const f of [-1,1]){line(c,x+f*33,y+11,x+f*44,y-10,'#d1a28c',5);oval(c,x+f*46,y-15,6,6,lit?'#ffe3aa':'#8e7881');}
        }else{
          c.save();c.translate(x,y);c.rotate(-.2);oval(c,0,-4,38,13,'#738bad');c.beginPath();c.ellipse(0,-11,36,25,0,0,Math.PI);c.strokeStyle='#d6e1f3';c.lineWidth=5;c.stroke();line(c,0,12,0,-28,'#a8bedb',4);oval(c,0,-33,9,9,lit?'#d6d0ff':'#7187a8');c.restore();
          box(c,x-18,y+24,36,15,3,lit?'#a7cfff':'#5a7194');
        }
        if(lit){glow(c,x,y-10,110,lava?'#ffa24f30':'#a3c9ff33');path(c,[[x-12,y-29],[x-85,y-185],[x+85,y-185],[x+12,y-29]],grad(c,0,y-185,0,y,[[0,lava?'#ffc59100':'#b4bfff00'],[1,lava?'#ffc5912e':'#b4bfff33']]));label(c,'✦',x+52,y-9,21,accent);}
        label(c,site.name.toUpperCase(),x,877,12,lava?'#ffe2c6':'#d9e7ff');continue;
      }
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
      if(e.boss&&(e.type==='crab'||e.type==='dreadnought'))bossBarrier(c,e,g.time);
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
      for(let i=1;i<q.trail.length;i++){const a=q.trail[i-1],t=q.trail[i];line(c,a.x,a.y,t.x,t.y,q.tint||(q.type==='missile'?'#ffd28c55':'#ffe5ab44'),2+i*.5);}
      if(q.type==='rock'){
        for(let i=0;i<3;i++)oval(c,q.x-q.vx*(.07+i*.06),q.y-q.vy*(.07+i*.06),q.radius*(.6-i*.12),q.radius*(.5-i*.1),'#d3b39022');
        miningRock(c,q.x,q.y,q.radius,q.spin+g.time*2);
      }else if(q.type==='missile'){
        glow(c,q.x,q.y,36,q.tint||'#ffd39344');c.save();c.translate(q.x,q.y);c.rotate(Math.atan2(q.vy,q.vx));
        path(c,[[-16,-6],[-41-Math.sin(g.time*40)*7,0],[-16,6]],'#ffbd65');path(c,[[-17,-3],[-33,0],[-17,3]],'#fff4b1');
        path(c,[[-7,-6],[-18,-16],[7,-6]],q.tint||'#8db498','#3a5564',2);path(c,[[-7,6],[-18,16],[7,6]],q.tint||'#8db498','#3a5564',2);
        box(c,-18,-7,32,14,5,'#dce5ca','#3a5564');path(c,[[10,-7],[26,0],[10,7]],q.tint||'#95dd83','#3a5564',2);line(c,-6,-4,5,-4,'#ffffff',2);c.restore();
      }else{
        const r=Math.max(14,q.radius||14);
        glow(c,q.x,q.y,r*2.4,q.tint||'#ffc87866');oval(c,q.x,q.y,r,r,'#54674f');oval(c,q.x,q.y,r*.79,r*.79,q.tint||'#ffc56d');oval(c,q.x-2,q.y-2,r*.43,r*.43,'#fff5c5');
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
      if(f.type==='shield-break'){
        const spread=f.age/f.life;
        c.beginPath();c.ellipse(f.x,f.y-10,285+spread*78,185+spread*55,0,0,TAU);c.strokeStyle='#d4ecff';c.lineWidth=5*k;c.stroke();
        for(let i=0;i<10;i++){
          const a=i*TAU/10,rx=260+spread*130,ry=160+spread*95,x=f.x+Math.cos(a)*rx,y=f.y-10+Math.sin(a)*ry,size=15*k+3;
          c.save();c.translate(x,y);c.rotate(a+spread*1.6);
          path(c,[[-size,-size*.55],[0,-size],[size,-size*.55],[size,size*.55],[0,size],[-size,size*.55]],'#c8e3ff22','#d4f4ff',2);
          line(c,-size*.4,-size*.5,size*.3,size*.15,'#ffffff',1.5);c.restore();
        }
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
