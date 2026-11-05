import { BUILD, WORLD, SITE_COUNT, LEVELS, roofsFor, sitesFor, freshRun, freshSave, readSave, unlockedLevel } from './levels.js?v=world92';
export { BUILD, WORLD, SITE_COUNT, LEVELS, freshSave, readSave, unlockedLevel };
export const HERO_FEET=48,HERO_EYES=-33;
export const roofSurface=r=>r.y-17;
const clamp=(n,a,b)=>Math.max(a,Math.min(b,n));
export const distance=(a,b)=>Math.hypot(a.x-b.x,a.y-b.y);
// Local circles follow the new bosses' silhouettes, including moving wing tips.
export function hitShapes(e,time=0){
  if(e.type==='excavator')return [[-80,60,105],[15,-10,110],...(e.hp>2?[[105,-55,48],[155,-80+Math.sin(time*.9)*16,48],[230,20,60]]:[])];
  if(e.type==='wyvern'){const wing=Math.sin(time*3)*28;return [[0,0,65],[0,-86,48],[0,98,46],...[-1,1].flatMap(f=>[[f*80,-8,70],[f*149,-38-wing*.5,65],[f*215,-59-wing,42]])];}
  return [[0,0,e.radius]];
}
export function heroLean(p){return p.landed?0:clamp(p.vx/1050,-.5,.5);}
export function eyePosition(p){const a=heroLean(p),x=p.facing*8,y=HERO_EYES;return{x:p.x+x*Math.cos(a)-y*Math.sin(a),y:p.y+x*Math.sin(a)+y*Math.cos(a)};}
export class SkyGame {
  constructor(save,onEvent=()=>{}){this.save=readSave(save);this.onEvent=onEvent;this.time=0;this.paused=false;this.setupRun();}
  get level(){return LEVELS[this.save.level];}
  get run(){return this.save.runs[this.save.level];}
  get site(){return this.sites[Math.min(SITE_COUNT-1,this.run.checkpoint)];}
  setupRun(){
    this.sites=sitesFor(this.save.level);this.roofs=roofsFor(this.save.level);
    this.player={...this.run.position,vx:0,vy:0,facing:1,landed:false,flare:0,trail:[]};
    this.target=null;this.route=null;this.aim=null;this.effects=[];this.particles=[];this.enemies=[];this.rings=[];
    this.laserCd=0;this.blastCd=0;this.auraCd=.7;this.combo=0;this.comboTime=0;this.shake=0;this.restoreReady=false;this.incoming=0;this.ringRun=false;this.ringsTaken=0;
    this.spawnEncounter();
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
  robot(id,x,y,type='bot'){return{id,x,y,homeX:x,homeY:y,type,hp:1,maxHp:1,radius:type==='drone'?26:25,hit:0,cd:2+(x%7)*.4,phase:x*.03,paint:this.save.level};}
  spawnEncounter(){
    if(this.run.complete)return;
    const r=this.run,l=this.level,boss=r.checkpoint===SITE_COUNT;
    if(boss){
      if(r.bossHits<l.bossHp)this.enemies.push({id:`${l.id}-boss`,type:l.bossType,boss:true,name:l.boss,x:9220,y:l.bossType==='wyvern'?400:l.bossType==='excavator'?720:640,homeX:9220,homeY:l.bossType==='wyvern'?400:l.bossType==='excavator'?720:640,hp:l.bossHp-r.bossHits,maxHp:l.bossHp,radius:l.bossType==='excavator'?150:115,hit:0,cd:3,phase:0});
      for(let i=0;i<8;i++){const id=`${l.id}-${SITE_COUNT}-0-${i}`;if(!r.cleared.includes(id))this.enemies.push(this.robot(id,8940+(i%4)*175,i<4?800:270+(i%3)*70,i<4?'bot':'drone'));}
      return;
    }
    const site=this.site;
    for(let i=0;i<l.squad;i++){
      const id=`${l.id}-${r.checkpoint}-${r.wave}-${i}`;if(r.cleared.includes(id))continue;
      let x,y,type;
      if(site.pattern===0){x=site.x-280+(i%5)*125;y=i<5?800:440+(i%3)*80;type=i<5?'bot':'drone';}
      else if(site.pattern===1){x=site.x-250+(i%4)*170;y=210+Math.floor(i/4)*180;type='drone';}
      else if(site.pattern===2){x=site.x-290+(i%5)*140;y=i<5?800:410+(i%3)*110;type=i<5?'bot':'drone';}
      else {x=site.x-260+(i%4)*170;y=330+Math.floor(i/4)*170;type='drone';}
      if(this.save.level===0&&type==='bot'&&r.checkpoint%3===1){const roof=this.roofs.find(p=>Math.abs(p.x-site.x)<350);if(roof){x=roof.x+25+(i%4)*42;y=roofSurface(roof)-50;}}
      this.enemies.push(this.robot(id,clamp(x,60,WORLD.width-60),y,type));
    }
  }
  goal(){
    if(this.run.complete)return null;
    if(this.restoreReady)return{x:this.site.restoreX,y:this.site.restoreY,kind:'restore'};
    const enemy=this.nearest(Infinity);if(enemy)return{x:enemy.x,y:enemy.y,enemy:enemy.id,kind:'robot'};
    return{x:this.site.x,y:this.site.y,kind:'incoming'};
  }
  travel(index='next'){
    if(this.paused)return false;
    let goal;
    if(index==='next')goal=this.goal();
    else if(Number.isInteger(index)&&index>=0&&index<=Math.min(this.run.checkpoint,SITE_COUNT-1))goal={x:this.sites[index].x,y:this.sites[index].y};
    if(!goal)return false;
    this.target={...goal};this.route=this.run.checkpoint===SITE_COUNT?this.level.boss:this.site.name;this.player.landed=false;this.emit('travel',{name:this.route});return true;
  }
  stop(){this.target=null;this.route=null;}
  moveTo(x, y) {
    if (this.paused) return;
    this.route = null;
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
  damage(e, kind) {
    if (e.hp <= 0) return false;
    e.lastHits ||= {};
    if (this.time-(e.lastHits[kind]??-10) < (kind==='ram'?.85:kind==='spark'?.8:.5)) return false;
    e.lastHits[kind]=this.time;
    e.hp--; e.hit = e.boss ? .35 : .1;
    this.player.flare = .35;
    this.shake = Math.max(this.shake, e.boss ? 7 : 2);
    this.effects.push({ type: 'burst', x: e.x, y: e.y, age: 0, life: .55, big: e.boss, color: kind === 'laser' ? '#ffb3cf' : '#96faff' });
    if (e.boss) {
      this.run.bossHits = e.maxHp-e.hp;
      this.emit('titan-hit', { hits: this.run.bossHits });
    }
    if (e.hp > 0) return true;
    this.save.total++; this.combo++; this.comboTime = 3.5; this.save.best = Math.max(this.save.best,this.combo);
    if (!e.boss) this.run.cleared.push(e.id);
    if(kind==='laser')this.effects.push({type:'split',x:e.x,y:e.y,age:0,life:e.boss?1:.7,robot:{...e,hp:e.maxHp,hit:0}});
    for (let i=0;i<(e.boss?50:12);i++) {
      const a = (i * 2.399) + this.time;
      this.particles.push({ x:e.x, y:e.y, vx:Math.cos(a)*(80+i*5), vy:Math.sin(a)*180-70, age:0, life:.6+(i%5)*.12, size:3+i%5, color:i%3===0?'#ffc978':i%3===1?'#b3efff':'#546b89', metal:i%3!==0, sliced:kind==='laser' });
    }
    this.emit('destroy', { kind, giant:e.boss, combo:this.combo });
    return true;
  }
  laser(bounds) {
    if (this.paused || this.laserCd>0) return false;
    const e = this.nearest(900,bounds); this.laserCd = .7;
    const p = this.player;
    if (e) p.facing = e.x>=p.x?1:-1;
    const start = eyePosition(p);
    const a = e ? Math.atan2(e.y-start.y,e.x-start.x) : (p.facing>0?0:Math.PI);
    const end = { x:start.x+Math.cos(a)*1000,y:start.y+Math.sin(a)*1000 };
    this.effects.push({type:'laser',x:start.x,y:start.y,tx:end.x,ty:end.y,age:0,life:.36});
    for (const bot of this.enemies) {
      if(bot.hp<=0)continue;
      const dx=bot.x-start.x,dy=bot.y-start.y,along=dx*Math.cos(a)+dy*Math.sin(a),perp=Math.abs(dx*Math.sin(a)-dy*Math.cos(a));
      if(along>=0&&along<1000&&perp<bot.radius+13&&(!bounds||bot.x+bot.radius>bounds.left&&bot.x-bot.radius<bounds.right&&bot.y+bot.radius>bounds.top&&bot.y-bot.radius<bounds.bottom)) this.damage(bot,'laser');
    }
    this.emit('laser'); return true;
  }
  blast() {
    if (this.paused || this.blastCd>0) return false;
    this.blastCd = 5; this.shake = 6; this.player.flare = .8;
    this.effects.push({type:'sphere',x:this.player.x,y:this.player.y,age:0,life:.85,radius:450,hit:[]});
    this.emit('blast'); return true;
  }
  ringFlight(){
    if(!this.run.complete)return false;
    this.ringRun=true;this.ringsTaken=0;this.rings=Array.from({length:12},(_,i)=>({x:450+i*740,y:220+(i%4)*110,taken:false}));
    this.target={x:this.rings[0].x,y:this.rings[0].y};this.route=null;this.player.landed=false;this.emit('rings-start');return true;
  }
  update(dt, keys = {}, bounds) {
    if(this.paused)return;
    dt=clamp(dt,0,.04);this.time+=dt;if(!this.run.complete)this.run.playSeconds+=dt;
    if(this.incoming>0){this.incoming=Math.max(0,this.incoming-dt);if(this.incoming===0)this.spawnEncounter();}
    this.laserCd=Math.max(0,this.laserCd-dt);this.blastCd=Math.max(0,this.blastCd-dt);this.auraCd-=dt;
    this.player.flare=Math.max(0,this.player.flare-dt);this.shake=Math.max(0,this.shake-dt*20);
    this.comboTime-=dt;if(this.comboTime<=0)this.combo=0;
    const p=this.player,oldX=p.x,oldY=p.y;
    const kx=(keys.right?1:0)-(keys.left?1:0),ky=(keys.down?1:0)-(keys.up?1:0);
    if(kx||ky){this.target=null;this.route=null;p.landed=false;const n=Math.hypot(kx,ky);p.x+=kx/n*470*dt;p.y+=ky/n*470*dt;}
    else if(this.target){
      const victim=this.target.enemy&&this.enemies.find(e=>e.id===this.target.enemy&&e.hp>0);
      if(victim){this.target.x=victim.x;this.target.y=victim.y;}
      const d=distance(p,this.target),speed=this.route?650:500,step=Math.min(d,speed*dt);
      if(d>1){p.x+=(this.target.x-p.x)/d*step;p.y+=(this.target.y-p.y)/d*step;}
      if(d<8){p.landed=!!this.target.land;this.target=null;if(this.route){this.emit('arrive',{id:this.route});this.route=null;}}
    }
    p.x=clamp(p.x,40,WORLD.width-40);p.y=clamp(p.y,105,WORLD.ground-HERO_FEET);
    if(p.y>=WORLD.ground-HERO_FEET-1&&ky>=0&&!this.target)p.landed=true;
    if(kx||ky) for(const r of this.roofs) if(ky>0&&p.x>r.x&&p.x<r.x+r.w&&oldY+HERO_FEET<=roofSurface(r)&&p.y+HERO_FEET>=roofSurface(r)){p.y=roofSurface(r)-HERO_FEET;p.landed=true;}
    p.vx=(p.x-oldX)/Math.max(dt,.001);p.vy=(p.y-oldY)/Math.max(dt,.001);
    if(Math.abs(p.vx)>4)p.facing=Math.sign(p.vx);
    p.trail.push({x:p.x,y:p.y,age:0});for(const t of p.trail)t.age+=dt;p.trail=p.trail.filter(t=>t.age<.3).slice(-18);
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
      if(e.hp>0&&e.cd<=0&&distance(p,e)<(e.boss?600:380)){
        e.cd=e.boss?3.8:4;
        this.effects.push({type:'enemy-shot',x:e.x,y:e.y,tx:p.x,ty:p.y,age:0,life:.65});
        this.emit('shield'); // All hostile shots are absorbed. No health or lost progress.
      }
    }
    this.aim=this.nearest(900,bounds)?.id||null;
    if(this.auraCd<=0){
      this.auraCd=.85;
      const near=this.enemies.filter(e=>e.hp>0&&distance(p,e)<125);
      for(const e of near.slice(0,3)){this.effects.push({type:'zap',x:p.x,y:p.y,tx:e.x,ty:e.y,age:0,life:.28});this.damage(e,'spark');}
      if(near.length)this.emit('spark');
    }
    for(const f of this.effects){
      f.age+=dt;
      if(f.type==='sphere')for(const e of this.enemies)if(e.hp>0&&!f.hit.includes(e.id)&&distance(e,f)<Math.min(1,f.age/.55)*f.radius+e.radius){if(this.damage(e,'sphere'))f.hit.push(e.id);}
    }
    this.effects=this.effects.filter(e=>e.age<e.life);
    for(const s of this.particles){s.age+=dt;s.x+=s.vx*dt;s.y+=s.vy*dt;s.vy+=420*dt;}
    this.particles=this.particles.filter(s=>s.age<s.life).slice(-220);
    for(const r of this.rings)if(!r.taken&&distance(p,r)<52){r.taken=true;this.ringsTaken++;this.emit('ring',{count:this.ringsTaken});}
    if(this.ringRun&&this.ringsTaken===this.rings.length){this.ringRun=false;this.emit('rings-complete');}
    if(!this.run.complete&&this.incoming===0&&!this.enemies.some(e=>e.hp>0)){
      const run=this.run;
      if(run.checkpoint===SITE_COUNT){
        run.complete=true;run.bossHits=this.level.bossHp;run.cleared=[];
        if(!this.save.completed.includes(this.save.level))this.save.completed.push(this.save.level);
        this.stop();this.emit('level-complete',{level:this.save.level});
      }else if(run.wave+1<this.level.waves){
        run.wave++;run.cleared=[];this.incoming=.75;this.emit('incoming',{wave:run.wave+1});
      }else{
        if(this.site.restore&&!this.restoreReady){this.restoreReady=true;this.emit('restore-ready',{name:this.site.name,task:this.site.task});}
        if(!this.site.restore||distance(p,{x:this.site.restoreX,y:this.site.restoreY})<75){
          const site=this.site;run.checkpoint++;run.wave=0;run.cleared=[];this.restoreReady=false;this.stop();
          this.emit(site.restore?'milestone':'checkpoint',{name:site.name,checkpoint:run.checkpoint,level:this.save.level});this.spawnEncounter();
        }
      }
    }
    this.enemies=this.enemies.filter(e=>e.hp>0);
  }
}
