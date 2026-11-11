// A mechanical peacock with a blue neck, metal wheels and an unmistakable eyespot fan.
export function peacock(c,x,y,size,t=0,{hit=0,moving=false}={}){
 c.save();c.translate(x,y);c.scale(size/80,size/80);c.lineJoin='round';c.lineCap='round';
 const oval=(x,y,rx,ry,color)=>{c.beginPath();c.ellipse(x,y,rx,ry,0,0,Math.PI*2);c.fillStyle=color;c.fill();};
 const line=(x,y,xx,yy,color,width)=>{c.beginPath();c.moveTo(x,y);c.lineTo(xx,yy);c.strokeStyle=color;c.lineWidth=width;c.stroke();};
 oval(0,27,31,8,'#214b4530');
 for(let i=0;i<9;i++){const a=-Math.PI+(i+.5)*Math.PI/9,fx=Math.cos(a)*34,fy=Math.sin(a)*37-3;c.save();c.translate(fx,fy);c.rotate(a+Math.PI/2);oval(0,0,11,20,hit?'#fff7c7':i%2?'#43b499':'#71bf80');oval(0,-5,7,10,'#d2df7a');oval(0,-6,4.7,7,'#299899');oval(0,-6,2.8,4.8,'#244c91');line(0,8,0,19,'#3b9076',1.7);c.restore();}
 for(const side of [-1,1]){oval(side*18,25,7,9,'#284550');oval(side*18,25,3,4,'#a7c4bf');line(side*13,18,side*18,23,'#e1ca89',3);}
 oval(0,11,22,18,hit?'#fff2c7':'#438fc0');oval(-5,12,12,10,'#65b1bd');
 c.beginPath();c.moveTo(5,12);c.bezierCurveTo(20,-2,-1,-13,9,-25);c.strokeStyle='#2f75b4';c.lineWidth=13;c.stroke();
 oval(11,-24,11,9,'#458fc4');oval(14,-26,4.5,4.5,'#fff3d8');oval(16,-26,2.3,2.6,'#244653');
 c.beginPath();c.moveTo(20,-25);c.lineTo(31,-21);c.lineTo(20,-18);c.closePath();c.fillStyle='#f4c66f';c.fill();
 for(let i=0;i<3;i++){line(7+i*4,-31,3+i*6,-40,'#2d6c9d',2);oval(3+i*6,-40,3,4,'#8bddd2');}
 for(const [rx,ry] of [[-10,7],[2,16],[10,9]])oval(rx,ry,2,2,'#d4ebd1');
 if(moving)line(-19,30,-26-Math.sin(t*10)*3,30,'#6b8582',2);
 c.restore();
}
