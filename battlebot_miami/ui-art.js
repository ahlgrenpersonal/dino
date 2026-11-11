import {AREAS,LANDMARKS,WEAPONS,weaponFor,HOME,KEY_LOOP} from './world.js?v=world19';
import {drawLandmark} from './landmark-art.js?v=world19';
import {bot,weapon,equipmentIcon,categoryIcon} from './bot-art.js?v=world19';
import {MiamiPainter} from './painter.js?v=world19';
export const AREA_PICTURES=['panorama','key-park','domino','dinner-key','cape-florida','skyviews','frost','south-of-fifth'];
function start(canvas){const c=canvas.getContext('2d');c.setTransform(1,0,0,1,0,0);c.clearRect(0,0,canvas.width,canvas.height);c.showLabels=false;return c;}
export function placePicture(canvas,place){const c=start(canvas),w=canvas.width,h=canvas.height,l=typeof place==='string'?LANDMARKS.find(l=>l.id===place):place;if(!l)return;c.save();const tall=['home','lighthouse'].includes(l.kind),scale=Math.min(w/(tall?7:10),h/(tall?14:8));c.translate(w/2,h*(tall?.78:.59));c.scale(scale,scale);c.translate(-l.x,-l.y);MiamiPainter.prototype.landmark.call({},c,l,0,{discoveries:[]});c.restore();}
export function areaPicture(canvas,r){
 if(r!==1)return placePicture(canvas,AREA_PICTURES[r]);
 const c=start(canvas),s=Math.min(canvas.width/74,canvas.height/51);c.save();c.translate(canvas.width/2,canvas.height/2);c.scale(s,s);c.translate(-96,-80);
 for(const a of AREAS.slice(0,2)){c.beginPath();a.polys[0].forEach(([x,y],i)=>i?c.lineTo(x,y):c.moveTo(x,y));c.closePath();c.fillStyle=a.color;c.fill();}
 c.beginPath();[{x:104,y:77},{x:111,y:79},{x:117,y:78}].forEach((p,i)=>i?c.lineTo(p.x,p.y):c.moveTo(p.x,p.y));c.strokeStyle='#f7deb0';c.lineWidth=2;c.stroke();
 c.beginPath();KEY_LOOP.forEach((p,i)=>i?c.lineTo(p.x,p.y):c.moveTo(p.x,p.y));c.lineWidth=1.3;c.stroke();MiamiPainter.prototype.landmark.call({},c,LANDMARKS.find(l=>l.id==='panorama'),0,{discoveries:[]});c.restore();
}
export function enemyPicture(canvas,r,{peacock=false}={}){const c=start(canvas);c.save();c.translate(canvas.width/2,canvas.height*.63);const s=Math.min(canvas.width,canvas.height)/(peacock?1.6:2.7);c.scale(s,s);MiamiPainter.prototype.actor.call({reducedMotion:true},c,{area:r,x:0,y:0,hp:100,maxHp:100,boss:!peacock,king:r===7,peacock,angle:0},0);c.restore();}
export function weaponPicture(canvas,id){const c=start(canvas);c.save();const scale=Math.min(canvas.width/85,canvas.height/90);c.translate(canvas.width/2-34*scale,canvas.height*.57);c.scale(scale,scale);weapon(c,weaponFor(id).art,0,id==='firejet'?.25:0);c.restore();}
export function robotPicture(canvas,save){const c=start(canvas);bot(c,canvas.width/2,canvas.height*.58,Math.min(canvas.width,canvas.height)*.73,{color:save.color,gun:weaponFor(save.weapon).art,armor:save.build?.armor||['light','steel','heavy'][save.armor],wheels:save.build?.wheels||['basic','grip','speed'][save.wheels],gadget:save.build?.gadget,reducedMotion:true});}
export function categoryPicture(canvas,type,level){const c=start(canvas);c.save();c.translate(canvas.width*.08,canvas.height*.08);c.scale(canvas.width/80,canvas.height/80);equipmentIcon(c,type,type==='armor'?['light','steel','heavy'][level]:['basic','grip','speed'][level]);c.restore();}
export function paintPictures(root,save){
 for(const el of root.querySelectorAll('canvas[data-equipment]')){const c=start(el);c.save();c.scale(el.width/68,el.height/68);equipmentIcon(c,el.dataset.type,el.dataset.equipment);c.restore();}
 for(const el of root.querySelectorAll('canvas[data-place]'))placePicture(el,el.dataset.place);
 for(const el of root.querySelectorAll('canvas[data-area]'))areaPicture(el,Number(el.dataset.area));
 for(const el of root.querySelectorAll('canvas[data-enemy]'))enemyPicture(el,Number(el.dataset.enemy));
 for(const el of root.querySelectorAll('canvas[data-weapon]'))weaponPicture(el,el.dataset.weapon);
 for(const el of root.querySelectorAll('canvas[data-robot]'))robotPicture(el,save);
 for(const el of root.querySelectorAll('canvas[data-category]')){const c=start(el);c.save();c.scale(el.width/44,el.height/36);categoryIcon(c,el.dataset.category);c.restore();}
}
