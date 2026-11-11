// Readable toy projectiles and attack cues; these drawings do not change damage.
const ink='#244353';
function line(c,p,color,w){c.beginPath();p.forEach(([x,y],i)=>i?c.lineTo(x,y):c.moveTo(x,y));c.strokeStyle=color;c.lineWidth=w;c.lineCap='round';c.lineJoin='round';c.stroke();}
function shape(c,p,color,stroke=ink,w=.035){c.beginPath();p.forEach(([x,y],i)=>i?c.lineTo(x,y):c.moveTo(x,y));c.closePath();c.fillStyle=color;c.fill();if(stroke){c.strokeStyle=stroke;c.lineWidth=w;c.stroke();}}
function oval(c,x,y,rx,ry,color,stroke=null,w=.035){c.beginPath();c.ellipse(x,y,rx,ry,0,0,Math.PI*2);c.fillStyle=color;c.fill();if(stroke){c.strokeStyle=stroke;c.lineWidth=w;c.stroke();}}
function star(c,r,color){shape(c,Array.from({length:10},(_,i)=>{const a=i*Math.PI/5,radius=i%2?r*.45:r;return [Math.cos(a)*radius,Math.sin(a)*radius];}),color);}
export function drawProjectile(c,q,t,color){
 c.save();c.translate(q.x,q.y);c.rotate(q.angle);
 if(['firejet','metro','rocket','twinrockets','supernova'].includes(q.weapon)){
  shape(c,[[-.45,-.13],[-.9,0],[-.45,.13]],'#ffb95e',null);shape(c,[[-.42,-.06],[-.72,0],[-.42,.06]],'#fff3b6',null);
  shape(c,[[-.46,-.11],[.08,-.11],[.3,0],[.08,.11],[-.46,.11]],q.weapon==='firejet'?'#83e8f4':'#f5d78b');
  shape(c,[[.04,-.13],[.32,0],[.04,.13]],'#f77e60');
  for(const s of [-1,1])shape(c,[[-.35,s*.1],[-.5,s*.27],[-.12,s*.1]],'#79ccdc');
  oval(c,-.36,0,.07,.07,'#e7ffff');if(q.weapon==='supernova'){c.translate(-.08,0);star(c,.13,'#fff3b8');}
  if(q.weapon==='metro'){for(const x of [-.65,-.83]){c.beginPath();c.arc(x,0,.24,-.8,.8);c.strokeStyle='#f8a9d4';c.lineWidth=.04;c.stroke();}}
 }else if(q.weapon==='bubble'){oval(c,0,0,.28,.28,'#aff9ff7a','#edffff',.05);oval(c,-.09,-.1,.075,.075,'#fff');c.beginPath();c.arc(0,0,.21,0,1.4);c.strokeStyle='#f8bde5';c.lineWidth=.05;c.stroke();}
 else if(q.weapon==='tide'||q.weapon==='boomerang'){c.rotate(t*22);for(let i=0;i<3;i++){c.rotate(Math.PI*2/3);shape(c,[[0,0],[.07,-.36],[.28,-.21],[.13,-.17],[.11,.04]],q.weapon==='tide'?'#8cf1e1':'#edf8ea');}oval(c,0,0,.095,.095,'#ffdf82',ink);}
 else if(q.weapon==='frost'){oval(c,0,0,.25,.25,'#b6f7ff55');for(let i=0;i<3;i++){c.rotate(Math.PI/3);line(c,[[0,-.24],[0,.24]],'#efffff',.06);for(const s of [-1,1])line(c,[[-.08,s*.12],[0,s*.2],[.08,s*.12]],'#81ddf5',.04);}}
 else if(q.weapon==='drone'||q.weapon==='swarm'){oval(c,0,0,.2,.16,'#f8da83',ink);for(const s of [-1,1]){line(c,[[s*.1,-.05],[s*.28,-.17]],'#a6e2e8',.05);oval(c,s*.28,-.18,.14,.04,'#ddffff');oval(c,s*.07,-.025,.035,.04,'#274e65');}}
 else if(q.weapon==='meteor'){shape(c,[[-.15,-.15],[-.8,-.1],[-.5,.05],[-.8,.17],[-.1,.19]],'#ffb66b',null);shape(c,[[-.2,-.16],[.07,-.23],[.23,-.04],[.16,.21],[-.12,.21],[-.27,.02]],'#b98763');oval(c,.05,-.03,.075,.06,'#f9cf83');}
 else if(q.weapon==='neon'){shape(c,[[-.33,-.2],[-.12,-.13],[0,-.25],[.12,-.13],[.33,-.2],[.18,.11],[0,.2],[-.18,.11]],'#fa95dc');line(c,[[-.1,0],[.1,0]],'#f0fff8',.04);}
 else if(q.weapon==='vine'){shape(c,[[-.35,0],[-.1,-.18],[.25,-.04],[.1,.2]],'#b5e38c');line(c,[[-.25,0],[.15,0]],'#ebffc9',.06);}
 else if(q.weapon==='prism'){shape(c,[[-.3,0],[0,-.18],[.35,0],[0,.18]],'#d3bcff');line(c,[[-.2,0],[.25,0]],'#fffaff',.07);}
 else{line(c,[[-.4,0],[.1,0]],q.enemy?'#ffb995':color,.16);oval(c,.08,0,.13,.11,'#fff7d3',ink,.025);}
 c.restore();
}
export function drawAttackEffect(c,f,alpha){
 if(f.type==='beam'){
  const id=f.weapon||'',dx=f.tx-f.x,dy=f.ty-f.y,d=Math.hypot(dx,dy),a=Math.atan2(dy,dx);c.save();c.translate(f.x,f.y);c.rotate(a);
  if(['bumper','saw','hammer','drum','gravity'].includes(id)){
   c.translate(d,0);const r=(1-alpha)*.8+.2;c.beginPath();c.ellipse(0,0,r,r*.65,0,0,Math.PI*2);c.strokeStyle=f.color;c.lineWidth=.12;c.stroke();for(const s of [-1,1])line(c,[[s*.12,-.35],[s*.32,-.55]],'#fff0bd',.08);
  }else if(['vine','lightning'].includes(id)){const points=[[0,0]];for(let x=.3,i=0;x<d;x+=.3,i++)points.push([x,i%2?-.18:.18]);points.push([d,0]);line(c,points,f.color,.15);line(c,points,'#fffde0',.045);}
  else if(id==='flame'){shape(c,[[.3,-.13],[d*.65,-.45],[d,-.14],[d+.25,0],[d,.2],[d*.65,.45],[.3,.13]],'#ffb45a99',null);line(c,[[.2,0],[d,0]],'#fff0a2',.12);}
  else{line(c,[[0,0],[d,0]],f.color,.23);line(c,[[0,0],[d,0]],'#fffbe8',.075);if(['prism','crystalbeam'].includes(id))for(const s of [-1,1])line(c,[[0,s*.08],[d,s*.08]],s<0?'#a5f6fa':'#f6b9f2',.04);}
  c.restore();
 }else{const r=(1-alpha)*2+.3;c.beginPath();c.arc(f.x,f.y,r,0,Math.PI*2);c.strokeStyle=f.color;c.lineWidth=f.type==='warning'?.08:.16;if(f.type==='warning')c.setLineDash([.15,.15]);c.stroke();c.setLineDash([]);}
}
