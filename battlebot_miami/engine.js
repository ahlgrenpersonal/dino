import {AREAS,HOME,weaponFor,dist,regionAt,canWalk,pathfind,visibleAreas,FINAL_AREA,allBossesCleared,isPrivate,safeAt,visibleLandmarks} from './world.js?v=world10';
export class MiamiAdventure{
 constructor(save){this.save=save;this.player={...save.position,hp:save.hp,angle:0,cd:0,hit:0,swing:0,invincible:2};this.time=0;this.paused=false;this.route=[];this.effects=[];this.projectiles=[];this.enemies=[];this.target=null;this.powerCd=0;this.powerTime=0;this.onEvent=()=>{};this.populate();}
 emit(type,data={}){this.onEvent({type,...data});}
 maxHp(){return 110+this.save.armor*55;}
 upgradeCost(kind){return ['armor','wheels'].includes(kind)&&this.save[kind]<2?(this.save[kind]===0?45:95):null;}
 upgrade(kind){const cost=this.upgradeCost(kind);if(cost===null||this.save.scrap<cost)return false;this.save.scrap-=cost;this.save[kind]++;if(kind==='armor')this.player.hp=Math.min(this.maxHp(),this.player.hp+55);this.emit('upgrade',{kind});return true;}
 equip(id){if(!this.save.owned.includes(id))return false;this.save.weapon=id;return true;}
 populate(){
  this.enemies=[];
  for(const a of visibleAreas(this.save)){
   if(!a.id)continue;
   for(const [i,c] of a.camps.entries()){
    if(this.save.camps.includes(`camp-${a.id}-${i}`))continue;
    for(let j=0;j<4;j++){const id=`mob-${a.id}-${i}-${j}`;if(this.save.defeated.includes(id))continue;const angle=j*Math.PI/2,hp=18+a.id*9,spread=a.id===1?.5:1.15;this.enemies.push({id,area:a.id,camp:i,x:c.x+Math.cos(angle)*spread,y:c.y+Math.sin(angle)*spread,home:{...c},hp,maxHp:hp,theme:a.theme,peacock:a.id===3&&j%2===0,cd:1+j*.3,angle:0,hit:0,swing:0});}
   }
   if(!this.save.cleared.includes(`boss-${a.id}`))this.addBoss(a);
  }
 }
 addBoss(a){const hp=a.id===FINAL_AREA?780:100+a.id*55;this.enemies.push({id:`boss-${a.id}`,area:a.id,x:a.arena.x,y:a.arena.y,home:{...a.arena},hp,maxHp:hp,boss:true,king:a.id===FINAL_AREA,theme:a.theme,name:a.boss,cd:2,angle:0,hit:0,swing:0});}
 campsIn(r){return AREAS[r].camps.filter((_,i)=>this.save.camps.includes(`camp-${r}-${i}`)).length;}
 awake(e){return visibleAreas(this.save).some(a=>a.id===e.area)&&(!e.boss||(this.campsIn(e.area)===3&&(!e.king||allBossesCleared(this.save))));}
 clearShot(from,to){const n=Math.max(1,Math.ceil(dist(from,to)*5));for(let i=0;i<=n;i++)if(isPrivate({x:from.x+(to.x-from.x)*i/n,y:from.y+(to.y-from.y)*i/n}))return false;return true;}
 isSafe(p){return safeAt(this.save,p);}
 visitPlaces(){for(const l of visibleLandmarks(this.save)){if(dist(this.player,l)>1.8||this.save.discoveries.includes(l.id))continue;this.save.discoveries.push(l.id);if(l.reward){this.award(l.reward);this.emit('find',{weapon:l.reward,place:l.name});}else if(l.stamp){this.save.scrap+=8;this.player.hp=Math.min(this.maxHp(),this.player.hp+20);this.emit('visit',{place:l.name});}}}
 moveTo(p){this.target=null;this.route=pathfind(this.save,this.player,p);if(!this.route.length&&dist(this.player,p)>1)this.emit('toast',{text:'Choose a path on the land or bridge.'});}
 goArea(r){if(!visibleAreas(this.save).some(a=>a.id===r))return;this.moveTo(r===0?HOME:AREAS[r].entry);}
 goNext(){const a=AREAS.find(a=>a.id&&!this.save.cleared.includes(`boss-${a.id}`));if(!a)return;const c=a.camps.find((_,i)=>!this.save.camps.includes(`camp-${a.id}-${i}`));if(c){this.moveTo(c);return;}const boss=this.enemies.find(e=>e.id===`boss-${a.id}`&&e.hp>0);if(boss)this.tap(boss);else this.moveTo(a.arena);}
 goHome(){this.route=[];this.target=null;this.projectiles=[];Object.assign(this.player,HOME,{hp:this.maxHp(),invincible:3});this.emit('home');}
 power(){if(this.paused||this.powerCd>0)return;this.powerCd=7;this.powerTime=1.8;this.player.cd=0;this.emit('power');}
 tap(p){if(this.paused)return;const e=this.enemies.filter(e=>e.hp>0&&this.awake(e)&&dist(e,p)<1.5).sort((a,b)=>dist(a,p)-dist(b,p))[0];if(e){this.target=e;this.route=pathfind(this.save,this.player,e);this.power();}else this.moveTo(p);}
 hit(e,damage){if(e.hp<=0||!this.awake(e))return;e.hp-=damage;e.hit=.18;if(e.hp<=0)this.defeat(e);}
 defeat(e){
  this.save.scrap+=e.boss?45:3;this.save.defeated.push(e.id);this.effects.push({type:'burst',x:e.x,y:e.y,life:.6,max:.6,color:e.king?'#ffbb60':'#a8f2d6'});this.emit('defeat',{boss:e.boss});
  if(e===this.target){this.target=null;this.route=[];}
  if(e.boss){
   if(e.king){this.save.cleared.push(e.id);this.save.king=true;this.save.champion=true;this.save.unlocked=FINAL_AREA;this.award('firejet');this.emit('victory');return;}
   const a=AREAS[e.area];this.save.cleared.push(e.id);this.award(a.reward);
   if(e.area===6){this.save.queen=true;this.save.unlocked=FINAL_AREA;this.populateNewArea(FINAL_AREA);this.emit('queen');}
   else{this.save.unlocked=Math.max(this.save.unlocked,Math.min(FINAL_AREA,e.area+1));this.populateNewArea(e.area+1);this.emit('unlock',{area:e.area+1,reward:a.reward});}
  }else{
   const key=`camp-${e.area}-${e.camp}`;
   if(!this.enemies.some(n=>n.hp>0&&n.area===e.area&&n.camp===e.camp)&&!this.save.camps.includes(key)){
    this.save.camps.push(key);this.save.scrap+=12;this.player.hp=Math.min(this.maxHp(),this.player.hp+30);this.emit('camp',{area:e.area,count:this.campsIn(e.area)});
   }
  }
 }
 populateNewArea(r){const existing=this.enemies,ids=new Set(existing.map(e=>e.id));this.populate();this.enemies=[...existing,...this.enemies.filter(e=>!ids.has(e.id))];}
 award(id){if(!this.save.owned.includes(id))this.save.owned.push(id);this.save.weapon=id;this.player.hp=this.maxHp();this.emit('reward',{weapon:id});}
 hurt(amount){const p=this.player;if(p.invincible>0||this.isSafe(p))return;p.hp-=amount*(this.save.gentle?.5:1);p.hit=.3;p.invincible=.75;this.emit('hurt');if(p.hp<=0){this.goHome();this.emit('rescue');}}
 shoot(from,to,weapon,enemy=false){const angle=Math.atan2(to.y-from.y,to.x-from.x),speed=enemy?eSpeed(weapon):17;this.projectiles.push({x:from.x,y:from.y,ox:from.x,oy:from.y,vx:Math.cos(angle)*speed,vy:Math.sin(angle)*speed,angle,weapon,enemy,damage:enemy?(weapon==='firejet'?17:9):weaponFor(weapon).damage*(this.powerTime>0?2:1),life:enemy?2.7:weaponFor(weapon).range/speed+.1,hit:[]});}
 attack(e){const p=this.player,w=weaponFor(this.save.weapon);p.cd=w.rate/(this.powerTime>0?1.65:1);p.angle=Math.atan2(e.y-p.y,e.x-p.x);p.swing=.8;this.emit('attack');
  if(w.id==='drum'||w.id==='vine'||w.id==='prism'){
   const targets=this.enemies.filter(n=>n.hp>0&&this.awake(n)&&dist(p,n)<=w.range&&this.clearShot(p,n)).sort((a,b)=>dist(a,e)-dist(b,e)).slice(0,w.id==='drum'?20:w.id==='vine'?3:1);
   for(const n of targets){this.effects.push({type:'beam',x:p.x,y:p.y,tx:n.x,ty:n.y,life:.2,max:.2,color:w.color});this.hit(n,w.damage*(this.powerTime>0?2:1));}
  }else this.shoot(p,e,w.id);
 }
 update(dt,input={x:0,y:0}){
  if(this.paused||!Number.isFinite(dt)||dt<=0)return;dt=Math.min(.05,dt);this.time+=dt;this.powerCd=Math.max(0,this.powerCd-dt);this.powerTime=Math.max(0,this.powerTime-dt);const p=this.player;for(const k of ['cd','hit','swing','invincible'])p[k]=Math.max(0,p[k]-dt);
  if(dist(p,HOME)<3)p.hp=Math.min(this.maxHp(),p.hp+dt*25);
  let dx=Number.isFinite(input.x)?input.x:0,dy=Number.isFinite(input.y)?input.y:0,routeDistance=Infinity;if(dx||dy){this.route=[];this.target=null;}else if(this.route.length){const next=this.route[0],d=dist(p,next);if(d<.15)this.route.shift();else{routeDistance=d;dx=(next.x-p.x)/d;dy=(next.y-p.y)/d;}}
  const length=Math.hypot(dx,dy)||1,speed=Math.min((4.8+this.save.wheels*.7)*dt,routeDistance);dx=dx/length*speed;dy=dy/length*speed;p.moving=!!(dx||dy);
  if(canWalk(this.save,{x:p.x+dx,y:p.y}))p.x+=dx;if(canWalk(this.save,{x:p.x,y:p.y+dy}))p.y+=dy;
  this.visitPlaces();
  const current=regionAt(p);if(current!==this.region){this.region=current;this.emit('region',{area:current});}
  const weapon=weaponFor(this.save.weapon),candidates=this.enemies.filter(e=>e.hp>0&&this.awake(e)&&dist(e,p)<weapon.range&&this.clearShot(p,e)).sort((a,b)=>dist(a,p)-dist(b,p));
  const target=this.target?.hp>0&&dist(this.target,p)<weapon.range&&this.clearShot(p,this.target)?this.target:candidates[0];
  if(target&&p.cd<=0){if(this.target===target)this.route=[];this.attack(target);}
  for(const e of this.enemies){
   if(e.hp<=0||!this.awake(e))continue;e.cd-=dt;e.hit=Math.max(0,e.hit-dt);e.swing=Math.max(0,e.swing-dt);
   const d=dist(e,p);e.angle=Math.atan2(p.y-e.y,p.x-e.x);
   if(d<(e.boss?9:4.5)&&regionAt(p)===e.area&&!this.isSafe(p)){
    if(d>1.4&&(!e.boss||d>4)){const step=(e.boss?.7:1.1+e.area*.07)*dt,np={x:e.x+Math.cos(e.angle)*step,y:e.y+Math.sin(e.angle)*step};if(regionAt(np)===e.area&&canWalk(this.save,np)&&dist(np,e.home)<6)Object.assign(e,np);}
    if(e.cd<=0){if(e.boss&&this.clearShot(e,p)){e.cd=e.king?2:2.4;e.swing=.8;this.effects.push({type:'warning',x:p.x,y:p.y,life:.9,max:.9,color:'#f0876c'});this.shoot(e,p,e.king?'firejet':e.area===6?'prism':e.area===3?'vine':'neon',true);}else if(d<1.8){this.hurt(6+e.area);e.cd=1.5;e.swing=.8;}}
   }
  }
  for(const q of this.projectiles){if(q.life<=0)continue;q.life-=dt;const previous={x:q.x,y:q.y};q.x+=q.vx*dt;q.y+=q.vy*dt;if(!this.clearShot(previous,q)){q.life=0;continue;}
   if(q.enemy){if(dist(q,p)<.75){this.hurt(q.damage);q.life=0;}}
   else for(const e of this.enemies){if(e.hp<=0||!this.awake(e)||q.hit.includes(e.id)||dist(e,q)>(e.boss?1.25:.8))continue;q.hit.push(e.id);this.hit(e,q.damage);
    if(['metro','firejet'].includes(q.weapon)){this.effects.push({type:'burst',x:q.x,y:q.y,life:.45,max:.45,color:'#ffc56d'});for(const n of this.enemies)if(n!==e&&n.hp>0&&this.awake(n)&&dist(n,q)<2.6&&this.clearShot(q,n))this.hit(n,q.damage*.6);}
    if(q.weapon!=='tide'){q.life=0;break;}
   }
  }
  this.projectiles=this.projectiles.filter(q=>q.life>0);for(const e of this.effects)e.life-=dt;this.effects=this.effects.filter(e=>e.life>0);
 }
 snapshot(){Object.assign(this.save,{position:{x:this.player.x,y:this.player.y},hp:this.player.hp});return this.save;}
 replay(){if(!this.save.king)return false;Object.assign(this.save,{cleared:[],camps:[],defeated:[],queen:false,king:false,unlocked:1,cycle:this.save.cycle+1});this.goHome();this.populate();this.emit('replay');return true;}
}
function eSpeed(id){return id==='firejet'?7:5;}
