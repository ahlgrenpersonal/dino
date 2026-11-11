// Literal, shared parts: the workshop prize is the same part fitted to the bot.
const ink='#152f3d';
function line(c,x,y,xx,yy,color,w=2){c.beginPath();c.moveTo(x,y);c.lineTo(xx,yy);c.strokeStyle=color;c.lineWidth=w;c.lineCap='round';c.stroke();}
function box(c,x,y,w,h,r,color,stroke=ink,l=2){c.beginPath();c.roundRect(x,y,w,h,r);c.fillStyle=color;c.fill();if(stroke){c.strokeStyle=stroke;c.lineWidth=l;c.stroke();}}
function oval(c,x,y,rx,ry,color,stroke=ink,w=2){c.beginPath();c.ellipse(x,y,rx,ry,0,0,Math.PI*2);c.fillStyle=color;c.fill();if(stroke){c.strokeStyle=stroke;c.lineWidth=w;c.stroke();}}
function shape(c,p,color,stroke=ink,w=2){c.beginPath();p.forEach(([x,y],i)=>i?c.lineTo(x,y):c.moveTo(x,y));c.closePath();c.fillStyle=color;c.fill();if(stroke){c.strokeStyle=stroke;c.lineWidth=w;c.stroke();}}
function bolt(c,x,y,s,color='#fff7c2'){shape(c,[[x+2,y-s/2],[x-s*.3,y+2],[x,y+2],[x-2,y+s/2],[x+s*.3,y-3],[x,y-3]],color,null);}
function metal(c,x,y,w,h,color='#9bbac8'){const g=c.createLinearGradient(x,y,x+w,y+h);g.addColorStop(0,'#effaff');g.addColorStop(.25,color);g.addColorStop(.7,color);g.addColorStop(1,'#466879');return g;}
function screw(c,x,y){oval(c,x,y,1.7,1.7,'#f7e5b3',ink,.7);line(c,x-1,y,x+1,y,'#587584',.6);}
export function armorArt(c,id,livery){
 const colors={light:'#83cfaa',steel:'#a7bdcb',heavy:'#f0bf59',reflect:'#8febf3',bastion:'#5c90b5',polar:'#c2efff',star:'#f8d36b','grove-shell':'#79c79b'},col=livery?.armor||colors[id]||colors.light;
 // Shoulder plates and a recessed neck make this read as robot armor, not a badge.
 shape(c,[[-20,-20],[-9,-25],[-6,-18],[6,-18],[9,-25],[20,-20],[24,8],[14,22],[0,28],[-14,22],[-24,8]],metal(c,-23,-25,46,53,col));
 for(const s of [-1,1]){shape(c,[[s*15,-22],[s*28,-19],[s*29,-3],[s*20,1]],col);line(c,s*20,-17,s*24,-16,'#ffffffaa',2);screw(c,s*24,-7);}
 shape(c,[[-15,-13],[0,-16],[15,-13],[14,6],[0,20],[-14,6]],col);
 line(c,-11,-10,0,-13,'#ffffffa8',2);line(c,-11,10,0,23,'#294e6344',3);
 if(id==='grove-shell'){shape(c,[[0,-15],[12,-4],[7,12],[0,20],[-10,6],[-11,-5]],'#d8eea5');line(c,0,-10,0,14,'#407c60',2);for(const y of [-3,4,10]){line(c,0,y,-6,y-4,'#407c60',1.3);line(c,0,y,6,y-4,'#407c60',1.3);}}
 else if(id==='heavy'){for(const x of [-12,0,12])box(c,x-4,-29,8,10,2,'#ffdb77');bolt(c,0,1,26,'#6b5334');}
 else if(id==='bastion'){for(const x of [-18,0,18])box(c,x-5,-30,10,12,1,'#bfd8e9');box(c,-12,-7,24,14,3,'#365d82');line(c,-9,0,9,0,'#ffe696',4);}
 else if(id==='polar'){for(let i=0;i<3;i++){c.save();c.rotate(i*Math.PI/3);line(c,0,-12,0,13,'#3384ae',2.7);for(const s of [-1,1]){line(c,0,s*8,-4,s*4,'#3384ae',1.5);line(c,0,s*8,4,s*4,'#3384ae',1.5);}c.restore();}for(const s of [-1,1])shape(c,[[s*20,-20],[s*26,-33],[s*30,-18]],'#d9fbff');}
 else if(id==='star'){shape(c,Array.from({length:10},(_,i)=>{const a=i*Math.PI/5-Math.PI/2,r=i%2?6:14;return [Math.cos(a)*r,Math.sin(a)*r];}),'#fff9d9','#a66d2e',1.4);}
 else if(id==='reflect'){shape(c,[[-12,-11],[5,-14],[14,3],[0,16],[-12,5]],'#d7fbff','#548da7',1.2);line(c,-8,-9,6,6,'#fff',4);line(c,2,-10,10,0,'#fff',2);}
 else{bolt(c,0,1,24,'#345a70');for(const x of [-13,13])for(const y of [-10,9])screw(c,x,y);}
}
export function wheelArt(c,id,t=0){
 c.save();c.lineJoin='round';
 if(id==='treads'){
  box(c,-25,-16,50,34,13,'#617d85',ink,3);box(c,-20,-11,40,24,10,'#213c50');
  for(const x of [-14,0,14]){oval(c,x,1,7,9,'#344c5b');oval(c,x,1,3,4,'#efca74');}
  for(const x of [-12,-6,0,6,12]){box(c,x-1.5,-14,3,3,1.2,'#bacac8',null);box(c,x-1.5,13,3,3,1.2,'#bacac8',null);}
  for(const x of [-22,22])for(const y of [-5,2,9])box(c,x-1,y-1,2,3,1,'#bacac8',null);c.restore();return;
 }
 if(id==='hover'){
  box(c,-16,-24,32,33,9,metal(c,-16,-24,32,33,'#d1e8ec'));box(c,-12,-19,24,15,5,'#315369');
  for(const x of [-7,0,7])line(c,x,-16,x,-7,'#6bf5ec',2);
  shape(c,[[-12,6],[12,6],[18,17],[-18,17]],'#668b9f');oval(c,0,16,17,5,'#203e57');oval(c,0,17,11,3,'#b9ffff',null);
  shape(c,[[-10,20],[0,32],[10,20],[5,30],[0,37],[-5,30]],'#62dff4',null);shape(c,[[-4,20],[0,31],[4,20]],'#edffff',null);c.restore();return;
 }
 if(id==='boardwalk'){
  box(c,-25,-8,50,16,5,'#ed83bb');line(c,-20,-6,18,-6,'#ffe7af',3);line(c,-20,7,20,7,'#79dacb',5);
  for(const x of [-15,15]){oval(c,x,16,10,11,'#16384b');oval(c,x,16,7,8,'#81ecd8');oval(c,x,16,3,3,'#fce4a3');}screw(c,-16,-1);screw(c,16,-1);c.restore();return;
 }
 const chunky=['grip','rover'].includes(id),fat=id==='balloon',r=id==='rover'?24:fat?24:21,hub=id==='speed'?'#4db7ff':id==='grip'?'#8cda83':id==='rover'?'#ffd16e':fat?'#f5d58c':'#bdd5de';
 oval(c,3,3,r,r,'#101e2a');oval(c,0,0,r,r,fat?'#63bfc3':'#293b49','#102632',2.5);
 if(chunky)for(let i=0;i<10;i++){c.save();c.rotate(i*Math.PI/5);box(c,-5,-r-2,10,7,2,'#526875',ink,1.4);c.restore();}
 else for(let i=0;i<12;i++){const a=i*Math.PI/6;line(c,Math.cos(a)*(r-4),Math.sin(a)*(r-4),Math.cos(a)*r,Math.sin(a)*r,fat?'#729296':'#70838b',2.5);}
 oval(c,-1,-1,r-7,r-7,hub);oval(c,-1,-1,r-11,r-11,id==='grip'?'#407744':'#26485e');
 for(let i=0;i<(id==='speed'?3:5);i++){const a=i*Math.PI*2/(id==='speed'?3:5)+t*2;line(c,-1,-1,-1+Math.cos(a)*(r-9),-1+Math.sin(a)*(r-9),id==='speed'?'#fff1a0':'#d9f0e9',id==='speed'?3:2.5);}
 oval(c,-1,-1,4,4,hub);oval(c,-2,-2,1.5,1.5,'#fff5d1',null);c.beginPath();c.arc(-1,-1,r-4,Math.PI*1.12,Math.PI*1.7);c.strokeStyle='#d4e7e64d';c.lineWidth=2;c.stroke();
 if(id==='speed'){for(const [x,y,length] of [[-36,-6,7],[-38,1,10],[-34,8,6]])line(c,x,y,x+length,y,'#6bdcf5',2.5);}
 c.restore();
}
export function mobilityIcon(c,id,t=0){
 if(id==='treads'){c.save();c.translate(0,2);c.scale(1.1,1.1);wheelArt(c,id,t);c.restore();return;}
 if(['basic','grip','speed','rover','balloon'].includes(id)){
  c.save();c.translate(-13,-10);c.scale(.65,.65);wheelArt(c,id,t);c.restore();
  line(c,-13,-10,10,7,'#a5c8d2',7);line(c,-13,-11,10,6,'#e9f2cc',2);
  c.save();c.translate(9,6);wheelArt(c,id,t);c.restore();return;
 }
 line(c,-20,5,20,5,'#b9d3d9',7);line(c,-20,3,20,3,'#fff5ce',2);
 for(const side of [-1,1]){c.save();c.translate(side*17,4);c.scale(.64,.64);wheelArt(c,id,t);c.restore();}
}
function shield(c,advanced){oval(c,0,0,27,29,'#60bfff22','#a3f8ff',2);shape(c,[[-17,-18],[0,-24],[17,-18],[15,6],[0,23],[-15,6]],advanced?'#f7d56e':'#8bdce5');if(advanced){shape(c,[[0,-13],[4,-3],[14,-3],[6,4],[9,15],[0,9],[-9,15],[-6,4],[-14,-3],[-4,-3]],'#fff9d4','#966e35',1.2);}else{line(c,-10,-13,9,8,'#efffff',4);oval(c,-16,-20,4,4,'#efffff',null);}}
export function gadgetArt(c,id,t=0){
 c.save();c.lineJoin='round';
 if(id==='shield'||id==='aegis')shield(c,id==='aegis');
 else if(id==='magnet'){c.beginPath();c.moveTo(-17,-21);c.lineTo(-17,3);c.bezierCurveTo(-17,25,17,25,17,3);c.lineTo(17,-21);c.strokeStyle=ink;c.lineWidth=14;c.stroke();c.strokeStyle='#ef726c';c.lineWidth=10;c.stroke();box(c,-23,-25,12,13,2,'#91dcfa');box(c,11,-25,12,13,2,'#ffe8b0');for(const s of [-1,1]){line(c,s*14,-31,s*10,-35,'#ffda75',2);line(c,s*23,-30,s*29,-33,'#ffda75',2);}}
 else if(id==='repair'){
  box(c,-21,-7,27,29,6,'#65c9af');box(c,-16,-2,17,17,3,'#244b60');bolt(c,-7,6,16);c.beginPath();c.moveTo(6,10);c.bezierCurveTo(32,13,22,-16,12,-16);c.strokeStyle=ink;c.lineWidth=7;c.stroke();c.strokeStyle='#f2d27b';c.lineWidth=4;c.stroke();box(c,3,-25,18,13,3,'#e6f9eb');for(const x of [7,16])line(c,x,-25,x,-32,'#bbd9df',3);
 }
 else if(id==='vacuum'){
  box(c,-20,-15,29,35,8,'#7dbbb8');box(c,-16,-11,21,12,3,'#294c60');for(const x of [-12,-5,2])line(c,x,-8,x,-2,'#c7f5ef',2);for(const x of [-13,3])oval(c,x,20,5,5,'#213d4f');c.beginPath();c.moveTo(8,-5);c.bezierCurveTo(35,-30,31,14,17,15);c.strokeStyle=ink;c.lineWidth=9;c.stroke();c.strokeStyle='#e1c17c';c.lineWidth=5;c.stroke();shape(c,[[14,11],[24,11],[29,25],[7,25]],'#cee8e6');line(c,11,22,25,22,'#507783',2);
 }
 else if(id==='buddy'||id==='scout'){
  if(id==='scout'){line(c,0,-12,0,-26,'#b5d2da',4);oval(c,0,-27,30,4,'#ffdd7e');oval(c,0,-27,4,5,'#d8f4e9');}
  else for(const side of [-1,1]){line(c,side*8,-9,side*23,-19,'#adcbd3',4);oval(c,side*23,-20,11,3,'#b5f1ea');}
  box(c,-14,-13,28,29,9,id==='scout'?'#87dfd6':'#f2c862');box(c,-10,-8,20,12,4,'#244962');for(const x of [-5,5])oval(c,x,-2,2.6,3,'#e7ffff',null);line(c,-5,10,5,10,'#fff5bd',2);for(const s of [-1,1])line(c,s*9,15,s*15,20,'#adcbd3',3);
  if(id==='scout')line(c,-8,21,8,21,'#aee3dd',3);
 }
 else if(id==='quick-coil'){
  box(c,-11,-28,22,55,6,'#355f79');box(c,-18,-27,36,8,3,'#9bdadf');box(c,-18,19,36,8,3,'#9bdadf');for(let y=-17;y<20;y+=8){c.beginPath();c.ellipse(0,y,21,7,-.12,0,Math.PI*2);c.strokeStyle=ink;c.lineWidth=7;c.stroke();c.strokeStyle='#f5c668';c.lineWidth=4;c.stroke();}bolt(c,0,-1,29);
 }
 else if(id==='spark-cell'||id==='capacitor'){
  const wide=id==='capacitor';box(c,wide?-21:-13,-23,wide?42:26,47,6,wide?'#e7b74d':'#f2b45f');
  if(wide){for(const x of [-12,12])box(c,x-4,-31,8,8,1,'#cce7e6');for(const x of [-12,12])box(c,x-6,-17,12,34,3,'#ffe9a8',null);}
  else{box(c,-6,-30,12,7,2,'#d5eeed');box(c,-9,-18,18,34,4,'#fff1bb',null);}
  bolt(c,0,0,33,wide?'#fffde5':'#c67c3c');line(c,-8,20,8,20,'#ffe8a2',2);
 }
 else{box(c,-22,-19,44,40,7,'#5c8790');box(c,-16,-8,32,23,4,'#2f4c60');line(c,-14,-5,14,-5,'#a6dfd5',2);line(c,3,-21,3,-9,'#efcd78',5);oval(c,3,-25,6,6,'#e5d091');box(c,-6,-31,7,8,1,'#254657',null);}
 c.restore();
}
