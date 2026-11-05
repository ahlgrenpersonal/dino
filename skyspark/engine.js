export const BUILD = 'world90';
export const WORLD = { width: 3200, height: 1000, ground: 850 };
export const HERO_FEET = 48, HERO_EYES = -33;
export const roofSurface = r => r.y - 17;
export function heroLean(p) { return p.landed ? 0 : clamp(p.vx / 1050, -.5, .5); }
export function eyePosition(p) {
  const a=heroLean(p),x=p.facing*8,y=HERO_EYES;
  return {x:p.x+x*Math.cos(a)-y*Math.sin(a),y:p.y+x*Math.sin(a)+y*Math.cos(a)};
}
export const LANDMARKS = [
  { id: 'plaza', name: 'Sunbeam Plaza', short: 'Plaza', x: 460, y: 730, color: '#ffd77c', description: 'Bring the fountain back to life.' },
  { id: 'roofs', name: 'Beacon Rooftops', short: 'Rooftops', x: 1510, y: 420, color: '#83f8dd', description: 'Light the rooftop beacon.' },
  { id: 'titan', name: 'Skybridge', short: 'Skybridge', x: 2650, y: 540, color: '#ffa6b5', description: 'Send the giant robot packing!' }
];
export const ROOFS = [
  { x: 60, y: 530, w: 230 }, { x: 800, y: 590, w: 200 },
  { x: 1160, y: 460, w: 220 }, { x: 1440, y: 550, w: 225 },
  { x: 1760, y: 390, w: 220 }, { x: 2100, y: 575, w: 180 }
];
const clamp = (n, a, b) => Math.max(a, Math.min(b, n));
export const distance = (a, b) => Math.hypot(a.x - b.x, a.y - b.y);
export const freshSave = () => ({ schema: 1, stage: 0, total: 0, cleared: [], bossHits: 0, best: 0, sound: true, position: { x: 370, y: 720 } });
export function readSave(raw) {
  const s = freshSave();
  if (!raw || raw.schema !== 1) return s;
  s.stage = Number.isInteger(raw.stage) ? clamp(raw.stage, 0, 3) : 0;
  for (const k of ['total', 'best']) s[k] = Number.isFinite(raw[k]) ? clamp(Math.floor(raw[k]), 0, 1e7) : 0;
  s.cleared = Array.isArray(raw.cleared) ? [...new Set(raw.cleared.filter(x => typeof x === 'string' && /^s[012]-[0-9]+$/.test(x)))].slice(0, 40) : [];
  s.bossHits = Number.isInteger(raw.bossHits) ? clamp(raw.bossHits, 0, 4) : 0;
  s.sound = raw.sound !== false;
  if (raw.position && Number.isFinite(raw.position.x) && Number.isFinite(raw.position.y)) s.position = { x: clamp(raw.position.x, 45, WORLD.width - 45), y: clamp(raw.position.y, 110, WORLD.ground - HERO_FEET) };
  return s;
}
export class SkyGame {
  constructor(save, onEvent = () => {}) {
    this.save = readSave(save); this.onEvent = onEvent; this.time = 0; this.paused = false;
    this.player = { ...this.save.position, vx: 0, vy: 0, facing: 1, landed: false, flare: 0, trail: [] };
    this.target = null; this.route = null; this.aim = null;
    this.effects = []; this.particles = []; this.enemies = []; this.rings = [];
    this.laserCd = 0; this.blastCd = 0; this.auraCd = .7; this.combo = 0; this.comboTime = 0;
    this.shake = 0; this.replay = false; this.wave = 0; this.waveWait = 0; this.ringRun = false; this.ringsTaken = 0; this.restoreReady = false;
    this.spawnStage();
  }
  emit(type, data = {}) { this.onEvent({ type, ...data }); }
  snapshot() { this.save.position = { x: this.player.x, y: this.player.y }; return structuredClone(this.save); }
  spawnStage() {
    const stage = this.save.stage;
    if (stage > 2) return;
    const positions = stage === 0 ? [[510,810],[610,810],[700,810],[820,550],[940,760],[560,610]]
      : stage === 1 ? [[1220,420],[1340,420],[1510,510],[1600,510],[1810,350],[1920,350],[1550,285],[1750,220]]
      : [[2370,810],[2480,810],[2830,810],[2960,810],[2420,460],[2900,400],[2600,260],[2770,220]];
    positions.forEach(([x,y], i) => {
      const id = `s${stage}-${i}`;
      const roof=ROOFS.find(r=>x>=r.x&&x<=r.x+r.w&&Math.abs(y-r.y)<100);
      const type=y>=800||roof?'bot':'drone';
      const cy=type==='bot'?(y>=800?WORLD.ground-50:roofSurface(roof)-50):y;
      if (!this.save.cleared.includes(id)) this.enemies.push(this.robot(id, x, cy, type));
    });
    if (stage === 2 && this.save.bossHits < 4) {
      this.enemies.push({ id: 'titan', x: 2670, y: 640, homeX: 2670, homeY: 640, type: 'titan', hp: 4 - this.save.bossHits, maxHp: 4, radius: 110, hit: 0, cd: 3, phase: 0 });
    }
  }
  robot(id, x, y, type = 'bot') { return { id, x, y, homeX: x, homeY: y, type, hp: 1, maxHp: 1, radius: type === 'drone' ? 26 : 25, hit: 0, cd: 2 + (x % 7) * .4, phase: x * .03 }; }
  moveTo(x, y) {
    if (this.paused) return;
    this.route = null;
    const victim = this.enemies.filter(e => e.hp > 0 && Math.hypot(e.x-x,e.y-y) < e.radius + 35).sort((a,b)=>Math.hypot(a.x-x,a.y-y)-Math.hypot(b.x-x,b.y-y))[0];
    let landing = null;
    if (!victim) landing = ROOFS.find(r => x >= r.x - 8 && x <= r.x+r.w+8 && Math.abs(y-roofSurface(r)) < 44);
    this.target = victim ? { x: victim.x, y: victim.y, enemy: victim.id }
      : { x: clamp(x, 40, WORLD.width-40), y: landing ? roofSurface(landing)-HERO_FEET : y > WORLD.ground-65 ? WORLD.ground-HERO_FEET : clamp(y, 105, WORLD.ground-HERO_FEET), land: !!landing || y > WORLD.ground-65 };
    this.player.landed = false;
    this.emit('move');
  }
  travel(id) {
    const index = LANDMARKS.findIndex(l => l.id === id);
    if (index < 0 || index > Math.min(2, this.save.stage)) return false;
    const l = LANDMARKS[index];
    const enemy=index===this.save.stage?this.nearest(Infinity):null;
    const restore=this.restoreReady&&index===this.save.stage;
    this.target = restore ? {x:index===0?480:1515,y:index===0?690:340}
      : enemy ? {x:enemy.x,y:enemy.y,enemy:enemy.id} : { x: l.x, y: l.y };
    this.route = id; this.player.landed = false;
    this.emit('travel', { name: l.name }); return true;
  }
  stop() { this.target = null; this.route = null; }
  nearest(range = 650, bounds) {
    return this.enemies.filter(e => e.hp > 0 && distance(e,this.player) < range && (!bounds || e.x+e.radius>bounds.left && e.x-e.radius<bounds.right && e.y+e.radius>bounds.top && e.y-e.radius<bounds.bottom))
      .sort((a,b) => distance(a,this.player)-distance(b,this.player))[0] || null;
  }
  damage(e, kind) {
    if (e.hp <= 0) return false;
    e.lastHits ||= {};
    if (this.time-(e.lastHits[kind]??-10) < (kind==='ram'?.85:kind==='spark'?.8:.5)) return false;
    e.lastHits[kind]=this.time;
    e.hp--; e.hit = e.type === 'titan' ? .35 : .1;
    this.player.flare = .35;
    this.shake = Math.max(this.shake, e.type === 'titan' ? 7 : 2);
    this.effects.push({ type: 'burst', x: e.x, y: e.y, age: 0, life: .55, big: e.type === 'titan', color: kind === 'laser' ? '#ffb3cf' : '#96faff' });
    if (e.type === 'titan') {
      this.save.bossHits = 4-e.hp;
      this.emit('titan-hit', { hits: this.save.bossHits });
    }
    if (e.hp > 0) return true;
    this.save.total++; this.combo++; this.comboTime = 3.5; this.save.best = Math.max(this.save.best,this.combo);
    if (!this.replay && e.id !== 'titan') this.save.cleared.push(e.id);
    if(kind==='laser')this.effects.push({type:'split',x:e.x,y:e.y,age:0,life:e.type==='titan'?1:.7,robot:{...e,hp:e.maxHp,hit:0}});
    for (let i=0;i<(e.type==='titan'?50:12);i++) {
      const a = (i * 2.399) + this.time;
      this.particles.push({ x:e.x, y:e.y, vx:Math.cos(a)*(80+i*5), vy:Math.sin(a)*180-70, age:0, life:.6+(i%5)*.12, size:3+i%5, color:i%3===0?'#ffc978':i%3===1?'#b3efff':'#546b89', metal:i%3!==0, sliced:kind==='laser' });
    }
    this.emit('destroy', { kind, giant:e.type==='titan', combo:this.combo });
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
  ringFlight() {
    this.ringRun = true; this.ringsTaken=0;
    this.rings = [[650,430],[850,270],[1110,300],[1360,180],[1620,260],[1880,200],[2100,370],[2330,300]].map(([x,y])=>({x,y,taken:false}));
    this.target={x:650,y:430};this.route=null;this.player.landed=false;
    this.emit('rings-start');
  }
  startReplay() {
    if(this.save.stage<3||this.replay||this.enemies.some(e=>e.hp>0))return false;
    this.replay=true;this.wave++;this.waveWait=0;
    const x=clamp(this.player.x,400,WORLD.width-400);
    for(let i=0;i<8;i++)this.enemies.push(this.robot(`wave${this.wave}-${i}`,x-300+(i%4)*200,i<4?800:400+(i%3)*65,i<4?'bot':'drone'));
    this.emit('wave',{wave:this.wave});return true;
  }
  update(dt, keys = {}, bounds) {
    if(this.paused)return;
    dt=clamp(dt,0,.04);this.time+=dt;
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
    if(kx||ky) for(const r of ROOFS) if(ky>0&&p.x>r.x&&p.x<r.x+r.w&&oldY+HERO_FEET<=roofSurface(r)&&p.y+HERO_FEET>=roofSurface(r)){p.y=roofSurface(r)-HERO_FEET;p.landed=true;}
    p.vx=(p.x-oldX)/Math.max(dt,.001);p.vy=(p.y-oldY)/Math.max(dt,.001);
    if(Math.abs(p.vx)>4)p.facing=Math.sign(p.vx);
    p.trail.push({x:p.x,y:p.y,age:0});for(const t of p.trail)t.age+=dt;p.trail=p.trail.filter(t=>t.age<.3).slice(-18);
    for(const e of this.enemies){
      if(e.hp<=0)continue;e.hit=Math.max(0,e.hit-dt);e.cd-=dt;
      if(e.type==='drone')e.y=e.homeY+Math.sin(this.time*1.8+e.phase)*22;
      if(e.type==='bot')e.x=e.homeX+Math.sin(this.time*.7+e.phase)*20;
      if(e.type==='titan')e.y=e.homeY+Math.sin(this.time*1.2)*5;
      // Swept collisions keep fast flight attacks reliable, including a short tap through a robot.
      const dx=p.x-oldX,dy=p.y-oldY,t=clamp(((e.x-oldX)*dx+(e.y-oldY)*dy)/(dx*dx+dy*dy||1),0,1);
      if(Math.hypot(e.x-oldX-dx*t,e.y-oldY-dy*t)<e.radius+25&&Math.hypot(p.vx,p.vy)>50)this.damage(e,'ram');
      if(e.hp>0&&e.cd<=0&&distance(p,e)<(e.type==='titan'?600:380)){
        e.cd=e.type==='titan'?3.8:4;
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
    if(this.save.stage<3&&!this.enemies.some(e=>e.hp>0)){
      if(this.save.stage<2&&!this.restoreReady){this.restoreReady=true;this.emit('restore-ready',{stage:this.save.stage});}
      const place=this.save.stage===0?{x:480,y:690}:{x:1515,y:340};
      if(this.save.stage===2||distance(p,place)<85){
        this.save.stage++;this.save.cleared=[];this.restoreReady=false;this.stop();this.spawnStage();this.emit('milestone',{stage:this.save.stage});
      }
    }
    if(this.replay&&!this.enemies.some(e=>e.hp>0)&&this.waveWait===0){this.waveWait=1;this.replay=false;this.emit('wave-complete',{wave:this.wave});}
    this.enemies=this.enemies.filter(e=>e.hp>0);
  }
}
