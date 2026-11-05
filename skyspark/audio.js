// Original synthesized score and effects. No recordings, external services or downloads.
export class Sound {
  constructor(){this.ctx=null;this.enabled=true;this.active=false;this.next=0;this.beat=0;this.master=null;}
  unlock(){
    if(!this.enabled)return;
    try{if(!this.ctx){this.ctx=new (globalThis.AudioContext||globalThis.webkitAudioContext)();this.master=this.ctx.createGain();this.master.gain.value=.22;this.master.connect(this.ctx.destination);}if(this.ctx.state==='suspended')this.ctx.resume().catch(()=>{});this.active=true;}catch{}
  }
  note(freq,time,duration,vol=.1,type='sine',slide){
    if(!this.ctx||!this.enabled||!this.active)return;
    const o=this.ctx.createOscillator(),g=this.ctx.createGain();o.type=type;o.frequency.setValueAtTime(freq,time);if(slide)o.frequency.exponentialRampToValueAtTime(Math.max(25,slide),time+duration);
    g.gain.setValueAtTime(0,time);g.gain.linearRampToValueAtTime(vol,time+.015);g.gain.exponentialRampToValueAtTime(.001,time+duration);
    o.connect(g);g.connect(this.master);o.start(time);o.stop(time+duration+.03);
  }
  effect(kind){
    if(!this.ctx||!this.active||!this.enabled)return;
    const t=this.ctx.currentTime;
    if(kind==='laser'){this.note(1300,t,.23,.2,'sawtooth',130);this.note(1800,t,.18,.06,'sine',260);}
    if(kind==='blast'){this.note(90,t,.8,.65,'sine',32);this.note(400,t,.7,.08,'triangle',70);}
    if(kind==='destroy'){this.note(220,t,.15,.15,'triangle',55);this.note(880,t,.12,.06,'sine');}
    if(kind==='spark'){this.note(1200,t,.1,.08,'triangle',350);}
    if(kind==='ring'){this.note(660,t,.24,.18);this.note(990,t+.08,.24,.14);}
    if(kind==='milestone'||kind==='rings-complete')for(let i=0;i<5;i++)this.note([392,494,587,784,988][i],t+i*.12,.6,.18,'triangle');
    if(kind==='titan-hit'){this.note(100,t,.4,.4,'triangle',45);}
  }
  update(paused){
    if(!this.ctx||!this.enabled)return;
    const t=this.ctx.currentTime;this.master.gain.setTargetAtTime(paused?0:.22,t,.1);
    if(paused){this.next=t+.1;return;}
    if(!this.active||this.next>t+.1)return;
    this.next=Math.max(this.next,t+.02);
    const chords=[[196,246.94,293.66],[164.81,196,246.94],[130.81,164.81,196],[146.83,185,220]],chord=chords[Math.floor(this.beat/16)%4];
    this.note(chord[[0,1,2,1,0,2,1,2][this.beat%8]]*2,this.next,.55,.075,'triangle');
    if(this.beat%4===0)this.note(chord[0]/2,this.next,1,.2);
    if(this.beat%8===0)for(const f of chord)this.note(f,this.next,1.8,.025,'sine');
    this.next+=.235;this.beat++;
  }
  toggle(){this.enabled=!this.enabled;if(this.enabled)this.unlock();if(this.master)this.master.gain.value=this.enabled?.22:0;return this.enabled;}
}
