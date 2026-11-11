// Standard Adventure music, gesture unlock, level and mute/visibility behavior.
export function adventureAudio(enabled,doc=document){
 let audio,musicUnlocked=false;const music=doc.getElementById('music');
 function soundContext(){if(!audio){audio=new(window.AudioContext||window.webkitAudioContext)();const source=audio.createMediaElementSource(music),gain=audio.createGain();gain.gain.value=.28;source.connect(gain);gain.connect(audio.destination);}return audio;}
 function syncMusic(){if(!enabled()||doc.hidden){music.pause();audio?.suspend().catch(()=>{});return;}if(!musicUnlocked)return;try{soundContext().resume().catch(()=>{});if(music.paused)music.play().catch(()=>{});}catch{}}
 function unlockMusic(event){if(event.isTrusted){musicUnlocked=true;syncMusic();}}
 doc.addEventListener('pointerup',unlockMusic,{passive:true});doc.addEventListener('click',unlockMusic,{passive:true});doc.addEventListener('keydown',unlockMusic);doc.addEventListener('visibilitychange',syncMusic);
 function tone(freq=400,duration=.09,type='sine',volume=.035,slide=0){if(!enabled()||doc.hidden)return;try{soundContext().resume().catch(()=>{});const o=audio.createOscillator(),v=audio.createGain();o.type=type;o.frequency.setValueAtTime(freq,audio.currentTime);if(slide)o.frequency.exponentialRampToValueAtTime(Math.max(30,slide),audio.currentTime+duration);v.gain.setValueAtTime(volume,audio.currentTime);v.gain.exponentialRampToValueAtTime(.001,audio.currentTime+duration);o.connect(v).connect(audio.destination);o.start();o.stop(audio.currentTime+duration);}catch{}}
 return {syncMusic,tone};
}
