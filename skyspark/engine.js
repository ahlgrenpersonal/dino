import { BUILD, WORLD, SITE_COUNT, LEVELS, roofsFor, sitesFor, freshRun, freshSave, readSave, unlockedLevel } from './levels.js?v=world98';
export { BUILD, WORLD, SITE_COUNT, LEVELS, freshSave, readSave, unlockedLevel };
export const HERO_FEET=48,HERO_EYES=-33;
export const WEAPONS={punchDamage:1,sparksDamage:.8,blastDamage:1,blastCooldown:2.5,sparksCooldown:1.2,chainLimit:8,chainRange:320,laserCooldown:2.2,laserDamage:3,laserRange:1100,laserDuration:.6,maxSweep:.65};
const wrapAngle=a=>Math.atan2(Math.sin(a),Math.cos(a));
export function laserAngle(f,age=f.age){const t=Math.min(1,age/WEAPONS.laserDuration);return f.from+f.sweep*t*t*(3-2*t);}
export function armorSegments(e){const n=Math.min(12,e.maxHp),unit=e.maxHp/n;return Array.from({length:n},(_,i)=>Math.max(0,Math.min(1,(e.hp-i*unit)/unit)));}
export const roofSurface=r=>r.y-17;
const clamp=(n,a,b)=>Math.max(a,Math.min(b,n));
export const distance=(a,b)=>Math.hypot(a.x-b.x,a.y-b.y);
// Local circles follow the new bosses' silhouettes, including moving wing tips.
export function hitShapes(e,time=0){
  if(e.type==='excavator')return [[-80,60,105],[15,-10,110],...(e.hp>e.maxHp/3?[[105,-55,48],[155,-80+Math.sin(time*.9)*16,48],[230,20,60]]:[])];
  if(e.type==='wyvern'){const wing=Math.sin(time*3)*28;return [[0,0,65],[0,-86,48],[0,98,46],...[-1,1].flatMap(f=>[[f*80,-8,70],[f*149,-38-wing*.5,65],[f*215,-59-wing,42]])];}
  return [[0,0,e.radius]];
}
export function heroLean(p){return p.landed?0:clamp(p.vx/1050,-.5,.5);}
export function eyePosition(p){const a=heroLean(p),x=p.facing*8,y=HERO_EYES;return{x:p.x+x*Math.cos(a)-y*Math.sin(a),y:p.y+x*Math.sin(a)+y*Math.cos(a)};}
export class SkyGame {
  constructor(save,onEvent=()=>{}){this.save=readSave(save);this.onEvent=onEvent;this.time=0;this.paused=false;this.setupRun();}
  get level(){return LEVELS[this.save.level];}
  get run(){return this.save.runs[this.save.level];}
  get site(){return this.sites[clamp(Math.round((this.player.x-430)/500),0,SITE_COUNT-1)];}
  setupRun(){
    this.sites=sitesFor(this.save.level);this.roofs=roofsFor(this.save.level);
    this.player={...this.run.position,vx:0,vy:0,facing:1,landed:false,flare:0,shield:0,trail:[]};
    this.target=null;this.aim=null;this.effects=[];this.particles=[];this.enemies=[];this.projectiles=[];this.shieldHits=0;this.rings=[];this.defeated=new Set(this.run.cleared);
    this.laserCd=0;this.sparkCd=0;this.blastCd=0;this.auraCd=.7;this.combo=0;this.comboTime=0;this.shake=0;this.ringRun=false;this.ringsTaken=0;
    this.syncEncounters();
  }
  emit(type,data={}){this.onEvent({type,...data});}
  snapshot(){this.run.position={x:this.player.x,y:this.player.y};return structuredClone(this.save);}
  selectLevel(index){
    if(!Number.isInteger(index)||index<0||index>unlockedLevel(this.save))return false;
    if(index===this.save.level&&!this.run.complete)return true;
    this.snapshot();const replay=this.save.runs[index].complete;
    if(replay)this.save.runs[index]=freshRun();
    this.save.level=index;this.setupRun();this.emit('level-enter',{level:index,replay});return true;
  }
  restartLevel(){this.save.runs[this.save.level]=freshRun();this.setupRun();this.emit('level-enter',{level:this.save.level,replay:true});}
  robot(id,x,y,type='bot'){return{id,x,y,homeX:x,homeY:y,type,hp:.8,maxHp:.8,radius:type==='drone'?26:25,hit:0,cd:.45+(x%7)*.16,phase:x*.03,paint:this.save.level};}
  syncEncounters(bounds){
    if(this.run.complete)return;
    // Every nearby section is independent. Leaving a robot behind never blocks the route.
    const radius=Math.max(1050,Math.min(1800,bounds?(bounds.right-bounds.left)/2+350:1050));
    const left=this.player.x-radius,right=this.player.x+radius;
    this.enemies=this.enemies.filter(e=>e.hp>0&&e.homeX>left-400&&e.homeX<right+400);
    const active=new Set(this.enemies.map(e=>e.id)),l=this.level;
    for(const site of this.sites){
      if(site.x<left-250||site.x>right+250)continue;
      for(let wave=0;wave<l.waves;wave++)for(let i=0;i<l.squad;i++){
        const id=`${l.id}-${site.index}-${wave}-${i}`;
        if(this.defeated.has(id)||active.has(id))continue;
        // Air columns and street squads are spread across each 500-unit stretch.
        const column=i%4,row=Math.floor(i/4),air=(i+site.pattern+wave)%4!==0;
        let x=site.x-210+column*110+wave*52;
        let y=air?220+((row*2+column+wave+site.pattern)%4)*155:800;
        if(this.save.level===0&&!air&&site.index%3===1){
          const roof=this.roofs.find(r=>Math.abs(r.x-x)<140);
          if(roof){x=roof.x+30+(i%3)*50;y=roofSurface(roof)-50;}
        }
        this.enemies.push(this.robot(id,clamp(x,60,WORLD.width-60),y,air?'drone':'bot'));
      }
    }
    if(9220>=left&&9220<=right){
      if(this.run.bossHits<l.bossHp&&!active.has(`${l.id}-boss`))this.enemies.push({id:`${l.id}-boss`,type:l.bossType,boss:true,name:l.boss,x:9220,y:l.bossType==='wyvern'?400:l.bossType==='excavator'?720:640,homeX:9220,homeY:l.bossType==='wyvern'?400:l.bossType==='excavator'?720:640,hp:l.bossHp-this.run.bossHits,maxHp:l.bossHp,radius:l.bossType==='excavator'?150:115,hit:0,cd:.65,phase:0,attacks:0});
      for(let i=0;i<8;i++){
        const id=`${l.id}-${SITE_COUNT}-0-${i}`;
        if(!this.defeated.has(id)&&!active.has(id))this.enemies.push(this.robot(id,8940+(i%4)*175,i<4?800:270+(i%3)*70,i<4?'bot':'drone'));
      }
    }
  }
  stop(){this.target=null;}
  moveTo(x, y) {
    if (this.paused) return;
    const victim = this.enemies.filter(e => e.hp > 0 && hitShapes(e,this.time).some(([dx,dy,r])=>Math.hypot(e.x+dx-x,e.y+dy-y)<r+35)).sort((a,b)=>Math.hypot(a.x-x,a.y-y)-Math.hypot(b.x-x,b.y-y))[0];
    const ring=this.ringRun&&this.rings.find(r=>!r.taken&&Math.hypot(r.x-x,r.y-y)<52);
    let landing = null;
    if (!victim&&!ring) landing = this.roofs.find(r => x >= r.x - 8 && x <= r.x+r.w+8 && Math.abs(y-roofSurface(r)) < 44);
    this.target = victim ? { x: victim.x, y: victim.y, enemy: victim.id }
      : { x: clamp(x, 40, WORLD.width-40), y: landing ? roofSurface(landing)-HERO_FEET : y > WORLD.ground-65 ? WORLD.ground-HERO_FEET : clamp(y, 105, WORLD.ground-HERO_FEET), land: !!landing || y > WORLD.ground-65 };
    this.player.landed = false;
    this.emit('move');
  }
  nearest(range = 650, bounds) {
    return this.enemies.filter(e => e.hp > 0 && distance(e,this.player) < range && (!bounds || e.x+e.radius>bounds.left && e.x-e.radius<bounds.right && e.y+e.radius>bounds.top && e.y-e.radius<bounds.bottom))
      .sort((a,b) => distance(a,this.player)-distance(b,this.player))[0] || null;
  }
  damage(e, kind, amount=kind==='laser'?WEAPONS.laserDamage:kind==='chain'||kind==='spark'?WEAPONS.sparksDamage:kind==='sphere'?WEAPONS.blastDamage:WEAPONS.punchDamage) {
    if (e.hp <= 0) return false;
    e.lastHits ||= {};
    if (this.time-(e.lastHits[kind]??-10) < (kind==='ram'?.85:kind==='spark'?.8:.5)) return false;
    e.lastHits[kind]=this.time;
    e.hp=Math.max(0,Math.round((e.hp-amount)*10)/10); e.hit = e.boss ? .35 : .1;
    this.player.flare = .35;
    this.shake = Math.max(this.shake, e.boss ? 7 : 2);
    this.effects.push({ type: 'burst', x: e.x, y: e.y, age: 0, life: .55, big: e.boss, color: kind === 'laser' ? '#ffb3cf' : '#96faff' });
    if (e.boss) {
      this.run.bossHits = Math.round((e.maxHp-e.hp)*10)/10;
      this.emit('titan-hit', { hits: this.run.bossHits });
    }
    if (e.hp > 0) return true;
    this.save.total++; this.run.kills++; this.combo++; this.comboTime = 3.5; this.save.best = Math.max(this.save.best,this.combo);
    if (!e.boss){this.defeated.add(e.id);this.run.cleared.push(e.id);}
    if(kind==='laser')this.effects.push({type:'split',x:e.x,y:e.y,age:0,life:e.boss?1:.7,robot:{...e,hp:e.maxHp,hit:0}});
    for (let i=0;i<(e.boss?50:12);i++) {
      const a = (i * 2.399) + this.time;
      this.particles.push({ x:e.x, y:e.y, vx:Math.cos(a)*(80+i*5), vy:Math.sin(a)*180-70, age:0, life:.6+(i%5)*.12, size:3+i%5, color:i%3===0?'#ffc978':i%3===1?'#b3efff':'#546b89', metal:i%3!==0, sliced:kind==='laser' });
    }
    this.emit('destroy', { kind, giant:e.boss, combo:this.combo });
    return true;
  }
  sparks(bounds){
    if(this.paused||this.sparkCd>0)return false;
    let target=this.nearest(700,bounds);if(!target)return false;
    const nodes=[],visited=new Set();
    while(target&&nodes.length<WEAPONS.chainLimit){
      nodes.push({id:target.id,x:target.x,y:target.y});visited.add(target.id);
      const from=target;
      target=this.enemies.filter(e=>e.hp>0&&!visited.has(e.id)&&distance(e,from)<=WEAPONS.chainRange)
        .sort((a,b)=>distance(a,from)-distance(b,from))[0];
    }
    this.sparkCd=WEAPONS.sparksCooldown;this.player.flare=.6;
    const f={type:'chain',x:this.player.x+this.player.facing*30,y:this.player.y-10,nodes,fired:0,age:0,life:(nodes.length-1)*.075+.4};
    this.effects.push(f);this.chainHits(f);this.emit('sparks');return true;
  }
  chainHits(f){
    while(f.fired<f.nodes.length&&f.age>=f.fired*.075){
      const node=f.nodes[f.fired],enemy=this.enemies.find(e=>e.id===node.id&&e.hp>0);
      if(enemy){node.x=enemy.x;node.y=enemy.y;this.damage(enemy,'chain');}
      this.emit('chain-hop',{index:f.fired});f.fired++;
    }
  }
  laser(bounds) {
    if(this.paused||this.laserCd>0)return false;
    const inView=e=>!bounds||e.x+e.radius>bounds.left&&e.x-e.radius<bounds.right&&e.y+e.radius>bounds.top&&e.y-e.radius<bounds.bottom;
    const target=this.enemies.find(e=>e.id===this.aim&&e.hp>0&&distance(e,this.player)<900&&inView(e))||this.nearest(900,bounds);
    this.laserCd=WEAPONS.laserCooldown;
    const p=this.player;if(target)p.facing=target.x>=p.x?1:-1;
    const start=eyePosition(p),from=target?Math.atan2(target.y-start.y,target.x-start.x):(p.facing>0?0:Math.PI);
    const angles=this.enemies.filter(e=>e.hp>0&&inView(e)&&distance(e,start)<WEAPONS.laserRange)
      .map(e=>wrapAngle(Math.atan2(e.y-start.y,e.x-start.x)-from)).filter(a=>Math.abs(a)<=WEAPONS.maxSweep);
    const fallback=p.facing>0?-.26:.26;
    let sweep=fallback,best=0;
    for(const end of angles.filter(a=>Math.abs(a)>.03)){
      const score=angles.filter(a=>a>=Math.min(0,end)-.035&&a<=Math.max(0,end)+.035).length;
      if(score>best||(score===best&&Math.abs(end)<Math.abs(sweep))){best=score;sweep=end;}
    }
    const f={type:'laser',from,sweep,angle:from,hit:[],age:0,life:.74};
    this.effects.push(f);this.laserHits(f,from,from);this.emit('laser');return true;
  }
  laserHits(f,previous,current){
    const start=eyePosition(this.player),arc=current-previous;
    for(const e of this.enemies){
      if(e.hp<=0||f.hit.includes(e.id))continue;
      const struck=hitShapes(e,this.time).some(([sx,sy,r])=>{
        const dx=e.x+sx-start.x,dy=e.y+sy-start.y,d=Math.hypot(dx,dy),delta=wrapAngle(Math.atan2(dy,dx)-previous);
        const closest=Math.max(Math.min(0,arc),Math.min(Math.max(0,arc),delta)),off=delta-closest;
        return d*Math.cos(off)>=0&&d*Math.cos(off)<=WEAPONS.laserRange&&Math.abs(d*Math.sin(off))<r+13;
      });
      if(struck&&this.damage(e,'laser',WEAPONS.laserDamage))f.hit.push(e.id);
    }
  }
  blast() {
    if (this.paused || this.blastCd>0) return false;
    this.blastCd = WEAPONS.blastCooldown; this.shake = 6; this.player.flare = .8;
    this.effects.push({type:'sphere',x:this.player.x,y:this.player.y,age:0,life:.85,radius:450,hit:[]});
    this.emit('blast'); return true;
  }
  enemyMuzzle(e,beam=false,offset=0){
    if(beam)return {x:e.x,y:e.y-(e.type==='titan'?140:e.type==='wyvern'?75:85)};
    if(e.type==='wyvern')return{x:e.x+offset*128,y:e.y-10};
    if(e.type==='titan')return{x:e.x+offset*130,y:e.y-30};
    if(e.type==='excavator')return{x:e.x-25+offset*55,y:e.y-90};
    return{x:e.x+(this.player.x>=e.x?25:-25),y:e.y-8};
  }
  fireEnemy(e){
    const volley=e.boss?(e.type==='excavator'?3:2):1,turn=e.attacks||0;
    e.attacks=turn+1;e.cd=e.boss?2.6:3.5+(Math.abs(e.phase)%1.4);
    if(e.boss&&e.type!=='excavator'&&turn%2===0){
      const origin=this.enemyMuzzle(e,true);
      this.effects.push({type:'enemy-beam',owner:e.id,...origin,tx:this.player.x,ty:this.player.y,age:0,charge:.95,fire:.35,life:1.4,hit:false});
      this.emit('enemy-charge');
    }
    for(let i=0;i<volley&&this.projectiles.length<96;i++){
      const origin=this.enemyMuzzle(e,false,e.boss?(i===0?-1:1):0);
      const angle=Math.atan2(this.player.y-origin.y,this.player.x-origin.x)+(i-(volley-1)/2)*(e.boss ? .13 : 0);
      const speed=e.boss?210:e.type==='drone'?185:165;
      this.projectiles.push({type:e.boss?'missile':'orb',owner:e.id,...origin,vx:Math.cos(angle)*speed,vy:Math.sin(angle)*speed,radius:e.boss?15:12,age:0,life:7,trail:[]});
    }
    this.emit('enemy-fire');
  }
  shieldImpact(x,y){
    this.shieldHits++;const audible=this.player.shield<.18;
    this.player.shield=.65;this.shake=Math.max(this.shake,1.5);
    this.effects.push({type:'shield-hit',x:this.player.x,y:this.player.y,angle:Math.atan2(y-this.player.y,x-this.player.x),age:0,life:.45});
    if(audible)this.emit('shield'); // Impact feedback only: no damage, knockback or lost progress.
  }
  updateEnemyAttacks(dt,oldX,oldY){
    const p=this.player;
    for(const q of this.projectiles){
      q.age+=dt;const x=q.x,y=q.y;q.x+=q.vx*dt;q.y+=q.vy*dt;
      q.trail.push({x,y});q.trail=q.trail.slice(-9);
      // Relative swept collision lets fast flight genuinely dodge a slow projectile.
      const rx=x-oldX,ry=y-oldY,dx=q.x-x-(p.x-oldX),dy=q.y-y-(p.y-oldY);
      const t=clamp(-(rx*dx+ry*dy)/(dx*dx+dy*dy||1),0,1);
      if(Math.hypot(rx+dx*t,ry+dy*t)<q.radius+27){q.age=q.life;this.shieldImpact(q.x,q.y);}
    }
    this.projectiles=this.projectiles.filter(q=>q.age<q.life&&Math.abs(q.x-p.x)<2100&&q.y>-500&&q.y<1500);
    for(const f of this.effects){
      if(f.type!=='enemy-beam')continue;
      const owner=this.enemies.find(e=>e.id===f.owner&&e.hp>0);
      if(owner){const origin=this.enemyMuzzle(owner,true);f.x=origin.x;f.y=origin.y;}
      else if(f.age<f.charge){f.age=f.life;continue;}
      if(f.hit||f.age<f.charge||f.age>f.charge+f.fire)continue;
      const angle=Math.atan2(f.ty-f.y,f.tx-f.x),dx=p.x-f.x,dy=p.y-f.y,along=dx*Math.cos(angle)+dy*Math.sin(angle),across=Math.abs(dx*Math.sin(angle)-dy*Math.cos(angle));
      if(along>=0&&along<1400&&across<38){f.hit=true;this.shieldImpact(f.x,f.y);}
    }
  }
  ringFlight(){
    if(!this.run.complete)return false;
    this.ringRun=true;this.ringsTaken=0;this.rings=Array.from({length:12},(_,i)=>({x:450+i*740,y:220+(i%4)*110,taken:false}));
    this.emit('rings-start');return true;
  }
  update(dt, keys = {}, bounds) {
    if(this.paused)return;
    dt=clamp(dt,0,.04);this.time+=dt;if(!this.run.complete)this.run.playSeconds+=dt;
    this.laserCd=Math.max(0,this.laserCd-dt);this.sparkCd=Math.max(0,this.sparkCd-dt);this.blastCd=Math.max(0,this.blastCd-dt);this.auraCd-=dt;
    this.player.flare=Math.max(0,this.player.flare-dt);this.player.shield=Math.max(0,this.player.shield-dt);this.shake=Math.max(0,this.shake-dt*20);
    this.comboTime-=dt;if(this.comboTime<=0)this.combo=0;
    const p=this.player,oldX=p.x,oldY=p.y;
    const kx=(keys.right?1:0)-(keys.left?1:0),ky=(keys.down?1:0)-(keys.up?1:0);
    if(kx||ky){this.target=null;p.landed=false;const n=Math.hypot(kx,ky);p.x+=kx/n*470*dt;p.y+=ky/n*470*dt;}
    else if(this.target){
      const victim=this.target.enemy&&this.enemies.find(e=>e.id===this.target.enemy&&e.hp>0);
      if(victim){this.target.x=victim.x;this.target.y=victim.y;}
      const d=distance(p,this.target),speed=500,step=Math.min(d,speed*dt);
      if(d>1){p.x+=(this.target.x-p.x)/d*step;p.y+=(this.target.y-p.y)/d*step;}
      if(d<8){p.landed=!!this.target.land;this.target=null;}
    }
    p.x=clamp(p.x,40,WORLD.width-40);p.y=clamp(p.y,105,WORLD.ground-HERO_FEET);
    if(p.y>=WORLD.ground-HERO_FEET-1&&ky>=0&&!this.target)p.landed=true;
    if(kx||ky) for(const r of this.roofs) if(ky>0&&p.x>r.x&&p.x<r.x+r.w&&oldY+HERO_FEET<=roofSurface(r)&&p.y+HERO_FEET>=roofSurface(r)){p.y=roofSurface(r)-HERO_FEET;p.landed=true;}
    p.vx=(p.x-oldX)/Math.max(dt,.001);p.vy=(p.y-oldY)/Math.max(dt,.001);
    if(Math.abs(p.vx)>4)p.facing=Math.sign(p.vx);
    p.trail.push({x:p.x,y:p.y,age:0});for(const t of p.trail)t.age+=dt;p.trail=p.trail.filter(t=>t.age<.3).slice(-18);
    if(!this.run.complete){
      const checkpoint=this.run.checkpoint;
      this.run.frontier=Math.max(this.run.frontier,p.x);
      this.run.checkpoint=Math.min(SITE_COUNT,Math.floor(this.run.frontier/500));
      this.syncEncounters(bounds);
      if(this.run.checkpoint>checkpoint)this.emit('checkpoint');
    }
    for(const e of this.enemies){
      if(e.hp<=0)continue;e.hit=Math.max(0,e.hit-dt);e.cd-=dt;
      if(e.type==='drone')e.y=e.homeY+Math.sin(this.time*1.8+e.phase)*22;
      if(e.type==='bot')e.x=e.homeX+Math.sin(this.time*.7+e.phase)*20;
      if(e.type==='titan')e.y=e.homeY+Math.sin(this.time*1.2)*5;
      if(e.type==='excavator')e.x=e.homeX+Math.sin(this.time*.5)*65;
      if(e.type==='wyvern'){e.x=e.homeX+Math.sin(this.time*.65)*170;e.y=e.homeY+Math.sin(this.time*.95)*140;}
      // Swept collisions keep fast flight attacks reliable, including a short tap through a robot.
      const dx=p.x-oldX,dy=p.y-oldY;
      if(Math.hypot(p.vx,p.vy)>50&&hitShapes(e,this.time).some(([sx,sy,r])=>{
        const t=clamp(((e.x+sx-oldX)*dx+(e.y+sy-oldY)*dy)/(dx*dx+dy*dy||1),0,1);
        return Math.hypot(e.x+sx-oldX-dx*t,e.y+sy-oldY-dy*t)<r+25;
      }))this.damage(e,'ram');
      const visible=!bounds||e.x+e.radius>bounds.left-160&&e.x-e.radius<bounds.right+160&&e.y+e.radius>bounds.top-160&&e.y-e.radius<bounds.bottom+160;
      if(e.hp>0&&e.cd<=0&&visible&&distance(p,e)<(e.boss?1400:1100))this.fireEnemy(e);
    }
    this.aim=this.nearest(900,bounds)?.id||null;
    if(this.auraCd<=0){
      this.auraCd=.85;
      const near=this.enemies.filter(e=>e.hp>0&&distance(p,e)<125);
      for(const e of near.slice(0,3)){this.effects.push({type:'zap',x:p.x,y:p.y,tx:e.x,ty:e.y,age:0,life:.28});this.damage(e,'spark');}
      if(near.length)this.emit('spark');
    }
    for(const f of this.effects){
      const previousAge=f.age;f.age+=dt;
      if(f.type==='chain')this.chainHits(f);
      if(f.type==='laser'&&previousAge<WEAPONS.laserDuration){const angle=laserAngle(f);this.laserHits(f,f.angle,angle);f.angle=angle;}
      if(f.type==='sphere')for(const e of this.enemies)if(e.hp>0&&!f.hit.includes(e.id)&&distance(e,f)<Math.min(1,f.age/.55)*f.radius+e.radius){if(this.damage(e,'sphere'))f.hit.push(e.id);}
    }
    this.updateEnemyAttacks(dt,oldX,oldY);
    this.effects=this.effects.filter(e=>e.age<e.life);
    for(const s of this.particles){s.age+=dt;s.x+=s.vx*dt;s.y+=s.vy*dt;s.vy+=420*dt;}
    this.particles=this.particles.filter(s=>s.age<s.life).slice(-220);
    for(const r of this.rings)if(!r.taken&&distance(p,r)<52){r.taken=true;this.ringsTaken++;this.emit('ring',{count:this.ringsTaken});}
    if(this.ringRun&&this.ringsTaken===this.rings.length){this.ringRun=false;this.emit('rings-complete');}
    if(!this.run.complete){
      // Restoration is a reward for clearing a district, never an invisible progression gate.
      for(let district=0;district<6;district++){
        if(this.run.restored.includes(district))continue;
        let cleared=true;
        for(let site=district*3;site<district*3+3&&cleared;site++)for(let wave=0;wave<this.level.waves&&cleared;wave++)for(let i=0;i<this.level.squad;i++)if(!this.defeated.has(`${this.level.id}-${site}-${wave}-${i}`)){cleared=false;break;}
        if(cleared){this.run.restored.push(district);this.emit('milestone',{name:this.level.districts[district],level:this.save.level});}
      }
      if(this.run.bossHits===this.level.bossHp){
        this.run.complete=true;
        if(!this.save.completed.includes(this.save.level))this.save.completed.push(this.save.level);
        this.emit('level-complete',{level:this.save.level});
      }
    }
    this.enemies=this.enemies.filter(e=>e.hp>0);
  }
}
