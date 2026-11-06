import { BUILD, WORLD, SITE_COUNT, BOSS_X, DISTRICT_COUNT, SITE_SPACING, LEVELS, roofsFor, sitesFor, freshRun, freshSave, readSave, unlockedLevel } from './levels.js?v=world109';
export { BUILD, WORLD, SITE_COUNT, BOSS_X, LEVELS, freshSave, readSave, unlockedLevel };
export const HERO_FEET=48,HERO_EYES=-33;
export const WEAPONS={punchDamage:1,sparksDamage:.8,blastDamage:1,blastCooldown:2.2,blastRadius:562.5,sparksCooldown:1,chainLimit:20,chainRange:360,laserCooldown:2,laserDamage:5,laserRange:1100,laserDuration:.6,maxSweep:1.3};
const wrapAngle=a=>Math.atan2(Math.sin(a),Math.cos(a));
export function laserAngle(f,age=f.age){const t=Math.min(1,age/WEAPONS.laserDuration);return f.from+f.sweep*t*t*(3-2*t);}
export function armorSegments(e){const n=Math.min(12,e.maxHp),unit=e.maxHp/n;return Array.from({length:n},(_,i)=>Math.max(0,Math.min(1,(e.hp-i*unit)/unit)));}
export const roofSurface=r=>r.y-17;
const clamp=(n,a,b)=>Math.max(a,Math.min(b,n));
export const distance=(a,b)=>Math.hypot(a.x-b.x,a.y-b.y);
export const ROCK_ATTACK={charge:1.05,interval:3.8,gravity:95,radius:32};
export function excavatorWheel(e){return{x:e.x-330,y:e.y-280,radius:165};}
export function bossShieldUp(e,time){
  if(!['crab','dreadnought','scarab','leviathan','rival'].includes(e.type)||e.hp<=0||time<(e.shieldBrokenUntil||0))return false;
  return time%6<(e.type==='crab'?3:e.type==='rival'?2.5:4);
}
// Local circles follow the new bosses' silhouettes, including moving wing tips.
export function hitShapes(e,time=0){
  if(e.type==='excavator')return [[-330,-280,190],[-185,-185,76],[-75,-100,115],[70,-10,150],[185,80,120],[-130,85,115],[80,-245,65],[80,-345,55]];
  if(e.type==='wyvern'){const wing=Math.sin(time*3)*28;return [[0,0,65],[0,-86,48],[0,98,46],...[-1,1].flatMap(f=>[[f*80,-8,70],[f*149,-38-wing*.5,65],[f*215,-59-wing,42]])];}
  if(e.type==='crab')return [[-125,45,85],[125,45,85],[0,0,105],[-195,-55,65],[195,-55,65]];
  if(e.type==='dreadnought')return [[0,0,150],[-155,5,90],[155,5,90],[0,-90,75]];
  if(e.type==='scarab')return [[0,0,125],[-165,30,80],[165,30,80],[80,-145,60]];
  if(e.type==='leviathan')return [[0,0,130],[-155,20,75],[155,20,75]];
  if(e.type==='rival')return [[0,0,65],[0,-65,35]];
  return [[0,0,e.radius]];
}
function closestPoint(p,a,b){const dx=b.x-a.x,dy=b.y-a.y,t=clamp(((p.x-a.x)*dx+(p.y-a.y)*dy)/(dx*dx+dy*dy||1),0,1);return{x:a.x+dx*t,y:a.y+dy*t};}
function segmentContact(a,b,c,d,padding=0){
  const rx=b.x-a.x,ry=b.y-a.y,sx=d.x-c.x,sy=d.y-c.y,cross=rx*sy-ry*sx;
  if(Math.abs(cross)>1e-8){const t=((c.x-a.x)*sy-(c.y-a.y)*sx)/cross,u=((c.x-a.x)*ry-(c.y-a.y)*rx)/cross;if(t>=0&&t<=1&&u>=0&&u<=1)return{x:a.x+t*rx,y:a.y+t*ry};}
  for(const [p,x,y] of [[a,c,d],[b,c,d],[c,a,b],[d,a,b]]){const q=closestPoint(p,x,y);if(distance(p,q)<=padding)return q;}
  return null;
}
function sectorHit(start,previous,current,p,radius,range){
  const dx=p.x-start.x,dy=p.y-start.y,d=Math.hypot(dx,dy),delta=wrapAngle(Math.atan2(dy,dx)-previous),arc=current-previous;
  const nearest=clamp(delta,Math.min(0,arc),Math.max(0,arc)),off=delta-nearest;
  return d*Math.cos(off)>=0&&d*Math.cos(off)<=range&&Math.abs(d*Math.sin(off))<radius+13;
}
export function heroLean(p){return p.landed?0:clamp(p.vx/1050,-.5,.5);}
export function eyePosition(p){const a=heroLean(p),x=p.facing*8,y=HERO_EYES;return{x:p.x+x*Math.cos(a)-y*Math.sin(a),y:p.y+x*Math.sin(a)+y*Math.cos(a)};}
export class SkyGame {
  constructor(save,onEvent=()=>{}){this.save=readSave(save);this.onEvent=onEvent;this.time=0;this.paused=false;this.viewport=null;this.setupRun();}
  get level(){return LEVELS[this.save.level];}
  get run(){return this.save.runs[this.save.level];}
  get site(){return this.sites[clamp(Math.round((this.player.x-430)/500),0,SITE_COUNT-1)];}
  setupRun(){
    this.sites=sitesFor(this.save.level);this.roofs=roofsFor(this.save.level);
    this.player={...this.run.position,vx:0,vy:0,flightSpeed:0,facing:1,landed:false,flare:0,hitFlash:0,kickX:0,kickY:0,impactCooldown:0,trail:[]};
    this.ramContacts=new Set();
    this.target=null;this.aim=null;this.effects=[];this.particles=[];this.enemies=[];this.projectiles=[];this.impactHits=0;this.shotsCleared=0;this.attackSequence=0;this.interceptSoundAt=-1;this.rings=[];this.defeated=new Set(this.run.cleared);
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
  robot(id,x,y,type='bot'){
    const hash=[...id].reduce((n,c)=>n+c.charCodeAt(0),0);
    const heavy=this.save.level>=5&&type==='bot'&&hash%12===0;
    const armored=heavy||this.save.level>=3&&hash%(this.save.level===3?4:3)===0,hp=heavy?3:armored?2:.8;
    return{id,x,y,homeX:x,homeY:y,type,heavy,armored,hp,maxHp:hp,radius:heavy?40:type==='drone'?26:25,hit:0,cd:.45+(x%7)*.16,phase:x*.03,paint:this.save.level};
  }
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
    if(BOSS_X>=left&&BOSS_X<=right){
      if(this.run.bossHits<l.bossHp&&!active.has(`${l.id}-boss`)){
        const y={wyvern:400,excavator:720,crab:705,dreadnought:380,scarab:680,leviathan:400,rival:450}[l.bossType]||640;
        this.enemies.push({id:`${l.id}-boss`,type:l.bossType,boss:true,name:l.boss,x:BOSS_X,y,homeX:BOSS_X,homeY:y,hp:l.bossHp-this.run.bossHits,maxHp:l.bossHp,radius:l.bossType==='excavator'?350:l.bossType==='rival'?80:['crab','dreadnought','scarab','leviathan'].includes(l.bossType)?250:115,hit:0,cd:.65,phase:0,attacks:0});
      }
      for(let i=0;i<8;i++){
        const id=`${l.id}-${SITE_COUNT}-0-${i}`;
        if(!this.defeated.has(id)&&!active.has(id))this.enemies.push(this.robot(id,BOSS_X-280+(i%4)*175,i<4?800:270+(i%3)*70,i<4?'bot':'drone'));
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
  setViewport(bounds){if(bounds)this.viewport={...bounds};}
  isVisible(e,bounds=this.viewport){
    if(!bounds)return true; // Headless simulations can supply their own viewport.
    return hitShapes(e,this.time).some(([dx,dy,r])=>{
      const x=e.x+dx,y=e.y+dy;
      return Math.hypot(x-clamp(x,bounds.left,bounds.right),y-clamp(y,bounds.top,bounds.bottom))<r;
    });
  }
  nearest(range = 650, bounds=this.viewport) {
    return this.enemies.filter(e => e.hp > 0 && distance(e,this.player) < range && this.isVisible(e,bounds))
      .sort((a,b) => distance(a,this.player)-distance(b,this.player))[0] || null;
  }
  damage(e, kind, amount=kind==='laser'?WEAPONS.laserDamage:kind==='chain'||kind==='spark'?WEAPONS.sparksDamage:kind==='sphere'?WEAPONS.blastDamage:WEAPONS.punchDamage) {
    // Recheck at impact, not just when aiming: piercing rays and delayed chains can leave the screen.
    if (e.hp <= 0 || !this.isVisible(e)) return false;
    e.lastHits ||= {};
    if (this.time-(e.lastHits[kind]??-10) < (kind==='ram'?0:kind==='spark'?.8:.5)) return false;
    e.lastHits[kind]=this.time;
    if(bossShieldUp(e,this.time)){
      if(kind==='sphere'){e.shieldBrokenUntil=this.time+2;this.effects.push({type:'shield-break',x:e.x,y:e.y,age:0,life:.5});this.emit('shield-break');}
      else amount=Math.max(.1,Math.round(amount*.45*10)/10);
    }
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
  beamSegment(f){if(f.type==='enemy-blast')return{a:{x:f.x,y:f.y},b:{x:f.x,y:f.y}};const angle=Math.atan2(f.ty-f.y,f.tx-f.x);return{a:{x:f.x,y:f.y},b:{x:f.x+Math.cos(angle)*1400,y:f.y+Math.sin(angle)*1400}};}
  hazardRadius(f){return f.type==='enemy-blast'?Math.max(45,Math.min(1,Math.max(0,f.age-f.charge)/f.fire)*f.radius):16;}
  incomingTargets(){
    const shots=this.projectiles.filter(q=>!q.cleared&&q.age<q.life).map(q=>({kind:'shot',id:q.id,x:q.x,y:q.y,radius:q.radius}));
    const beams=this.effects.filter(f=>['enemy-beam','enemy-blast'].includes(f.type)&&!f.cancelled&&f.age<f.life).map(f=>{const {a,b}=this.beamSegment(f);const near=closestPoint(this.player,a,b),d=distance(a,near),advance=distance(near,this.player)<100&&d>1?Math.min(250,d):0;return{kind:'beam',id:f.id,x:near.x+(a.x-near.x)/(d||1)*advance,y:near.y+(a.y-near.y)/(d||1)*advance,radius:this.hazardRadius(f)};});
    return [...shots,...beams];
  }
  interceptFlash(x,y,kind){
    this.shotsCleared++;this.effects.push({type:'intercept',x,y,kind,age:0,life:.32});
    if(this.time-this.interceptSoundAt>.08){this.interceptSoundAt=this.time;this.emit('intercept');}
  }
  clearProjectile(q,kind){if(q.cleared||q.age>=q.life)return false;q.cleared=true;q.age=q.life;if(q.type==='rock')this.rockDebris(q);this.interceptFlash(q.x,q.y,kind);return true;}
  rockDebris(q){for(let i=0;i<9;i++){const a=i*2.399;this.particles.push({x:q.x,y:q.y,vx:Math.cos(a)*(55+i*8),vy:Math.sin(a)*110-45,age:0,life:.45+i*.025,size:4+i%5,color:i%2?'#b8a087':'#615d5a',metal:true});}}
  clearBeam(f,kind,p){if(f.cancelled||f.age>=f.life)return false;f.cancelled=true;f.age=f.life;this.interceptFlash(p.x,p.y,kind);return true;}
  chainInterceptions(a,b){
    for(const q of this.projectiles)if(!q.cleared&&distance(q,closestPoint(q,a,b))<q.radius+65)this.clearProjectile(q,'chain');
    for(const f of this.effects)if(['enemy-beam','enemy-blast'].includes(f.type)&&!f.cancelled){const line=this.beamSegment(f),contact=segmentContact(a,b,line.a,line.b,49+this.hazardRadius(f));if(contact)this.clearBeam(f,'chain',contact);}
  }
  blastInterceptions(f){
    const radius=Math.min(1,f.age/.55)*f.radius;
    for(const q of this.projectiles)if(!q.cleared&&distance(q,f)<radius+q.radius)this.clearProjectile(q,'sphere');
    for(const beam of this.effects)if(['enemy-beam','enemy-blast'].includes(beam.type)&&!beam.cancelled){const {a,b}=this.beamSegment(beam),p=closestPoint(f,a,b);if(distance(p,f)<radius+this.hazardRadius(beam))this.clearBeam(beam,'sphere',p);}
  }
  sparks(bounds=this.viewport){
    this.setViewport(bounds);
    if(this.paused||this.sparkCd>0)return false;
    const visible=e=>this.isVisible(e,bounds);
    const pool=[...this.enemies.filter(e=>e.hp>0&&this.isVisible(e)).map(e=>({...e,kind:'robot'})),...this.incomingTargets().filter(visible)];
    const next=(from,range,visited,first=false)=>pool.filter(e=>!visited.has(e.id)&&distance(e,from)<range&&(!first||visible(e))).sort((a,b)=>(a.kind==='robot'?0:1)-(b.kind==='robot'?0:1)||distance(a,from)-distance(b,from))[0];
    const nodes=[],visited=new Set();let target=next(this.player,760,visited,true);if(!target)return false;
    while(target&&nodes.length<WEAPONS.chainLimit){nodes.push({...target});visited.add(target.id);target=next(target,WEAPONS.chainRange,visited);}
    this.sparkCd=WEAPONS.sparksCooldown;this.player.flare=.6;
    const f={type:'chain',x:this.player.x+this.player.facing*30,y:this.player.y-10,nodes,fired:0,age:0,life:(nodes.length-1)*.075+.4};
    this.effects.push(f);this.chainHits(f);this.emit('sparks');return true;
  }
  chainHits(f){
    while(f.fired<f.nodes.length&&f.age>=f.fired*.075){
      const node=f.nodes[f.fired],from=f.fired?f.nodes[f.fired-1]:{x:f.x,y:f.y};
      if(node.kind==='robot'){
        const enemy=this.enemies.find(e=>e.id===node.id&&e.hp>0);
        if(enemy&&!this.isVisible(enemy)){f.nodes.length=f.fired;f.life=f.age+.4;break;}
        if(enemy){node.x=enemy.x;node.y=enemy.y;this.damage(enemy,'chain');}
      }else if(node.kind==='shot'){
        const q=this.projectiles.find(q=>q.id===node.id&&!q.cleared);if(q){node.x=q.x;node.y=q.y;this.clearProjectile(q,'chain');}
      }else if(node.kind==='beam'){
        const beam=this.effects.find(e=>e.id===node.id&&!e.cancelled);if(beam){const {a,b}=this.beamSegment(beam),p=closestPoint(node,a,b);node.x=p.x;node.y=p.y;this.clearBeam(beam,'chain',p);}
      }
      this.chainInterceptions(from,node);this.emit('chain-hop',{index:f.fired});f.fired++;
    }
    this.projectiles=this.projectiles.filter(q=>!q.cleared);
  }
  laser(bounds=this.viewport) {
    this.setViewport(bounds);
    if(this.paused||this.laserCd>0)return false;
    const inView=e=>this.isVisible(e,bounds);
    const target=this.enemies.find(e=>e.id===this.aim&&e.hp>0&&distance(e,this.player)<900&&inView(e))||this.nearest(900,bounds)||this.incomingTargets().filter(e=>inView(e)&&distance(e,this.player)<900).sort((a,b)=>distance(a,this.player)-distance(b,this.player))[0];
    this.laserCd=WEAPONS.laserCooldown;
    const p=this.player;if(target)p.facing=target.x>=p.x?1:-1;
    const start=eyePosition(p),from=target?Math.atan2(target.y-start.y,target.x-start.x):(p.facing>0?0:Math.PI);
    const angles=[...this.enemies.filter(e=>e.hp>0),...this.incomingTargets()].filter(e=>inView(e)&&distance(e,start)<WEAPONS.laserRange)
      .map(e=>wrapAngle(Math.atan2(e.y-start.y,e.x-start.x)-from)).filter(a=>Math.abs(a)<=WEAPONS.maxSweep);
    const fallback=p.facing>0?-.26:.26;
    let sweep=fallback,best=0;
    for(const end of angles.filter(a=>Math.abs(a)>.03)){
      const score=angles.filter(a=>a>=Math.min(0,end)-.035&&a<=Math.max(0,end)+.035).length;
      if(score>best||(score===best&&Math.abs(end)<Math.abs(sweep))){best=score;sweep=end;}
    }
    sweep=clamp(sweep*2,-WEAPONS.maxSweep,WEAPONS.maxSweep);
    const f={type:'laser',from,sweep,previousAngle:from,angle:from,hit:[],age:0,life:.74};
    this.effects.push(f);this.laserHits(f,from,from);this.emit('laser');return true;
  }
  laserHits(f,previous,current){
    const start=eyePosition(this.player);f.previousAngle=previous;
    for(const e of this.enemies){
      if(e.hp<=0||f.hit.includes(e.id))continue;
      const struck=hitShapes(e,this.time).some(([sx,sy,r])=>sectorHit(start,previous,current,{x:e.x+sx,y:e.y+sy},r,WEAPONS.laserRange));
      if(struck&&this.damage(e,'laser',WEAPONS.laserDamage))f.hit.push(e.id);
    }
    for(const q of this.projectiles)if(!q.cleared&&sectorHit(start,previous,current,q,q.radius,WEAPONS.laserRange))this.clearProjectile(q,'laser');
    const ends=[previous,current].map(a=>({x:start.x+Math.cos(a)*WEAPONS.laserRange,y:start.y+Math.sin(a)*WEAPONS.laserRange}));
    for(const beam of this.effects)if(['enemy-beam','enemy-blast'].includes(beam.type)&&!beam.cancelled){
      const {a,b}=this.beamSegment(beam),near=closestPoint(start,a,b);
      const contact=ends.map(end=>segmentContact(start,end,a,b,20)).find(Boolean);
      if(contact||[a,b,near].some(p=>sectorHit(start,previous,current,p,this.hazardRadius(beam),WEAPONS.laserRange)))this.clearBeam(beam,'laser',contact||near);
    }
    this.projectiles=this.projectiles.filter(q=>!q.cleared);
  }
  blast(bounds=this.viewport) {
    this.setViewport(bounds);
    if (this.paused || this.blastCd>0) return false;
    this.blastCd = WEAPONS.blastCooldown; this.shake = 6; this.player.flare = .8;
    const f={type:'sphere',x:this.player.x,y:this.player.y,age:0,life:.85,radius:WEAPONS.blastRadius,hit:[]};this.effects.push(f);this.blastInterceptions(f);this.projectiles=this.projectiles.filter(q=>!q.cleared);
    this.emit('blast'); return true;
  }
  enemyMuzzle(e,beam=false,offset=0){
    if(e.heavy)return{x:e.x+(this.player.x>=e.x?40:-40),y:e.y-20};
    if(e.type==='rival')return{x:e.x,y:e.y-61};
    if(e.type==='scarab')return{x:e.x+80,y:e.y-145};
    if(e.type==='leviathan')return{x:e.x,y:e.y-59};
    if(beam)return {x:e.x,y:e.y-(e.type==='titan'?140:e.type==='wyvern'?75:85)};
    if(e.type==='wyvern')return{x:e.x+offset*128,y:e.y-10};
    if(e.type==='titan')return{x:e.x+offset*130,y:e.y-30};
    if(e.type==='excavator'){const wheel=excavatorWheel(e);return{x:wheel.x-95,y:wheel.y-115};}
    if(e.type==='crab')return{x:e.x+offset*185,y:e.y-55};
    if(e.type==='dreadnought')return{x:e.x+offset*155,y:e.y+25};
    return{x:e.x+(this.player.x>=e.x?25:-25),y:e.y-8};
  }
  fireEnemy(e){
    if(['scarab','leviathan','rival'].includes(e.type)||e.heavy){this.fireAdvancedEnemy(e);return;}
    if(e.type==='excavator'){
      if(!this.isVisible(e))return;
      e.cd=ROCK_ATTACK.interval;e.rockWindupUntil=this.time+ROCK_ATTACK.charge;
      this.effects.push({type:'rock-windup',owner:e.id,tx:this.player.x,ty:this.player.y,age:0,charge:ROCK_ATTACK.charge,life:ROCK_ATTACK.charge+.35,fired:false});
      this.emit('rock-charge');return;
    }
    const advanced=['crab','dreadnought'].includes(e.type),volley=e.boss?(e.type==='crab'?5:e.type==='dreadnought'?4:2):1,turn=e.attacks||0;
    e.attacks=turn+1;e.cd=advanced?(e.type==='crab'?2.7:2.3):e.boss?2.6:3.5+(Math.abs(e.phase)%1.4);
    if(e.boss&&!['excavator','crab'].includes(e.type)&&turn%2===0){
      const origin=this.enemyMuzzle(e,true);
      if(e.type!=='crab')this.effects.push({type:'enemy-beam',id:`beam-${++this.attackSequence}`,owner:e.id,...origin,tx:this.player.x,ty:this.player.y,age:0,charge:advanced?1.15:.95,fire:.35,life:advanced?1.6:1.4,hit:false,power:advanced?1.5:1});
      this.emit('enemy-charge');
    }
    for(let i=0;i<volley&&this.projectiles.length<96;i++){
      const origin=this.enemyMuzzle(e,false,e.boss?(i===0?-1:1):0);
      const angle=Math.atan2(this.player.y-origin.y,this.player.x-origin.x)+(i-(volley-1)/2)*(e.boss ? .13 : 0);
      const speed=advanced?185:e.boss?210:e.type==='drone'?185:165;
      const orb=e.type==='crab'||e.type==='dreadnought'&&i%2===0;
      this.projectiles.push({type:e.boss&&!orb?'missile':'orb',id:`shot-${++this.attackSequence}`,owner:e.id,...origin,vx:Math.cos(angle)*speed,vy:Math.sin(angle)*speed,radius:advanced?(orb?22:19):e.boss?15:12,power:advanced?1.5:this.save.level>=3?1.25:1,tint:e.type==='crab'?'#ffae63':e.type==='dreadnought'?'#b9a8ff':null,age:0,life:7,trail:[]});
    }
    this.emit('enemy-fire');
  }
  fireAdvancedEnemy(e){
    if(!this.isVisible(e))return;
    const turn=e.attacks||0;e.attacks=turn+1;
    const rival=e.type==='rival',sea=e.type==='leviathan',tint=rival?'#ff8a32':sea?'#ff67c4':'#ffb33f';
    e.cd=e.heavy?4.5:rival?3.8:sea?3.4:3.6;
    const origin=this.enemyMuzzle(e,true);
    if(e.heavy||!rival){
      const count=e.heavy?1:sea?5:4;
      for(let i=0;i<count&&this.projectiles.length<96;i++){
        const a=Math.atan2(this.player.y-origin.y,this.player.x-origin.x)+(i-(count-1)/2)*.17;
        this.projectiles.push({type:'orb',id:`shot-${++this.attackSequence}`,owner:e.id,...origin,vx:Math.cos(a)*170,vy:Math.sin(a)*170,radius:e.heavy?23:27,tint,shove:e.heavy?140:sea?300:200,age:0,life:8,trail:[]});
      }
    }
    if(!e.heavy&&(rival||turn%2===0)){
      const mode=rival?turn%3:0;
      if(rival&&mode===2){
        this.effects.push({type:'enemy-blast',id:`wave-${++this.attackSequence}`,owner:e.id,x:e.x,y:e.y,age:0,charge:1.1,fire:.3,life:1.5,radius:330,shove:400,tint:'#ff6d32',hit:false});
      }else{
        const spark=rival&&mode===1,width=this.viewport?this.viewport.right-this.viewport.left:900;
        this.effects.push({type:'enemy-beam',id:`beam-${++this.attackSequence}`,owner:e.id,...origin,tx:this.player.x,ty:this.player.y,age:0,charge:rival?1.3:1.15,fire:.3,life:rival?1.8:1.6,hit:false,shove:rival?(spark?180:clamp(width*.9,650,1100)):(sea?300:200),tint:spark?'#ff49b3':tint,skin:spark?'spark':null});
      }
      this.emit('enemy-charge');
    }
    this.emit('enemy-fire');
  }
  throwRocks(e,f){
    const origin=this.enemyMuzzle(e),travel=clamp(distance(origin,{x:f.tx,y:f.ty})/210,1.65,2.8);
    for(let i=0;i<3&&this.projectiles.length<96;i++){
      const flight=travel+(i-1)*.12,tx=f.tx+(i-1)*80;
      this.projectiles.push({type:'rock',id:`shot-${++this.attackSequence}`,owner:e.id,...origin,vx:(tx-origin.x)/flight,vy:(f.ty-origin.y-.5*ROCK_ATTACK.gravity*flight*flight)/flight,gravity:ROCK_ATTACK.gravity,radius:ROCK_ATTACK.radius+i*3,age:0,life:6,spin:i*2.1,trail:[]});
    }
    this.emit('rock-throw');
  }
  bodyImpact(x,y,kind='orb',vx=this.player.x-x,vy=this.player.y-y,power=1,shove=0){
    const p=this.player;this.impactHits++;
    if(p.impactCooldown>0)return;
    const speed=Math.hypot(vx,vy)||1,drag=shove>0?4:8,force=shove>0?clamp(shove,0,1100)*drag:Math.min(360,({orb:140,missile:240,rock:300,beam:220}[kind]||140)*power);
    p.kickX=vx/speed*force;p.kickY=vy/speed*force;p.kickDrag=drag;p.impactCooldown=shove>0?.65:.16;p.hitFlash=.24;p.landed=false;
    this.shake=Math.max(this.shake,1.5);
    this.effects.push({type:'body-hit',x:p.x,y:p.y,angle:Math.atan2(-vy,-vx),age:0,life:.24});
    this.emit('body-hit'); // Invincible: the brief push replaces health loss and never locks movement.
  }
  updateEnemyAttacks(dt,oldX,oldY){
    const p=this.player;
    for(const f of this.effects)if(f.type==='rock-windup'&&!f.fired){
      const owner=this.enemies.find(e=>e.id===f.owner&&e.hp>0);
      if(!owner||this.run.complete||!this.isVisible(owner)){f.age=f.life;f.fired=true;if(owner)owner.rockWindupUntil=0;continue;}
      if(f.age>=f.charge){f.fired=true;this.throwRocks(owner,f);}
    }
    for(const q of this.projectiles){
      if(q.cleared)continue;
      q.age+=dt;const x=q.x,y=q.y;q.x+=q.vx*dt;q.y+=q.vy*dt+.5*(q.gravity||0)*dt*dt;q.vy+=(q.gravity||0)*dt;
      q.trail.push({x,y});q.trail=q.trail.slice(-9);
      // Resolve weapon defense before contact with the hero, including incoming shots crossing a field.
      for(const f of this.effects){
        if(f.type==='sphere'&&f.age<f.life&&distance(f,closestPoint(f,{x,y},q))<Math.min(1,f.age/.55)*f.radius+q.radius)this.clearProjectile(q,'sphere');
        if(f.type==='laser'&&f.age<=WEAPONS.laserDuration){
          const start=eyePosition(p),angles=[f.previousAngle,f.angle],hit=angles.some(a=>segmentContact({x,y},q,start,{x:start.x+Math.cos(a)*WEAPONS.laserRange,y:start.y+Math.sin(a)*WEAPONS.laserRange},q.radius+13));
          if(hit||sectorHit(start,f.previousAngle,f.angle,q,q.radius,WEAPONS.laserRange))this.clearProjectile(q,'laser');
        }
        if(q.cleared)break;
      }
      if(q.cleared)continue;
      // Relative swept collision lets fast flight genuinely dodge a slow projectile.
      const rx=x-oldX,ry=y-oldY,dx=q.x-x-(p.x-oldX),dy=q.y-y-(p.y-oldY);
      const t=clamp(-(rx*dx+ry*dy)/(dx*dx+dy*dy||1),0,1);
      if(Math.hypot(rx+dx*t,ry+dy*t)<q.radius+27){
        if(q.type==='rock'&&p.flightSpeed>100)this.clearProjectile(q,'ram');
        else{q.age=q.life;if(q.type==='rock')this.rockDebris(q);this.bodyImpact(q.x,q.y,q.type,q.vx,q.vy,q.power||1,q.shove||0);}
      }
      if(q.type==='rock'&&q.age<q.life&&q.y>WORLD.ground-15&&q.vy>0){q.age=q.life;this.rockDebris(q);this.effects.push({type:'burst',x:q.x,y:WORLD.ground-12,age:0,life:.35,big:false,color:'#ddc3a0'});}
    }
    this.projectiles=this.projectiles.filter(q=>!q.cleared&&q.age<q.life&&Math.abs(q.x-p.x)<2100&&q.y>-500&&q.y<1500);
    for(const f of this.effects){
      if(!['enemy-beam','enemy-blast'].includes(f.type)||f.cancelled)continue;
      const owner=this.enemies.find(e=>e.id===f.owner&&e.hp>0);
      if(!owner||this.run.complete){f.age=f.life;continue;}
      // Lock the attack position and aim while charging: flying aside genuinely dodges it.
      if(!f.shove){const origin=this.enemyMuzzle(owner,true);f.x=origin.x;f.y=origin.y;}
      if(f.hit||f.age<f.charge||f.age>f.charge+f.fire)continue;
      const angle=Math.atan2(f.ty-f.y,f.tx-f.x),dx=p.x-f.x,dy=p.y-f.y,along=dx*Math.cos(angle)+dy*Math.sin(angle),across=Math.abs(dx*Math.sin(angle)-dy*Math.cos(angle));
      const contact=f.type==='enemy-blast'?distance(p,f)<this.hazardRadius(f)+27:along>=0&&along<1400&&across<38;
      if(contact){f.hit=true;this.bodyImpact(f.x,f.y,'beam',dx,dy,f.power||1,f.shove||0);}
    }
  }
  ringFlight(){
    if(!this.run.complete)return false;
    this.ringRun=true;this.ringsTaken=0;this.rings=Array.from({length:12},(_,i)=>({x:450+i*(WORLD.width-900)/11,y:220+(i%4)*110,taken:false}));
    this.emit('rings-start');return true;
  }
  update(dt, keys = {}, bounds) {
    this.setViewport(bounds);
    if(this.paused)return;
    dt=clamp(dt,0,.04);this.time+=dt;if(!this.run.complete)this.run.playSeconds+=dt;
    this.laserCd=Math.max(0,this.laserCd-dt);this.sparkCd=Math.max(0,this.sparkCd-dt);this.blastCd=Math.max(0,this.blastCd-dt);this.auraCd-=dt;
    this.player.flare=Math.max(0,this.player.flare-dt);this.player.hitFlash=Math.max(0,this.player.hitFlash-dt);this.player.impactCooldown=Math.max(0,this.player.impactCooldown-dt);this.shake=Math.max(0,this.shake-dt*20);
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
    p.flightSpeed=Math.hypot(p.x-oldX,p.y-oldY)/Math.max(dt,.001);
    const flownX=p.x,flownY=p.y;
    const drag=p.kickDrag||8,decay=Math.exp(-drag*dt),push=(1-decay)/drag;
    p.x+=p.kickX*push;p.y+=p.kickY*push;p.kickX*=decay;p.kickY*=decay;
    p.x=clamp(p.x,40,WORLD.width-40);p.y=clamp(p.y,105,WORLD.ground-HERO_FEET);
    if(p.x===40||p.x===WORLD.width-40)p.kickX=0;if(p.y===105||p.y===WORLD.ground-HERO_FEET)p.kickY=0;
    if(p.y>=WORLD.ground-HERO_FEET-1&&ky>=0&&!this.target)p.landed=true;
    if(kx||ky) for(const r of this.roofs) if(ky>0&&p.x>r.x&&p.x<r.x+r.w&&oldY+HERO_FEET<=roofSurface(r)&&p.y+HERO_FEET>=roofSurface(r)){p.y=roofSurface(r)-HERO_FEET;p.landed=true;}
    p.vx=(p.x-oldX)/Math.max(dt,.001);p.vy=(p.y-oldY)/Math.max(dt,.001);
    // Face deliberate flight, never the recoil added by an incoming hit.
    const flightVx=(flownX-oldX)/Math.max(dt,.001);
    if(Math.abs(flightVx)>4)p.facing=Math.sign(flightVx);
    p.trail.push({x:p.x,y:p.y,age:0});for(const t of p.trail)t.age+=dt;p.trail=p.trail.filter(t=>t.age<.3).slice(-18);
    if(!this.run.complete){
      const checkpoint=this.run.checkpoint;
      this.run.frontier=Math.max(this.run.frontier,p.x);
      this.run.checkpoint=Math.min(SITE_COUNT,Math.floor(this.run.frontier/SITE_SPACING));
      this.syncEncounters(bounds);
      if(this.run.checkpoint>checkpoint)this.emit('checkpoint');
    }
    for(const e of this.enemies){
      if(e.hp<=0)continue;e.hit=Math.max(0,e.hit-dt);e.cd-=dt;
      if(e.type==='drone')e.y=e.homeY+Math.sin(this.time*1.8+e.phase)*22;
      if(e.type==='bot')e.x=e.homeX+Math.sin(this.time*.7+e.phase)*20;
      if(e.type==='titan')e.y=e.homeY+Math.sin(this.time*1.2)*5;
      if(e.type==='excavator')e.x=e.homeX+Math.sin(this.time*.5)*25;
      if(e.type==='wyvern'){e.x=e.homeX+Math.sin(this.time*.65)*170;e.y=e.homeY+Math.sin(this.time*.95)*140;}
      if(e.type==='crab')e.x=e.homeX+Math.sin(this.time*.6)*70;
      if(e.type==='dreadnought'){e.x=e.homeX+Math.sin(this.time*.5)*100;e.y=e.homeY+Math.sin(this.time*.8)*75;}
      if(e.type==='scarab')e.x=e.homeX+Math.sin(this.time*.45)*45;
      if(e.type==='leviathan'){e.x=e.homeX+Math.sin(this.time*.45)*85;e.y=e.homeY+Math.sin(this.time*.7)*95;}
      if(e.type==='rival'){e.x=e.homeX+Math.sin(this.time*.65)*95;e.y=e.homeY+Math.sin(this.time*.8)*145;}
      // Only a deliberate new approach punches. Retreat beyond the silhouette to rearm.
      const shapes=hitShapes(e,this.time),gap=Math.min(...shapes.map(([sx,sy,r])=>Math.hypot(p.x-e.x-sx,p.y-e.y-sy)-r));
      if(gap>110)this.ramContacts.delete(e.id);
      const dx=flownX-oldX,dy=flownY-oldY;
      const crossed=shapes.some(([sx,sy,r])=>{
        const t=clamp(((e.x+sx-oldX)*dx+(e.y+sy-oldY)*dy)/(dx*dx+dy*dy||1),0,1);
        return Math.hypot(e.x+sx-oldX-dx*t,e.y+sy-oldY-dy*t)<r+25;
      });
      const startedOutside=shapes.every(([sx,sy,r])=>Math.hypot(oldX-e.x-sx,oldY-e.y-sy)>=r+25-1e-6);
      if(!this.ramContacts.has(e.id)&&(crossed||gap<25)){
        this.ramContacts.add(e.id);
        if(p.flightSpeed>50&&startedOutside&&crossed)this.damage(e,'ram');
      }
      const visible=this.isVisible(e);
      if(!this.run.complete&&e.hp>0&&e.cd<=0&&visible&&distance(p,e)<(e.boss?1400:1100))this.fireEnemy(e);
    }
    this.aim=this.nearest(900,bounds)?.id||null;
    for(const f of this.effects){
      const previousAge=f.age;f.age+=dt;
      if(f.type==='chain')this.chainHits(f);
      if(f.type==='laser'&&previousAge<WEAPONS.laserDuration){const angle=laserAngle(f);this.laserHits(f,f.angle,angle);f.angle=angle;}
      if(f.type==='sphere')this.blastInterceptions(f);
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
      for(let district=0;district<DISTRICT_COUNT;district++){
        if(this.run.restored.includes(district))continue;
        let cleared=true;
        for(let site=district*3;site<district*3+3&&cleared;site++)for(let wave=0;wave<this.level.waves&&cleared;wave++)for(let i=0;i<this.level.squad;i++)if(!this.defeated.has(`${this.level.id}-${site}-${wave}-${i}`)){cleared=false;break;}
        if(cleared){this.run.restored.push(district);this.emit('milestone',{name:this.level.districts[district],level:this.save.level});}
      }
      if(this.run.bossHits===this.level.bossHp){
        this.run.complete=true;
        this.projectiles=[];this.effects=this.effects.filter(f=>!['enemy-beam','enemy-blast','rock-windup'].includes(f.type));
        if(!this.save.completed.includes(this.save.level))this.save.completed.push(this.save.level);
        this.emit('level-complete',{level:this.save.level});
      }
    }
    this.enemies=this.enemies.filter(e=>e.hp>0);
  }
}
