import {LEVELS,unlockedLevel} from './levels.js?v=world105';

// Presentation time is separate from the simulation's clamped physics clock.
export class VictoryReturn {
  constructor(){this.remaining=0;this.level=null;}
  start(level){this.level=level;this.remaining=3;}
  cancel(){this.level=null;this.remaining=0;}
  get active(){return this.level!==null;}
  tick(seconds,paused=false){
    if(!this.active||paused)return false;
    this.remaining=Math.max(0,this.remaining-Math.max(0,seconds));
    if(this.remaining>1e-6)return false;
    this.cancel();return true;
  }
}

export function worldMenuHTML(save,recent=null){
  const unlocked=unlockedLevel(save);
  return `<div class="world-choices">${LEVELS.map((l,i)=>{
    const locked=i>unlocked,finished=i===recent,run=save.runs[i];
    const label=`${i+1}. ${l.name}${locked?' — locked':finished?' — just completed, play again':run.complete?' — play again':' — fly'}`;
    return `<button class="world-card${finished?' just-finished':''}" data-level="${i}" aria-label="${label}" ${locked?'disabled':''}>
      <canvas class="world-picture" data-world="${i}" width="720" height="240" aria-hidden="true"></canvas>
      <span class="world-number" aria-hidden="true">${i+1}</span>
      ${finished?'<span class="world-medal" aria-hidden="true"><svg><use href="#trophy-icon"/></svg><b>✓</b></span>':''}
      <span class="world-caption"><strong>${l.short}</strong><span class="world-action" aria-hidden="true">${locked?'<svg><use href="#lock-icon"/></svg>':run.complete?'↻':'▶'}</span></span>
      <small class="world-help">${locked?'Finish the previous world':finished?'Just completed! Fly again':run.complete?'Fly again':run.frontier>300?'Keep flying':'Let’s fly!'}</small>
    </button>`;
  }).join('')}</div>`;
}
