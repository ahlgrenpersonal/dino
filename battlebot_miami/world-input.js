// Adventure's tap-to-walk and twenty-pixel press-drag steering.
export function bindWorldNavigation(canvas,{point,paused,tap,move}){
 const events=new AbortController(),options={signal:events.signal};let pointer=null,previous,steering=false;
 canvas.addEventListener('pointerdown',e=>{
  if(paused()||(e.pointerType==='mouse'&&e.button!==0)||pointer!==null)return;
  e.preventDefault();canvas.focus({preventScroll:true});pointer=e.pointerId;previous={x:e.clientX,y:e.clientY};
  steering=tap(point(e))!==false;canvas.setPointerCapture(e.pointerId);
 },options);
 canvas.addEventListener('pointermove',e=>{
  if(e.pointerId!==pointer||!steering||paused()||Math.hypot(e.clientX-previous.x,e.clientY-previous.y)<20)return;
  e.preventDefault();move(point(e));previous={x:e.clientX,y:e.clientY};
 },options);
 for(const type of ['pointerup','pointercancel','lostpointercapture'])canvas.addEventListener(type,e=>{if(e.pointerId===pointer){pointer=null;steering=false;}},options);
 return ()=>events.abort();
}
