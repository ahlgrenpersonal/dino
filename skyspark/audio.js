// Original synthesized score and effects. No recordings, external services or downloads.
export class Sound {
  constructor({createContext,now=()=>Date.now()}={}){this.createContext=createContext||(()=>new (globalThis.AudioContext||globalThis.webkitAudioContext)());this.now=now;this.ctx=null;this.enabled=true;this.active=false;this.next=0;this.beat=0;this.master=null;this.paused=false;this.recoverOnGesture=false;this.clock=null;this.clockAt=0;this.voices=new Set();}
  retire(){
    const old=this.ctx;this.active=false;
    try{if(this.master){this.master.gain.cancelScheduledValues(old.currentTime);this.master.gain.value=0;this.master.disconnect();}}catch{}
    for(const node of this.voices)try{node.stop();node.disconnect();}catch{}
    this.voices.clear();this.ctx=null;this.master=null;
    if(old&&old.state!=='closed')try{Promise.resolve(old.close()).catch(()=>{});}catch{}
  }
  foreground(){this.recoverOnGesture=true;this.active=false;this.next=0;}
  unlock({rebuild=false}={}){
    if(!this.enabled)return;
    try{
      const frozen=this.ctx?.state==='running'&&this.clock!==null&&this.ctx.currentTime===this.clock&&this.now()-this.clockAt>1200;
      if(this.ctx&&(rebuild||this.recoverOnGesture||this.ctx.state==='closed'||frozen))this.retire();
      this.recoverOnGesture=false;
      if(!this.ctx){this.ctx=this.createContext();this.master=this.ctx.createGain();this.master.gain.value=this.paused?0:.22;this.master.connect(this.ctx.destination);this.clock=null;this.next=0;this.kicked=false;}
      const ctx=this.ctx;
      const ready=()=>{if(this.ctx!==ctx||!this.enabled)return;this.active=ctx.state==='running';if(this.active){this.next=ctx.currentTime+.02;this.applyGain();}};
      // Safari may report interrupted rather than suspended after a background return.
      if(ctx.state!=='running'){this.active=false;Promise.resolve(ctx.resume()).then(ready).catch(()=>{if(this.ctx===ctx)this.active=false;});}else if(!this.active)ready();
      if(!this.kicked&&ctx.createBufferSource&&ctx.createBuffer){this.kicked=true;const kick=ctx.createBufferSource();kick.buffer=ctx.createBuffer(1,1,ctx.sampleRate||44100);kick.connect(this.master);kick.onended=()=>kick.disconnect();kick.start(0);}
    }catch{this.active=false;this.recoverOnGesture=true;}
  }
  applyGain(){if(!this.ctx||!this.master)return;try{const t=this.ctx.currentTime;this.master.gain.cancelScheduledValues(t);this.master.gain.setValueAtTime(this.enabled&&!this.paused ? 0.22 : 0,t);}catch{this.active=false;this.recoverOnGesture=true;}}
  setEnabled(value){this.enabled=!!value;if(this.enabled)this.unlock({rebuild:true});else{this.active=false;this.applyGain();}return this.enabled;}
  note(freq,time,duration,vol=.1,type='sine',slide){
    if(!this.ctx||!this.enabled||!this.active)return;
    try{
    const o=this.ctx.createOscillator(),g=this.ctx.createGain();o.type=type;o.frequency.setValueAtTime(freq,time);if(slide)o.frequency.exponentialRampToValueAtTime(Math.max(25,slide),time+duration);
    g.gain.setValueAtTime(0,time);g.gain.linearRampToValueAtTime(vol,time+.015);g.gain.exponentialRampToValueAtTime(.001,time+duration);
    o.connect(g);g.connect(this.master);this.voices.add(o);o.onended=()=>{this.voices.delete(o);o.disconnect();g.disconnect();};o.start(time);o.stop(time+duration+.03);
    }catch{this.active=false;this.recoverOnGesture=true;}
  }
  effect(kind,detail={}){
    if(!this.ctx||!this.active||!this.enabled)return;
    const t=this.ctx.currentTime;
    if(kind==='laser'){this.note(1300,t,.23,.2,'sawtooth',130);this.note(1800,t,.18,.06,'sine',260);}
    if(kind==='sparks')this.note(900,t,.16,.09,'triangle',1600);
    if(kind==='chain-hop'){const f=650+(detail.index||0)*120;this.note(f,t,.13,.07,'triangle',f*1.7);}
    if(kind==='intercept')this.note(1150,t,.1,.045,'triangle',1600);
    if(kind==='enemy-fire')this.note(190,t,.13,.035,'triangle',95);
    if(kind==='enemy-charge')this.note(330,t,.85,.045,'sine',850);
    if(kind==='boss-retreat'){this.note(780,t,.45,.08,'sine',1800);this.note(1300,t+.12,.35,.05,'triangle',220);}
    if(kind==='rock-charge'){this.note(70,t,1,.09,'sawtooth',135);this.note(170,t+.4,.5,.05,'triangle',230);}
    if(kind==='rock-throw'){this.note(120,t,.35,.14,'triangle',40);this.note(55,t,.45,.13,'sine',32);}
    if(kind==='shield-break'){this.note(240,t,.3,.12,'triangle',65);this.note(1150,t,.22,.06,'sine',320);}
    if(kind==='body-hit'){this.note(760,t,.18,.065,'sine',1250);this.note(1140,t+.03,.2,.035);}
    if(kind==='blast'){this.note(90,t,.8,.65,'sine',32);this.note(400,t,.7,.08,'triangle',70);}
    if(kind==='destroy'){this.note(220,t,.15,.15,'triangle',55);this.note(880,t,.12,.06,'sine');}
    if(kind==='spark'){this.note(1200,t,.1,.08,'triangle',350);}
    if(kind==='ring'){this.note(660,t,.24,.18);this.note(990,t+.08,.24,.14);}
    if(kind==='milestone'||kind==='level-complete'||kind==='rings-complete')for(let i=0;i<5;i++)this.note([392,494,587,784,988][i],t+i*.12,.6,.18,'triangle');
    if(kind==='titan-hit'){this.note(100,t,.4,.4,'triangle',45);}
  }
  update(paused){
    try{this.tick(paused);}catch{this.active=false;this.recoverOnGesture=true;}
  }
  tick(paused){
    if(this.paused!==paused){this.paused=paused;if(this.ctx){this.next=this.ctx.currentTime+.02;this.applyGain();}}
    if(!this.ctx||!this.enabled)return;
    const t=this.ctx.currentTime;
    if(this.ctx.state!=='running'){this.active=false;this.next=t+.02;return;}
    if(this.clock!==t){this.clock=t;this.clockAt=this.now();}
    if(paused){this.next=t+.02;return;}
    if(this.next>t+1)this.next=t+.02;
    if(!this.active||this.next>t+.1)return;
    this.next=Math.max(this.next,t+.02);
    const chords=[[196,246.94,293.66],[164.81,196,246.94],[130.81,164.81,196],[146.83,185,220]],chord=chords[Math.floor(this.beat/16)%4];
    this.note(chord[[0,1,2,1,0,2,1,2][this.beat%8]]*2,this.next,.55,.075,'triangle');
    if(this.beat%4===0)this.note(chord[0]/2,this.next,1,.2);
    if(this.beat%8===0)for(const f of chord)this.note(f,this.next,1.8,.025,'sine');
    this.next+=.235;this.beat++;
  }
  toggle(){return this.setEnabled(!this.enabled);}
}
