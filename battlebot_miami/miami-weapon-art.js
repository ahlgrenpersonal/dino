// Miami rewards use the same artwork in the workshop, on bots and in celebrations.
const ink='#20363a';
function box(c,x,y,w,h,r,color){c.beginPath();c.roundRect(x,y,w,h,r);c.fillStyle=color;c.fill();c.strokeStyle=ink;c.lineWidth=2.5;c.stroke();}
function shape(c,points,color){c.beginPath();points.forEach(([x,y],i)=>i?c.lineTo(x,y):c.moveTo(x,y));c.closePath();c.fillStyle=color;c.fill();c.strokeStyle=ink;c.lineWidth=2;c.stroke();}
function oval(c,x,y,rx,ry,color){c.beginPath();c.ellipse(x,y,rx,ry,0,0,Math.PI*2);c.fillStyle=color;c.fill();c.strokeStyle=ink;c.lineWidth=2;c.stroke();}
function line(c,x,y,tx,ty,color,w=3){c.beginPath();c.moveTo(x,y);c.lineTo(tx,ty);c.strokeStyle=color;c.lineWidth=w;c.stroke();}
export function miamiWeapon(c,id,t=0,action=0){
 if(typeof id!=='string'||!id.startsWith('miami-'))return false;
 c.save();c.lineJoin='round';c.lineCap='round';
 if(id==='miami-bubble'){
  // A round soap reservoir and an open bubble wand, rather than a gun barrel.
  box(c,10,-5,22,16,5,'#48acb2');oval(c,19,-10,12,14,'#b5f4ff');
  line(c,12,-14,22,-18,'#fff9da',3);box(c,20,10,9,11,3,'#f0bd67');
  line(c,29,0,42,0,'#e8e6b8',7);oval(c,49,0,10,13,'#e4fff7');oval(c,49,0,6,9,'#5aa7af');
  for(const [x,y,r] of [[37,-19,4],[53,-22,6],[62,-11,3]])oval(c,x,y,r,r,'#c9faff');
 }else if(id==='miami-neon'){
  // The forked bat-wing silhouette previews the vampire's energy bolts.
  box(c,9,-8,21,16,4,'#a34c8d');box(c,17,8,8,13,2,'#5d486b');
  shape(c,[[24,-8],[34,-25],[45,-13],[60,-19],[51,-2],[34,0]],'#f58dce');
  shape(c,[[24,8],[34,25],[45,13],[60,19],[51,2],[34,0]],'#e6a2ef');
  line(c,32,0,59,0,'#bffff2',5);oval(c,24,0,5,5,'#fff3b6');
 }else if(id==='miami-rumba'){
  c.rotate(-.22+Math.sin(action*Math.PI)*.8);
  box(c,6,-4,35,8,3,'#b78955');
  // A big striped conga drum on a mallet handle: a close-range shockwave.
  shape(c,[[32,-21],[55,-18],[53,19],[34,22]],'#e99c5a');
  for(const x of [37,44,51])line(c,x,-17,x-1,18,'#f8df88',3);
  oval(c,44,-19,15,7,'#fff0b6');oval(c,44,20,12,5,'#62b5aa');
  for(const y of [-10,9])line(c,33,y,55,y,'#426e71',3);
 }else if(id==='miami-mangrove'){
  // A branching living staff with leaves and a glowing lightning crystal.
  line(c,10,12,37,-3,'#9c764a',9);line(c,34,-2,45,-20,'#718e50',7);
  line(c,31,-1,49,15,'#718e50',6);
  shape(c,[[35,-12],[23,-26],[37,-23],[44,-14]],'#75c884');
  shape(c,[[42,8],[57,7],[52,20],[45,17]],'#a8d970');
  shape(c,[[43,-23],[53,-31],[61,-19],[54,-5],[45,-10]],'#c4a5ff');
  line(c,52,-23,49,-16,'#fff4b9',3);line(c,49,-16,56,-16,'#fff4b9',3);line(c,56,-16,51,-9,'#fff4b9',3);
 }else if(id==='miami-tidal'){
  // A wide crescent of surf fins spins through a row of monsters.
  box(c,9,-6,23,12,4,'#388e96');c.translate(42,0);c.rotate(t*.5);
  for(let i=0;i<3;i++){c.rotate(Math.PI*2/3);shape(c,[[0,-2],[5,-25],[18,-17],[11,-14],[9,2]],'#98ede3');line(c,6,-6,8,-18,'#f4fff0',2);}
  oval(c,0,0,8,8,'#f5d479');oval(c,0,0,3,3,'#3c87a0');
 }else if(id==='miami-bass'){
  // The speaker cone and visible rocket make the splash launcher recognizable.
  box(c,7,-20,29,40,5,'#4d577b');oval(c,21,2,11,14,'#263b53');oval(c,21,2,6,8,'#dd8bbe');
  for(const x of [13,21,29])oval(c,x,-13,2,2,'#ffde76');
  box(c,32,-10,19,20,3,'#e3b665');shape(c,[[45,-8],[62,0],[45,8]],'#ff8e63');
  shape(c,[[42,-7],[34,-17],[48,-9],[48,9],[34,17],[42,7]],'#81dadd');
 }else if(id==='miami-prism'){
  // A single giant faceted crystal and crown distinguish the beam reward.
  box(c,9,-6,20,12,3,'#b4a2d4');
  shape(c,[[23,0],[35,-19],[50,-15],[64,0],[50,15],[35,19]],'#c6b3f4');
  shape(c,[[23,0],[42,-7],[64,0],[42,7]],'#e9faff');
  line(c,35,-19,42,-7,'#8967bb',2);line(c,35,19,42,7,'#8967bb',2);
  shape(c,[[28,-17],[25,-29],[34,-24],[39,-33],[45,-24],[52,-27],[49,-16]],'#ffe09c');
  oval(c,39,-24,3,3,'#71d8df');
 }
 c.restore();return true;
}
