import { WORLD, heroLean, eyePosition, roofSurface, SITE_COUNT } from './engine.js?v=world93';
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
      if(!titan||e.hp>(f<0?2:1)){
        line(c,f*26,-12,f*32,15,dark,12);box(c,f*33-9,4,18,27,5,metal,'#243c55');
        path(c,[[f*15,-25],[f*35,-25],[f*42,-10],[f*22,-6]],metal,'#284561',1.3);
        line(c,f*27,-20,f*34,-16,'#f0ac78',2);
      }else lightning(c,f*22,-14,f*32,2,time,'#9efbff',1.2);
    }
    path(c,[[-21,-23],[20,-23],[25,4],[14,28],[-13,28],[-25,4]],metal,'#1b344e',1.5);
    path(c,[[-15,-14],[15,-14],[18,8],[0,19],[-17,8]],dark);
    for(let i=0;i<3;i++)line(c,-11,8+i*5,11,8+i*5,'#6b869a',2);
    if(titan&&e.hp<3){path(c,[[-13,-12],[10,-7],[0,14],[-14,2]],'#142536');lightning(c,-10,-8,9,8,time,'#ffe297',1);}
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
function excavator(c,e,time){
  c.save();c.translate(e.x,e.y);if(e.hit>0)c.globalAlpha=.65;
  const gold=grad(c,-150,-100,120,70,[[0,'#ffe3a0'],[.45,'#dca651'],[1,'#8b653d']]);
  oval(c,0,127,210,14,'#23384244');box(c,-166,64,326,66,28,'#263c49','#788e8e');
  for(let i=0;i<8;i++){oval(c,-140+i*39,97,22,23,'#516878');oval(c,-140+i*39,97,10,11,'#8ca19f');}
  box(c,-150,5,260,68,13,gold,'#4b5960');box(c,-98,-104,128,114,13,gold,'#4b5960');
  path(c,[[-80,-91],[8,-91],[15,-21],[-80,-21]],grad(c,0,-90,0,0,[[0,'#81b9c9'],[1,'#264a68']]),'#233d51',4);line(c,-36,-90,-36,-23,'#dac994',5);
  box(c,-127,-15,32,50,5,'#536976');for(let i=0;i<4;i++)line(c,-120,-6+i*9,-102,-6+i*9,'#a4b3a7',3);
  glow(c,-7,33,50,'#ffe58c44');oval(c,-7,33,24,24,'#55413c');oval(c,-7,33,16,16,'#fff1a6');
  const swing=Math.sin(time*.9)*16;
  if(e.hp>2){line(c,54,-1,140,-112+swing,'#4e5960',37);line(c,54,-1,140,-112+swing,'#e4b765',28);line(c,140,-112+swing,219,-19,'#5a6266',26);line(c,140,-112+swing,219,-19,'#f2d08c',18);path(c,[[199,-27],[259,-12],[265,41],[218,52],[194,20]],gold,'#4b5960',4);for(let i=0;i<3;i++)path(c,[[218+i*15,49],[225+i*15,65],[232+i*15,45]],'#dbe1cd');}
  else lightning(c,55,0,110,-40,time,'#b8ffff',4);
  if(e.hp<5)path(c,[[-142,8],[-82,5],[-110,47],[-141,30]],'#4c5a60');
  line(c,-77,-53,-55,-53,'#fff0a3',5);line(c,-18,-53,2,-53,'#fff0a3',5);
  c.restore();
}
function stormwing(c,e,time){
  c.save();c.translate(e.x,e.y);if(e.hit>0)c.globalAlpha=.65;
  const wing=Math.sin(time*3)*28,metal=grad(c,-140,-80,140,80,[[0,'#d7d6e9'],[.5,'#7d8dae'],[1,'#344a70']]);
  for(const f of [-1,1]){
    path(c,[[f*23,-20],[f*112,-93-wing],[f*252,-63-wing],[f*187,26],[f*125,0],[f*88,57],[f*42,30]],metal,'#233b62',4);
    for(let i=0;i<3;i++)line(c,f*(60+i*48),-15-i*12,f*(100+i*46),-50-wing,'#a4c9d1',4);
    if(e.hp>3){glow(c,f*128,-10,35,'#ae98ff66');oval(c,f*128,-10,14,14,'#34415d');oval(c,f*128,-10,8,8,'#d9b8ff');}
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
export class Renderer {
  constructor(canvas){
    this.canvas=canvas;this.c=canvas.getContext('2d',{alpha:false});this.width=1;this.height=1;this.camera={x:370,y:480};this.scale=1;this.reduced=false;
    this.backdrop=null;this.backdropLevel=null;this.cityCache=new Map();this.resize();
  }
  resize(){
    const r=this.canvas.getBoundingClientRect(),dpr=Math.min(globalThis.devicePixelRatio||1,2);
    if(r.width<1||r.height<1)return;
    this.width=r.width;this.height=r.height;this.scale=Math.min(r.width/620,r.height/730);this.scale=Math.max(.48,Math.min(this.scale,1.3));
    const w=Math.round(r.width*dpr),h=Math.round(r.height*dpr);
    if(this.canvas.width!==w||this.canvas.height!==h){this.canvas.width=w;this.canvas.height=h;this.backdrop=null;}
  }
  bounds(){const s=this.scale;return {left:this.camera.x-this.width/s/2,right:this.camera.x+this.width/s/2,top:this.camera.y-this.height/s/2,bottom:this.camera.y+this.height/s/2};}
  screenToWorld(x,y){return{x:this.camera.x+(x-this.width/2)/this.scale,y:this.camera.y+(y-this.height/2)/this.scale};}
  worldToScreen(x,y){return{x:(x-this.camera.x)*this.scale+this.width/2,y:(y-this.camera.y)*this.scale+this.height/2};}
  follow(g,dt,snap=false){
    const b=this.height/this.scale/2,w=this.width/this.scale/2,p=g.player;
    const tx=clamp(p.x+p.facing*65,w,WORLD.width-w),ty=clamp(p.y-80,Math.min(b,480),Math.max(480,WORLD.height-b));
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
    if(right>8800){line(c,8840,850,8840,545,'#5b7280',22);line(c,9520,850,9520,545,'#5b7280',22);c.beginPath();c.moveTo(8840,558);c.quadraticCurveTo(9170,735,9520,558);c.strokeStyle='#829297';c.lineWidth=9;c.stroke();for(let x=8880;x<9520;x+=65){const u=(x-8840)/680;line(c,x,558+4*177*u*(1-u),x,835,'#84999b',2);}}
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
    if(!mountain&&right>8600){c.fillStyle='#b7a486';c.fillRect(8730,832,870,32);for(let x=8750;x<9600;x+=70)line(c,x,848,x+25,848,'#786d5d',8);}
  }
  landmarks(g){
    const c=this.c,b=this.bounds(),t=g.time;
    for(const site of g.sites.filter(s=>s.restore)){
      const x=site.restoreX,y=site.restoreY;if(x<b.left-220||x>b.right+220)continue;
      const lit=g.run.restored.includes(site.district);
      if(g.level.biome==='city'&&site.district===0){
        oval(c,x,832,140,12,'#263b4d55');box(c,x-120,798,240,32,10,'#baac9b');oval(c,x,800,119,25,'#ddd2b9');oval(c,x,797,104,18,lit?'#6ca7b4':'#758386');box(c,x-19,732,38,67,5,'#d2c5ac');oval(c,x,733,56,12,'#eddbb9');
        if(lit)for(let i=-3;i<=3;i++){c.beginPath();c.moveTo(x,724);c.quadraticCurveTo(x+i*19,645-Math.sin(t*2+i)*8,x+i*30,791);c.strokeStyle='#a9efea';c.lineWidth=3;c.stroke();}
      }else{
        line(c,x,836,x,y+35,g.level.biome==='mountains'?'#9c9cb7':'#657a71',9);
        if(g.level.biome==='plains'&&site.district===2){box(c,x-28,y-12,56,110,4,'#d7c49b');const a=lit?t*.7:0;for(let i=0;i<4;i++){const q=a+i*Math.PI/2;line(c,x,y,x+Math.cos(q)*78,y+Math.sin(q)*78,'#f6e5b5',12);}}
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
      if(e.hp<=0||e.x+e.radius+80<this.bounds().left||e.x-e.radius-80>this.bounds().right)continue;
      if(aim===e){c.beginPath();c.ellipse(e.x,e.y,e.radius+12,e.radius+12,0,0,TAU);c.setLineDash([8,9]);c.strokeStyle='#ffe4ad99';c.lineWidth=2;c.stroke();c.setLineDash([]);}
      robot(c,e,g.time);
      if(e.boss){
        label(c,e.name.toUpperCase(),e.x,e.y-228,17,'#fff0d0');
        for(let i=0;i<e.maxHp;i++){box(c,e.x-e.maxHp*16+i*32,e.y-212,24,6,3,i<e.hp?'#ffcc85':'#617d89');}
      }
    }
    const p=g.player;
    oval(c,p.x,WORLD.ground-1,23+Math.max(0,WORLD.ground-p.y)*.014,5,'#19374744');
    for(let i=1;i<p.trail.length;i++){
      const a=p.trail[i-1],b=p.trail[i];line(c,a.x,a.y+12,b.x,b.y+12,`rgba(139,250,255,${(1-b.age/.3)*.35})`,(1-b.age/.3)*20+1);
    }
    hero(c,p.x,p.y,76,g.time,{facing:p.facing,flying:!p.landed,speed:Math.hypot(p.vx,p.vy),vx:p.vx,vy:p.vy,flare:p.flare});
    for(const f of g.effects){
      const k=1-f.age/f.life;c.save();c.globalAlpha=k;
      if(f.type==='zap'){lightning(c,f.x,f.y,f.tx,f.ty,g.time,'#4edcff',9);lightning(c,f.x,f.y,f.tx,f.ty,g.time,'#e1ffff',3);}
      if(f.type==='laser'){
        const eye=eyePosition(p);
        line(c,eye.x,eye.y-2,f.tx,f.ty-2,'#fa719b33',32);line(c,eye.x,eye.y-2,f.tx,f.ty-2,'#ff7db0',9);line(c,eye.x,eye.y+2,f.tx,f.ty+2,'#ffebf5',3);
        glow(c,eye.x,eye.y,50,'#ffa7cb88');
      }
      if(f.type==='sphere'){
        const r=Math.min(1,f.age/.55)*f.radius;
        const sphere=c.createRadialGradient(f.x-r*.23,f.y-r*.3,r*.05,f.x,f.y,Math.max(1,r));
        sphere.addColorStop(0,'#d1ffff08');sphere.addColorStop(.78,'#77e8ff14');sphere.addColorStop(.94,'#79eaff44');sphere.addColorStop(1,'#e3ffffbb');
        oval(c,f.x,f.y,r,r,sphere);c.beginPath();c.arc(f.x,f.y,r,0,TAU);c.strokeStyle='#e8ffff';c.lineWidth=3;c.stroke();
        for(let i=0;i<5;i++){const a=i*1.256+g.time;lightning(c,f.x+Math.cos(a)*r*.5,f.y+Math.sin(a)*r*.5,f.x+Math.cos(a)*r,f.y+Math.sin(a)*r,g.time,'#c5ffff',1.5);}
      }
      if(f.type==='burst'){
        const r=(f.big?140:60)*(1-k);glow(c,f.x,f.y,Math.max(1,r),f.color+'88');
        c.beginPath();c.arc(f.x,f.y,r,0,TAU);c.strokeStyle=f.color;c.lineWidth=3*k;c.stroke();
        for(let i=0;i<6;i++){const a=i*TAU/6;line(c,f.x+Math.cos(a)*r*.5,f.y+Math.sin(a)*r*.5,f.x+Math.cos(a)*r,f.y+Math.sin(a)*r,'#fff2c3',3*k);}
      }
      if(f.type==='enemy-shot'){
        const q=Math.min(1,f.age/.4),x=f.x+(f.tx-f.x)*q,y=f.y+(f.ty-f.y)*q;
        oval(c,x,y,5,5,'#ffd99d');
        if(q===1){c.beginPath();c.arc(f.tx,f.ty,38+f.age*12,0,TAU);c.strokeStyle='#95f8fc';c.lineWidth=2;c.stroke();}
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
