const ink='#355b61';
function line(c,x,y,xx,yy,color,width=.05){c.beginPath();c.moveTo(x,y);c.lineTo(xx,yy);c.strokeStyle=color;c.lineWidth=width;c.lineCap='round';c.stroke();}
function oval(c,x,y,rx,ry,color){c.beginPath();c.ellipse(x,y,rx,ry,0,0,Math.PI*2);c.fillStyle=color;c.fill();}
function shape(c,points,color){c.beginPath();points.forEach(([x,y],i)=>i?c.lineTo(x,y):c.moveTo(x,y));c.closePath();c.fillStyle=color;c.fill();}
function box(c,x,y,w,h,color,r=.04){c.beginPath();c.roundRect(x,y,w,h,r);c.fillStyle=color;c.fill();}
export function sceneryBounds(p){if(p.type==='miami-palm')return {height:2.3,width:1.25};if(p.type==='miami-shade')return {height:2.7,width:1.5};if(p.type==='miami-lamp')return {height:2.2,width:.6};if(p.type==='miami-mooring')return {height:4,width:4};return {height:1,width:1};}
export function drawMiamiProp(c,p,t=0){
 c.save();c.translate(p.x,p.y);
 if(p.type==='miami-palm'){
  oval(c,.15,.15,.65,.16,'#416a5a16');line(c,0,.1,.14,-1.55,'#a98a61',.12);line(c,-.03,.07,.1,-1.55,'#ddc091',.045);
  const sway=Math.sin(t*.7+p.seed*9)*.03;c.translate(sway,-1.55);
  for(let i=0;i<7;i++){const a=i*Math.PI*2/7,dx=Math.cos(a),dy=Math.sin(a)*.45;shape(c,[[0,0],[dx*.43-dy*.2,dy*.35-.12],[dx*1.09,dy+.25],[dx*.5+dy*.17,dy*.45+.06]],i%2?'#4d9d6d':'#368566');line(c,0,0,dx*.88,dy+.16,'#a3cb83',.026);}
  oval(c,-.08,.07,.09,.11,'#a78b59');oval(c,.1,.1,.09,.1,'#bfa477');
 }else if(p.type==='miami-shade'){
  oval(c,.2,.2,1.1,.22,'#416a5a15');line(c,0,.15,0,-1.5,'#9d8965',.14);line(c,0,-.8,-.55,-1.45,'#9d8965',.08);oval(c,-.5,-1.65,.87,.5,'#4d8b69');oval(c,.45,-1.8,.87,.6,'#5d9e72');oval(c,-.1,-2.05,.9,.51,'#7ab481');
 }else if(p.type==='miami-bench'){
  for(const side of [-1,1])line(c,side*.47,-.1,side*.47,.3,ink,.065);box(c,-.7,-.32,1.4,.3,'#be9767');line(c,-.6,-.2,.6,-.2,'#edd5a7',.045);box(c,-.73,.02,1.46,.2,'#d6b584');
 }else if(p.type==='miami-planter'){
  box(c,-.43,-.1,.86,.33,'#d7c2a1',.1);oval(c,0,-.19,.46,.29,'#579e77');oval(c,-.18,-.37,.24,.25,'#7db487');oval(c,.2,-.35,.28,.2,'#94c997');
 }else if(p.type==='miami-lamp'){
  line(c,0,.16,0,-1.9,'#89a0a0',.065);line(c,0,-1.9,.37,-1.9,'#89a0a0',.065);box(c,.14,-1.97,.52,.12,'#d1ded0');line(c,.22,-1.82,.56,-1.82,'#fff1c8',.06);
 }else if(p.type==='miami-mooring'){
  c.rotate(p.angle);box(c,-.35,-.16,p.length+.35,.32,'#c5ab7e');line(c,-.3,-.16,p.length,-.16,'#f0dbad',.04);
  for(let x=.2;x<p.length;x+=.4)line(c,x,-.12,x,.12,'#a58e68',.025);
  for(const b of p.boats){c.save();c.translate(b.depth,b.side);oval(c,.05,.05,.48,.22,'#337c8f22');shape(c,[[-.5,-.23],[.37,-.23],[.65,0],[.37,.23],[-.5,.23]],'#fff3d8');box(c,-.3,-.17,.58,.34,'#b5cfd0');box(c,-.16,-.13,.3,.26,'#4d8fa5');line(c,b.depth?-.1:0,0,-.1,-.6,'#647e84',.035);c.restore();}
 }
 c.restore();
}
export function drawRiverBridge(c,b){
 const left=b.x-b.width/2,right=b.x+b.width/2,top=b.y-b.length/2,bottom=b.y+b.length/2;
 c.save();box(c,left,top,b.width,b.length,'#839799',0);
 box(c,left+.22,top,1.05,b.length,'#e5dfc9',0);box(c,right-1.27,top,1.05,b.length,'#e5dfc9',0);
 for(const y of [top+.1,b.y-.07,bottom-.13])line(c,left+1.3,y,right-1.3,y,'#475e69',.065);
 for(let y=top+.35;y<bottom;y+=.36){line(c,left+1.4,y,right-1.4,y,'#b6c7c0',.02);line(c,left+.1,y,left+.19,y,'#dae8dc',.05);line(c,right-.19,y,right-.1,y,'#dae8dc',.05);}
 for(const x of [left+.17,right-.17]){line(c,x,top,x,bottom,'#becfc8',.07);for(const y of [top-.2,bottom-.2]){box(c,x-.27,y,.54,.65,'#bdc7b9');oval(c,x,y+.1,.14,.14,'#66858b');}}
 for(const x of [left+.7,right-.7]){box(c,x-.2,top-.65,.4,.42,'#899f99');oval(c,x,top-.49,.06,.06,'#9bd59e');}
 c.restore();
}
