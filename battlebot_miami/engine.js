import {AREAS,HOME,weaponFor,dist,regionAt,canWalk,pathfind,visibleAreas,FINAL_AREA,allBossesCleared,isPrivate,safeAt,visibleLandmarks,EQUIPMENT,item,available,equipmentStats,CHARGING_STATIONS,HOME_SAFE_RADIUS,nextChapter} from './world.js?v=world17';
export const AUTO_DAMAGE=.6,TAP_DAMAGE=2,TAP_COOLDOWN=1.5;
export class MiamiAdventure{
 constructor(save){this.save=save;this.player={...save.position,hp:save.hp,angle:0,cd:0,hit:0,swing:0,invincible:2};this.time=0;this.paused=false;this.route=[];this.effects=[];this.projectiles=[];this.enemies=[];this.target=null;this.powerCd=0;this.powerTime=0;this.tapCd=0;this.shieldCd=0;this.buddyCd=0;this.powerTarget=null;this.drops=save.drops||[];this.onEvent=()=>{};this.populate();}
 emit(type,data={}){this.onEvent({type,...data});}
 maxHp(){return equipmentStats(this.save).hp;}
 get boostTime(){return this.powerTime;}
 get boostCd(){return this.powerCd;}
 isHome(){return dist(this.player,HOME)<2.2;}
 stationNear(){return CHARGING_STATIONS.find(s=>(this.save.champion||s.area<=this.save.unlocked)&&dist(this.player,s)<1.1);}
 repair(){if(this.isHome()){this.player.hp=this.maxHp();return true;}const station=this.stationNear();if(!station||this.charging||this.player.hp>=this.maxHp())return false;if(this.save.scrap<2){this.emit('toast',{text:'Charging costs 2 scrap. Home repairs are free.'});return false;}this.save.scrap-=2;this.route=[];this.target=null;this.powerTarget=null;this.charging=station.id;this.emit('charging');return true;}
 upgradeCost(kind){return ['armor','wheels'].includes(kind)&&this.save[kind]<2?(this.save[kind]===0?45:95):null;}
 upgrade(kind){const cost=this.upgradeCost(kind);if(cost===null||this.save.scrap<cost||!this.isHome())return false;this.save.scrap-=cost;this.save[kind]++;const id=(kind==='armor'?['light','steel','heavy']:['basic','grip','speed'])[this.save[kind]];if(!this.save.owned.includes(id))this.save.owned.push(id);this.save.build[kind]=id;this.player.hp=this.maxHp();this.emit('upgrade',{kind});return true;}
 equip(type,id){if(id===undefined){id=type;type='weapon';}if(!this.isHome()||!this.save.owned.includes(id)||!EQUIPMENT[type]?.some(p=>p.id===id))return false;this.save.build[type]=id;if(type==='weapon')this.save.weapon=id;this.player.hp=this.maxHp();this.emit('equip',{type,id});return true;}
 craft(type,id){if(type==='weapon')return false;const p=item(type,id);if(!this.isHome()||p?.id!==id||this.save.owned.includes(id)||!available(this.save,p)||this.save.scrap<p.cost||this.save.gears<p.gears)return false;this.save.scrap-=p.cost;this.save.gears-=p.gears;this.save.owned.push(id);this.equip(type,id);this.emit('crafted',{type,id});return true;}
 inView(e){const b=this.viewBounds;return !b||(e.x>b.left+.35&&e.x<b.right-.35&&e.y>b.top+.5&&e.y<b.bottom-.3);}
 populate(){
  this.enemies=[];
  for(const a of visibleAreas(this.save)){
   if(!a.id)continue;
   for(const [i,c] of a.camps.entries()){
    if(this.save.camps.includes(`camp-${a.id}-${i}`))continue;
    for(let j=0;j<4;j++){const id=`mob-${a.id}-${i}-${j}`;if(this.save.defeated.includes(id))continue;const angle=j*Math.PI/2,hp=a.id===1?13:18+a.id*9,spread=a.id===1?.5:1.15;this.enemies.push({id,area:regionAt(c),chapter:a.id,camp:i,x:c.x+Math.cos(angle)*spread,y:c.y+Math.sin(angle)*spread,home:{...c},hp,maxHp:hp,theme:a.theme,peacock:a.id===3&&j%2===0,cd:1+j*.3,angle:0,hit:0,swing:0});}
   }
   if(!this.save.cleared.includes(`boss-${a.id}`))this.addBoss(a);
  }
 }
 addBoss(a){const hp=a.id===1?90:a.id===FINAL_AREA?780:100+a.id*55;this.enemies.push({id:`boss-${a.id}`,area:a.id,x:a.arena.x,y:a.arena.y,home:{...a.arena},hp,maxHp:hp,boss:true,king:a.id===FINAL_AREA,theme:a.theme,name:a.boss,guardBroken:a.id<6,cd:2,angle:0,hit:0,swing:0});}
 campsIn(r){return AREAS[r].camps.filter((_,i)=>this.save.camps.includes(`camp-${r}-${i}`)).length;}
 awake(e){return visibleAreas(this.save).some(a=>a.id===(e.chapter??e.area))&&(!e.boss||(this.campsIn(e.area)===3&&(!e.king||allBossesCleared(this.save))));}
 clearShot(from,to){const n=Math.max(1,Math.ceil(dist(from,to)*5));for(let i=0;i<=n;i++)if(isPrivate({x:from.x+(to.x-from.x)*i/n,y:from.y+(to.y-from.y)*i/n}))return false;return true;}
 isSafe(p){return safeAt(this.save,p);}
 awardEquipment(type,id){if(!EQUIPMENT[type]?.some(p=>p.id===id)||type==='weapon'||this.save.owned.includes(id))return false;this.save.owned.push(id);const previous=item(type,this.save.build[type]),found=item(type,id);if(type==='armor'?found.hp>previous.hp:type==='wheels'?found.speed>previous.speed||((found.hp||0)>(previous.hp||0)&&found.speed>=previous.speed):this.save.build.gadget==='none')this.save.build[type]=id;this.player.hp=this.maxHp();return true;}
 visitPlaces(){for(const l of visibleLandmarks(this.save)){if(dist(this.player,l)>1.8||this.save.discoveries.includes(l.id))continue;this.save.discoveries.push(l.id);if(l.equipment){if(this.awardEquipment(l.equipment.type,l.equipment.id))this.emit('findEquipment',{id:l.equipment.id,kind:l.equipment.type,place:l.name});}else if(l.stamp){this.save.scrap+=8;this.player.hp=Math.min(this.maxHp(),this.player.hp+20);this.emit('visit',{place:l.name});}}}
 moveTo(p){this.target=null;this.powerTarget=null;this.headingHome=false;this.charging=null;this.route=pathfind(this.save,this.player,p);return this.route.length>0;}
 goArea(r){if(!visibleAreas(this.save).some(a=>a.id===r))return;this.moveTo(r===0?HOME:AREAS[r].entry);}
 goNext(){const a=nextChapter(this.save);if(!a)return;const c=a.camps.find((_,i)=>!this.save.camps.includes(`camp-${a.id}-${i}`));if(c){this.moveTo(c);return;}const boss=this.enemies.find(e=>e.id===`boss-${a.id}`&&e.hp>0);if(boss)this.tap(boss);else this.moveTo(a.arena);}
 goHome(){this.moveTo(HOME);this.headingHome=true;if(this.isHome()){this.repair();this.headingHome=false;this.emit('home');}return true;}
 rescueHome(){this.route=[];this.target=null;this.powerTarget=null;this.headingHome=false;this.charging=null;this.projectiles=[];Object.assign(this.player,HOME,{hp:this.maxHp(),invincible:3});this.emit('home');}
 power(){if(this.paused||this.powerCd>0)return false;const capacitor=this.save.build.gadget==='capacitor';this.powerCd=capacitor?18:28;this.powerTime=capacitor?8:6;this.player.invincible=1;this.player.cd=0;this.emit('power');return true;}
 tap(p,screenScale=0){if(this.paused)return;if(!Number.isFinite(p?.x)||!Number.isFinite(p?.y)||!canWalk(this.save,p)){this.moveTo(p);return;}this.headingHome=false;const e=this.enemies.filter(e=>e.hp>0&&this.awake(e)&&(screenScale<=0||this.inView(e))&&dist(p,{x:e.x,y:e.y-(screenScale>0?(e.boss?(e.king?1.9:1.7):.72)*.15:0)})<(screenScale>0?Math.max(.4,(e.boss?(e.king?1.9:1.7):.72)*.5)+22/screenScale:1.5)).sort((a,b)=>dist(a,p)-dist(b,p))[0];if(e){this.target=e;this.route=pathfind(this.save,this.player,e);this.powerTarget=e.id;this.tryPowerAttack();}else this.moveTo(p);}
 tryPowerAttack(){const e=this.enemies.find(e=>e.id===this.powerTarget&&e.hp>0&&this.awake(e));if(!e){this.powerTarget=null;return false;}if(this.tapCd>0||this.isSafe(this.player)||!this.inView(e)||!this.clearShot(this.player,e)||dist(this.player,e)>=weaponFor(this.save.weapon).range)return false;this.powerTarget=null;this.tapCd=TAP_COOLDOWN;this.attack(e,true);return true;}
 hit(e,damage,activity={}){if(e.hp<=0||!this.awake(e))return;if(e.boss&&e.area>=6&&!e.guardBroken){if(activity.targeted&&activity.powered){e.guardBroken=true;this.effects.push({type:'burst',x:e.x,y:e.y,life:.6,max:.6,color:'#b9f8ff'});this.emit('guardBreak');}else damage=Math.min(damage,Math.max(0,e.hp-e.maxHp*.25));}e.hp-=damage;e.hit=.18;if(e.hp<=0)this.defeat(e);}
 defeat(e){
  if(e.boss){this.save.scrap+=45;this.save.gears+=4;}else this.drops.push({id:`${this.save.cycle}-${e.id}`,x:e.x,y:e.y,scrap:3,gears:e.id.endsWith('-0')?1:0});this.save.defeated.push(e.id);this.effects.push({type:'burst',x:e.x,y:e.y,life:.6,max:.6,color:e.king?'#ffbb60':'#a8f2d6'});this.emit('defeat',{boss:e.boss});
  if(e===this.target){this.target=null;this.route=[];}
  if(e.boss){
   if(e.king){this.save.cleared.push(e.id);this.save.king=true;this.save.champion=true;this.save.unlocked=FINAL_AREA;this.award('firejet');this.emit('victory');return;}
   const a=AREAS[e.area];this.save.cleared.push(e.id);this.award(a.reward);
   if(e.area===6){this.save.queen=true;this.save.unlocked=FINAL_AREA;this.populateNewArea(FINAL_AREA);this.emit('queen');}
   else{this.save.unlocked=Math.max(this.save.unlocked,Math.min(FINAL_AREA,e.area+1));this.populateNewArea(e.area+1);this.emit('unlock',{area:e.area+1,reward:a.reward});}
  }else{
   if(e.camp===undefined)return;const chapter=e.chapter??e.area,key=`camp-${chapter}-${e.camp}`;
   if(!this.enemies.some(n=>n.hp>0&&(n.chapter??n.area)===chapter&&n.camp===e.camp)&&!this.save.camps.includes(key)){
    this.save.camps.push(key);this.save.scrap+=12;this.save.gears+=2;this.player.hp=Math.min(this.maxHp(),this.player.hp+30);this.emit('camp',{area:chapter,count:this.campsIn(chapter)});
   }
  }
 }
 populateNewArea(r){const existing=this.enemies,ids=new Set(existing.map(e=>e.id));this.populate();this.enemies=[...existing,...this.enemies.filter(e=>!ids.has(e.id))];}
 award(id){if(!this.save.owned.includes(id))this.save.owned.push(id);this.save.weapon=id;this.save.build.weapon=id;this.player.hp=this.maxHp();this.emit('reward',{weapon:id});}
 hurt(amount,attacker){const p=this.player;if(p.invincible>0||this.powerTime>0||this.isSafe(p))return;if(['shield','aegis'].includes(this.save.build.gadget)&&this.shieldCd<=0){this.shieldCd=this.save.build.gadget==='aegis'?4:8;this.effects.push({type:'burst',x:p.x,y:p.y,life:.4,max:.4,color:'#a9efd0'});this.emit('block');return;}const st=equipmentStats(this.save);p.hp-=Math.max(1,amount-st.defense)*(this.save.gentle?.65:1);if(st.reflect&&attacker)this.hit(attacker,amount*.3);p.hit=.2;p.invincible=.4;this.emit('hurt');if(p.hp<=0){this.rescueHome();this.emit('rescue');}}
 shoot(from,to,weapon,enemy=false,damage=null,activity={}){const angle=Math.atan2(to.y-from.y,to.x-from.x),speed=enemy?eSpeed(weapon):17,w=weaponFor(weapon),life=enemy?2.7:w.range/speed+.1;this.projectiles.push({x:from.x,y:from.y,ox:from.x,oy:from.y,vx:Math.cos(angle)*speed,vy:Math.sin(angle)*speed,angle,weapon,enemy,owner:from.id,target:to.id,damage:damage??(enemy?(weapon==='firejet'?14:weapon==='prism'?13:weapon==='metro'?14:9):w.damage*AUTO_DAMAGE*(this.powerTime>0?1.65:1)),life,maxLife:life,hit:[],targeted:!!activity.targeted,powered:!!activity.powered});}
 attack(e,power=false){const p=this.player,w=weaponFor(this.save.weapon),damage=w.damage*(power?TAP_DAMAGE:AUTO_DAMAGE)*(this.powerTime>0?1.65:1);if(this.isSafe(p)||!this.clearShot(p,e))return;if(!power)p.cd=w.rate*(this.powerTime>0?.7:1);p.angle=Math.atan2(e.y-p.y,e.x-p.x);p.swing=power?.65:.42;this.emit('attack');
  const beam=['bumper','saw','hammer','drum','lightning','vine','prism','crystalbeam','rail','sunbeam','gravity','tractor','flame'].includes(w.id);
  if(beam){const many=['hammer','drum','gravity','tractor','flame','prism','crystalbeam','rail','sunbeam'].includes(w.id),chain=['lightning','vine'].includes(w.id),directional=['prism','crystalbeam','rail','sunbeam'].includes(w.id);let targets=this.enemies.filter(n=>n.hp>0&&this.awake(n)&&this.inView(n)&&dist(p,n)<=w.range&&this.clearShot(p,n)).sort((a,b)=>dist(a,e)-dist(b,e));if(chain)targets=targets.filter(n=>n===e||dist(n,e)<2.8);targets=targets.slice(0,many?20:chain?w.id==='lightning'?4:3:1);for(const [i,n] of targets.entries()){const dx=n.x-p.x,dy=n.y-p.y,along=dx*Math.cos(p.angle)+dy*Math.sin(p.angle),across=Math.abs(dx*Math.sin(p.angle)-dy*Math.cos(p.angle));if(directional&&(along<0||along>w.range||across>=.65))continue;if(w.id==='flame'&&Math.cos(Math.atan2(n.y-p.y,n.x-p.x)-p.angle)<=.65)continue;if(['hammer','drum'].includes(w.id)&&dist(n,e)>=1.9)continue;if(['tractor','gravity'].includes(w.id)&&dist(n,e)>=2.6)continue;this.effects.push({type:'beam',x:p.x,y:p.y,tx:n.x,ty:n.y,life:.2,max:.2,color:w.color});this.hit(n,damage*(power&&n!==e?AUTO_DAMAGE/TAP_DAMAGE:chain&&i>0?.72:1),{targeted:power&&n===e,powered:this.powerTime>0});if(['tractor','gravity'].includes(w.id)&&!n.boss){const distance=dist(n,e),step=Math.min(.8,distance),angle=Math.atan2(e.y-n.y,e.x-n.x),toward={x:n.x+Math.cos(angle)*step,y:n.y+Math.sin(angle)*step};if(canWalk(this.save,toward)&&this.clearShot(n,toward))Object.assign(n,toward);}if(w.id==='bumper'&&!n.boss){const toward={x:n.x+Math.cos(p.angle)*.25,y:n.y+Math.sin(p.angle)*.25};if(canWalk(this.save,toward)&&this.clearShot(n,toward))Object.assign(n,toward);}}
  }else{const count=w.id==='swarm'||w.id==='supernova'?3:w.id==='twinrockets'?2:1,targets=power?[e]:[e,...this.enemies.filter(n=>n!==e&&n.hp>0&&this.awake(n)&&this.inView(n)&&dist(p,n)<=w.range&&this.clearShot(p,n)).sort((a,b)=>dist(a,e)-dist(b,e))].slice(0,3);for(let i=0;i<count;i++){this.shoot(p,targets[i%targets.length],w.id,false,w.id==='twinrockets'?damage/2:damage,{targeted:power,powered:this.powerTime>0});const q=this.projectiles.at(-1);q.x+=(i-(count-1)/2)*.18;q.homing=['drone','swarm','twinrockets'].includes(w.id);}}
 }
 update(dt,input={x:0,y:0}){
  if(this.paused||!Number.isFinite(dt)||dt<=0)return;dt=Math.min(.05,dt);this.time+=dt;for(const k of ['powerCd','powerTime','tapCd','shieldCd','buddyCd'])this[k]=Math.max(0,this[k]-dt);const p=this.player;for(const k of ['cd','hit','swing','invincible'])p[k]=Math.max(0,p[k]-dt);
  if(dist(p,HOME)<HOME_SAFE_RADIUS)p.hp=Math.min(this.maxHp(),p.hp+dt*25);
  let dx=Number.isFinite(input.x)?input.x:0,dy=Number.isFinite(input.y)?input.y:0,routeDistance=Infinity;if(dx||dy){this.route=[];this.target=null;this.powerTarget=null;this.headingHome=false;}else if(this.route.length){const next=this.route[0],d=dist(p,next);if(d<.15)this.route.shift();else{routeDistance=d;dx=(next.x-p.x)/d;dy=(next.y-p.y)/d;}}
  if(dx||dy)this.charging=null;
  const length=Math.hypot(dx,dy)||1,speed=Math.min(equipmentStats(this.save).speed*dt,routeDistance);dx=dx/length*speed;dy=dy/length*speed;p.moving=!!(dx||dy);
  if(canWalk(this.save,{x:p.x+dx,y:p.y}))p.x+=dx;if(canWalk(this.save,{x:p.x,y:p.y+dy}))p.y+=dy;
  this.visitPlaces();
  if(this.headingHome&&this.isHome()){this.headingHome=false;this.route=[];this.repair();this.emit('home');}
  const pickupRange=this.save.build.gadget==='vacuum'?5.5:this.save.build.gadget==='magnet'?3.2:1.45;for(const drop of this.drops)if(!drop.collected&&dist(p,drop)<pickupRange&&this.clearShot(p,drop)){drop.collected=true;this.save.scrap+=drop.scrap;this.save.gears+=drop.gears;this.emit('pickup');}this.drops=this.drops.filter(d=>!d.collected);
  const current=regionAt(p);if(current!==this.region){this.region=current;this.emit('region',{area:current});}
  if(this.target?.hp>0&&!this.route.length&&dist(this.target,p)>=weaponFor(this.save.weapon).range)this.route=pathfind(this.save,p,this.target);
  this.tryPowerAttack();
  const weapon=weaponFor(this.save.weapon),candidates=this.enemies.filter(e=>e.hp>0&&this.awake(e)&&this.inView(e)&&dist(e,p)<weapon.range&&this.clearShot(p,e)).sort((a,b)=>dist(a,p)-dist(b,p));
  const target=this.target?.hp>0&&this.inView(this.target)&&dist(this.target,p)<weapon.range&&this.clearShot(p,this.target)?this.target:candidates[0];
  if(target&&p.cd<=0&&!this.isSafe(p)){if(this.target===target)this.route=[];this.attack(target);}
  if(this.save.build.gadget==='buddy'&&this.buddyCd<=0&&candidates.length&&!this.isSafe(p)){this.buddyCd=1;this.shoot(p,candidates[0],'drone',false,45*AUTO_DAMAGE);this.projectiles.at(-1).homing=true;}
  for(const e of this.enemies){
   if(e.hp<=0||!this.awake(e))continue;e.cd-=dt;e.hit=Math.max(0,e.hit-dt);e.swing=Math.max(0,e.swing-dt);e.frozen=Math.max(0,(e.frozen||0)-dt);if(e.frozen>0)continue;
   const d=dist(e,p);e.angle=Math.atan2(p.y-e.y,p.x-e.x);
   if(d<(e.boss?9:4.5)&&regionAt(p)===e.area&&!this.isSafe(p)){
    if(d>1.4&&(!e.boss||d>(e.area===2?2.2:4))){const step=(e.boss?.7:1.1+e.area*.07)*dt,np={x:e.x+Math.cos(e.angle)*step,y:e.y+Math.sin(e.angle)*step};if(regionAt(np)===e.area&&canWalk(this.save,np)&&dist(np,e.home)<6)Object.assign(e,np);}
    if(e.cd<=0&&this.inView(e)){if(e.boss&&this.clearShot(e,p)){e.cd=e.king?2:2.4;e.swing=.8;const weapon=AREAS[e.area].reward;this.effects.push({type:'warning',x:e.area===2?e.x:p.x,y:e.area===2?e.y:p.y,life:.9,max:.9,color:weaponFor(weapon).color});if(e.area===2){if(d<3.2)this.hurt(12,e);}else this.shoot(e,p,weapon,true);}else if(d<1.8){this.hurt(6+e.area,e);e.cd=1.5;e.swing=.8;}}
   }
  }
  for(const q of this.projectiles){if(q.life<=0)continue;q.life-=dt;if(q.homing){const target=this.enemies.find(e=>e.id===q.target&&e.hp>0);if(target){q.angle=Math.atan2(target.y-q.y,target.x-q.x);q.vx=Math.cos(q.angle)*11;q.vy=Math.sin(q.angle)*11;}}if(!q.enemy&&['tide','boomerang'].includes(q.weapon)&&q.life<q.maxLife/2){if(!q.returning){q.returning=true;q.hit=[];}q.angle=Math.atan2(p.y-q.y,p.x-q.x);q.vx=Math.cos(q.angle)*17;q.vy=Math.sin(q.angle)*17;}const previous={x:q.x,y:q.y};q.x+=q.vx*dt;q.y+=q.vy*dt;if(!this.clearShot(previous,q)){q.life=0;continue;}
   if(q.enemy){if(dist(q,p)<.45){this.hurt(q.damage,this.enemies.find(e=>e.id===q.owner));q.life=0;}}
   else for(const e of this.enemies){if(e.hp<=0||!this.awake(e)||q.hit.includes(e.id)||dist(e,q)>(e.boss?.8:.48))continue;q.hit.push(e.id);this.hit(e,q.damage,{targeted:q.targeted&&q.target===e.id,powered:q.powered});if(q.weapon==='frost')e.frozen=e.boss?.7:2;
    if(['metro','firejet','rocket','meteor','supernova','twinrockets'].includes(q.weapon)){this.effects.push({type:'burst',x:q.x,y:q.y,life:.45,max:.45,color:'#ffc56d'});for(const n of this.enemies)if(n!==e&&n.hp>0&&this.awake(n)&&dist(n,q)<2.6&&this.clearShot(q,n))this.hit(n,q.damage*.6);}
    if(!['tide','boomerang'].includes(q.weapon)){q.life=0;break;}
   }
  }
  this.projectiles=this.projectiles.filter(q=>q.life>0);for(const e of this.effects)e.life-=dt;this.effects=this.effects.filter(e=>e.life>0);
  if(this.charging){const station=this.stationNear();if(!station||station.id!==this.charging||this.route.length)this.charging=null;else{p.hp=Math.min(this.maxHp(),p.hp+dt*this.maxHp()/8*(this.save.build.gadget==='repair'?2:1));if(p.hp>=this.maxHp()){this.charging=null;this.emit('charged');}}}
 }
 snapshot(){Object.assign(this.save,{position:{x:this.player.x,y:this.player.y},hp:this.player.hp,drops:this.drops});return this.save;}
 replay(){if(!this.save.king)return false;Object.assign(this.save,{cleared:[],camps:[],defeated:[],queen:false,king:false,unlocked:1,cycle:this.save.cycle+1});this.rescueHome();this.populate();this.emit('replay');return true;}
}
function eSpeed(id){return id==='firejet'?7:5;}
