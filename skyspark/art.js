import { WORLD, ROOFS, heroLean, eyePosition } from './engine.js?v=world90';
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
export class Renderer {
  constructor(canvas){
    this.canvas=canvas;this.c=canvas.getContext('2d',{alpha:false});this.width=1;this.height=1;this.camera={x:370,y:480};this.scale=1;this.reduced=false;
    this.backdrop=null;this.cityCache=new Map();this.resize();
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
    const c=this.c,w=this.width,h=this.height;
    if(!this.backdrop){const layer=document.createElement('canvas');layer.width=this.canvas.width;layer.height=this.canvas.height;const b=layer.getContext('2d');b.scale(layer.width/w,layer.height/h);
      b.fillStyle=grad(b,0,0,0,h,[[0,'#4d7297'],[.32,'#9db4bd'],[.7,'#f5d1ad'],[1,'#edb68e']]);b.fillRect(0,0,w,h);
      glow(b,w*.75,h*.35,w*.7,'#fff0c168');oval(b,w*.76,h*.34,39,39,'#fff2cf');glow(b,w*.76,h*.34,90,'#ffefd94d');
      this.backdrop=layer;
    }
    c.drawImage(this.backdrop,0,0,w,h);
    const xOffset=this.camera.x*.06;
    c.globalAlpha=.25;
    for(let i=0;i<8;i++){
      const x=((i*237-xOffset)%(w+260)+w+260)%(w+260)-100,y=60+(i%3)*67;
      oval(c,x,y,90,12,'#fff4e2');oval(c,x+30,y-8,41,14,'#fff4e2');
    }c.globalAlpha=1;
    // Three parallax layers, with individual window patterns and a clock-tower silhouette.
    const horizon=this.worldToScreen(0,850).y;
    for(let layer=0;layer<3;layer++){
      const spacing=70+layer*23,par=.12+layer*.13,base=horizon-25-layer*12;
      for(let i=-3;i<Math.ceil(w/spacing)+4;i++){
        const idx=i+Math.floor(this.camera.x*par/spacing),x=i*spacing-(this.camera.x*par%spacing),bh=(110+((idx*71+layer*49)%190+190)%190)*(this.scale*.65+.35),bw=spacing-5;
        c.fillStyle=['#7b8e9d','#69818d','#526c7b'][layer];c.fillRect(x,base-bh,bw,bh);
        if(idx%5===0){c.fillRect(x+bw*.3,base-bh-18,bw*.4,18);line(c,x+bw/2,base-bh-18,x+bw/2,base-bh-50,c.fillStyle,2);}
        if(layer>0){c.fillStyle=layer===1?'#c0c4b055':'#e8c99966';for(let row=0;row<bh/23-1;row++)for(let col=0;col<3;col++)if((row+col+idx)%4)c.fillRect(x+12+col*19,base-bh+15+row*23,6,10);}
      }
    }
  }
  architecture(g){
    const c=this.c,t=g.time,b=this.bounds();
    // Warm sandstone retaining wall and a softly reflective boulevard.
    c.fillStyle=grad(c,0,850,0,1000,[[0,'#747e80'],[.45,'#465d6b'],[1,'#253b50']]);c.fillRect(-100,850,WORLD.width+200,200);
    c.fillStyle='#c4b39a';c.fillRect(-100,836,WORLD.width+200,14);c.fillStyle='#f8d7ac';c.fillRect(-100,836,WORLD.width+200,3);
    for(let x=0;x<WORLD.width;x+=140){c.fillStyle='#e8d7ae88';c.fillRect(x,915,65,5);line(c,x,850,x+30,900,'#efc49114',7);}
    // Side-view buildings are background scenery; their roofs are explicit landing perches.
    for(let i=0;i<ROOFS.length;i++){
      const r=ROOFS[i];if(r.x+r.w<b.left-60||r.x>b.right+60)continue;
      c.fillStyle=grad(c,r.x,r.y,r.x+r.w,850,[[0,i%2?'#a87d74':'#bda388'],[1,'#686a72']]);c.fillRect(r.x,r.y,r.w,850-r.y);
      c.fillStyle='#4d5a6e';c.fillRect(r.x+r.w-14,r.y+10,14,840-r.y);
      for(let row=r.y+35;row<815;row+=65)for(let col=r.x+22;col<r.x+r.w-26;col+=45){
        box(c,col-3,row-4,29,43,2,'#d6b49a');box(c,col,row,22,34,1,'#3e596b');c.fillStyle=g.save.stage>0?'#eacb8a':'#819ba1';c.fillRect(col+3,row+3,16,12);line(c,col+11,row,col+11,row+34,'#ad9e8c',2);
      }
      c.fillStyle='#4a596d';c.fillRect(r.x-8,r.y-11,r.w+16,13);c.fillStyle='#e7c6a3';c.fillRect(r.x-12,r.y-17,r.w+24,7);
      line(c,r.x+10,r.y-21,r.x+r.w-10,r.y-21,'#91f9e1',3);
      for(let px=r.x+14;px<r.x+r.w;px+=42){line(c,px,r.y-18,px,r.y-34,'#637579',2);}line(c,r.x+14,r.y-34,r.x+r.w-15,r.y-34,'#687d84',2);
      box(c,r.x+40,r.y-50,48,30,3,'#5b7580');for(let k=0;k<4;k++)line(c,r.x+48,r.y-43+k*5,r.x+79,r.y-43+k*5,'#94a6a3',2);
      // Small glowing chevrons communicate a landable roof.
      path(c,[[r.x+r.w*.7-9,r.y-29],[r.x+r.w*.7,r.y-23],[r.x+r.w*.7+9,r.y-29]],null,'#c5fff3',2);
    }
    for(const x of [330,730,1050,1720,2040,3070]){tree(c,x,838,.85);}
    for(const x of [350,760,1060,1690,2030,3010]){
      line(c,x,836,x,676,'#536275',6);line(c,x,681,x+32,681,'#536275',5);box(c,x+20,674,26,9,4,'#ffe6aa');glow(c,x+34,692,60,'#ffd68c20');
    }
    // Sunbeam fountain: dry bowl first, then animated water and lights.
    oval(c,480,832,150,12,'#263b4d55');box(c,355,798,250,32,10,'#baac9b');oval(c,480,800,124,25,'#ddd2b9');oval(c,480,797,108,18,g.save.stage>0?'#6ca7b4':'#758386');
    box(c,461,732,38,67,5,'#d2c5ac');oval(c,480,733,56,12,'#eddbb9');oval(c,480,729,49,8,'#739ba6');
    if(g.save.stage>0){
      for(let i=-3;i<=3;i++){
        c.beginPath();c.moveTo(480,724);c.quadraticCurveTo(480+i*19,645-Math.sin(t*2+i)*8,480+i*30,791);c.strokeStyle=i%2?'#c0f6ec':'#8ee5e7';c.lineWidth=3;c.stroke();
        oval(c,480+i*30,791+Math.sin(t*4+i)*2,6,2,'#d3fff4');
      }glow(c,480,739,95,'#a1f4ec25');
    }
    label(c,'SUNBEAM PLAZA',480,873,12,'#f6e0bb');
    // Beacon with a faceted lens and restored light cone.
    line(c,1515,550,1515,355,'#506f7a',8);box(c,1492,341,46,41,8,'#d2b792');box(c,1497,345,36,29,5,g.save.stage>1?'#a2ffde':'#5d7e8b');
    if(g.save.stage>1){glow(c,1515,358,110,'#a5ffdd55');path(c,[[1504,345],[1300,120],[1730,120],[1525,345]],grad(c,0,120,0,345,[[0,'#a4ffe300'],[1,'#b2ffe529']]));}
    label(c,'BEACON ROOFTOPS',1515,591,12,'#f6e0bb');
    // Bridge framing keeps the giant robot against open sky.
    line(c,2340,850,2340,545,'#5b7280',22);line(c,3020,850,3020,545,'#5b7280',22);
    c.beginPath();c.moveTo(2340,558);c.quadraticCurveTo(2670,735,3020,558);c.strokeStyle='#829297';c.lineWidth=9;c.stroke();
    for(let x=2380;x<3020;x+=65){const u=(x-2340)/680,y=558+4*177*u*(1-u);line(c,x,y,x,835,'#84999b',2);}
    label(c,'SKYBRIDGE',2670,873,12,'#f6e0bb');
    // Public art and small street details add life without cluttering the route.
    for(const x of [650,1010,2000]){box(c,x,807,62,8,3,'#947365');line(c,x+8,815,x+8,835,'#536571',4);line(c,x+53,815,x+53,835,'#536571',4);}
    if(g.save.stage===3){
      for(let i=0;i<18;i++){const x=400+i*155,y=660+Math.sin(i*1.4)*40;line(c,x,y,x+14,y+80,'#e1c5a155',1);oval(c,x,y,10,14,['#ffa5a3','#a5e9e0','#ffdf85'][i%3]);}
      for(const x of [470,1510,2640]){line(c,x,690,x,560,'#e9d5ab',4);path(c,[[x,560],[x+56,575],[x,596]],'#ffd16e');}
    }
  }
  draw(g,dt=0){
    this.resize();this.follow(g,dt);const c=this.c,w=this.width,h=this.height,dpr=this.canvas.width/w;
    c.setTransform(dpr,0,0,this.canvas.height/h,0,0);this.sky(g);
    c.save();c.translate(w/2,h/2);
    if(!this.reduced&&g.shake>0)c.translate(Math.sin(g.time*90)*g.shake*.35,Math.cos(g.time*73)*g.shake*.2);
    c.scale(this.scale,this.scale);c.translate(-this.camera.x,-this.camera.y);
    this.architecture(g);
    if(g.restoreReady){const a=g.save.stage===0?{x:480,y:690}:{x:1515,y:340};glow(c,a.x,a.y,95,'#b8ffdf55');c.beginPath();c.arc(a.x,a.y,44+Math.sin(g.time*4)*4,0,TAU);c.strokeStyle='#e7ffe8';c.lineWidth=3;c.stroke();label(c,'✦',a.x,a.y+11,36,'#fff3a8');label(c,'FLY HERE',a.x,a.y-64,12,'#fff4c8');}
    for(const r of g.rings)if(!r.taken){
      glow(c,r.x,r.y,57,'#ffd47130');c.beginPath();c.ellipse(r.x,r.y,23,37,0,0,TAU);c.strokeStyle='#ffe5a1';c.lineWidth=6;c.stroke();
      c.strokeStyle='#fff9db';c.lineWidth=1.5;c.stroke();label(c,'✦',r.x,r.y+6,20,'#fff2b5');
    }
    // Flight target reads as a destination, never as a second character.
    if(g.target){const a=g.target;c.setLineDash([4,7]);line(c,g.player.x,g.player.y,a.x,a.y,'#d4f9f344',2);c.setLineDash([]);c.beginPath();c.arc(a.x,a.y,16+Math.sin(g.time*5)*3,0,TAU);c.strokeStyle='#e0fff2aa';c.lineWidth=2;c.stroke();}
    const aim=g.enemies.find(e=>e.id===g.aim);
    for(const e of g.enemies){
      if(e.hp<=0)continue;
      if(aim===e){c.beginPath();c.ellipse(e.x,e.y,e.radius+12,e.radius+12,0,0,TAU);c.setLineDash([8,9]);c.strokeStyle='#ffe4ad99';c.lineWidth=2;c.stroke();c.setLineDash([]);}
      robot(c,e,g.time);
      if(e.type==='titan'){
        label(c,'IRON COLOSSUS',e.x,e.y-228,17,'#fff0d0');
        for(let i=0;i<4;i++){box(c,e.x-60+i*32,e.y-212,24,6,3,i<e.hp?'#ffcc85':'#617d89');}
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
        const size=f.robot.type==='titan'?420:100;
        c.beginPath();c.rect(f.x+(side<0?-size:0),f.y-size,size,size*2.1);c.clip();robot(c,f.robot,g.time);line(c,f.x,f.y-size*.48,f.x,f.y+size*.45,'#ffe7ec',3);c.restore();
      }c.restore();
    }
    for(const s of g.particles){c.save();c.globalAlpha=1-s.age/s.life;c.translate(s.x,s.y);c.rotate(s.age*5);if(s.metal){box(c,-s.size,-s.size,s.size*2,s.size*(s.sliced?1:2),1,s.color);line(c,-s.size,-s.size,s.size,-s.size,'#f5edcc',1);}else oval(c,0,0,s.size,s.size*.5,s.color);c.restore();}
    c.restore();
    // A subtle cinematic vignette preserves bright, legible play in the center.
    const v=c.createRadialGradient(w*.5,h*.4,h*.2,w*.5,h*.5,Math.max(w,h)*.8);v.addColorStop(0,'#0a243100');v.addColorStop(1,'#122b4a50');c.fillStyle=v;c.fillRect(0,0,w,h);
  }
}
