import { BUILD, SkyGame, LANDMARKS, freshSave, readSave } from './engine.js?v=world90';
import { Renderer, hero } from './art.js?v=world90';
import { Sound } from './audio.js?v=world90';
const buildVersion = 'world90';
const SAVE_KEY='skyspark-save-v1',BACKUP_KEY='skyspark-before-restart-v1';
const $=id=>document.getElementById(id),canvas=$('world'),panel=$('panel'),sound=new Sound();
let storageOK=true,savePending=0,lastSave=0,last=performance.now(),panelMode='',toastUntil=0,celebrationUntil=0,notified=false,installPrompt=null,updatePending=false;
const keys={},reduced=matchMedia('(prefers-reduced-motion: reduce)');
function load(){try{return readSave(JSON.parse(localStorage.getItem(SAVE_KEY)));}catch{return freshSave();}}
let game=new SkyGame(load(),onEvent);
const renderer=new Renderer(canvas);renderer.reduced=reduced.matches;renderer.follow(game,0,true);
sound.enabled=game.save.sound;
function save(){
  clearTimeout(savePending);savePending=0;
  try{localStorage.setItem(SAVE_KEY,JSON.stringify(game.snapshot()));if(!storageOK){storageOK=true;updateSaveLabel();}}
  catch{storageOK=false;updateSaveLabel();}
}
function soonSave(){clearTimeout(savePending);savePending=setTimeout(save,70);}
function updateSaveLabel(){const s=$('saveStatus');s.textContent=storageOK?'● SAVED':'NOT SAVING';s.style.color=storageOK?'':'#ffd29c';s.setAttribute('aria-label',storageOK?'Progress saves on this device':'Saving is unavailable. Keep this page open to keep progress.');}
function toast(text,seconds=3){$('toast').textContent=text;$('toast').classList.add('show');toastUntil=game.time+seconds;}
function celebrate(top,title,text){$('celebrationTop').textContent=top;$('celebrationTitle').textContent=title;$('celebrationText').textContent=text;$('celebration').classList.add('show');celebrationUntil=game.time+4;}
function onEvent(e){
  sound.effect(e.type);
  if(e.type==='destroy'||e.type==='titan-hit')soonSave();
  if(e.type==='restore-ready'){toast(e.stage===0?'The robots are gone! Fly into the fountain’s glowing spark.':'Great flying! Touch the glowing rooftop beacon.',5);soonSave();}
  if(e.type==='milestone'){
    const messages=[null,['PLAZA RESTORED','You brought the sunshine!','A new adventure is waiting on your map.'],['BEACON ONLINE','Look at that glow!','Something enormous has landed at Skybridge.'],['CITY SAVED','Superhero spectacular!','The city is yours. Keep flying, or take on another army.']];
    celebrate(...messages[e.stage]);$('mapDot').hidden=false;soonSave();
  }
  if(e.type==='travel')toast(`Flying to ${e.name} — tap anywhere to steer.`,3);
  if(e.type==='ring')toast(`Sky ring ${e.count} / 8`,1.3);
  if(e.type==='rings-complete'){celebrate('SKY TRAIL COMPLETE','Beautiful flying!','Every ring collected. No rush. All yours.');soonSave();}
  if(e.type==='rings-start')toast('Follow the golden rings. Take your time!',4);
  if(e.type==='wave')toast(`Robot remix ${e.wave}! Your city stays restored.`,4);
  if(e.type==='wave-complete'){celebrate('ROBOT REMIX COMPLETE','What a hero!','Open the map for another round or a sky trail.');soonSave();}
}
function unlock(){sound.unlock();}
document.addEventListener('pointerdown',unlock,{passive:true});document.addEventListener('keydown',unlock,{passive:true});
function clearKeys(){for(const key of Object.keys(keys))delete keys[key];}
function openPanel(mode,title,eyebrow,html){
  clearKeys();game.paused=true;panelMode=mode;$('panelTitle').textContent=title;$('panelEyebrow').textContent=eyebrow;$('panelBody').innerHTML=html;
  if(!panel.open)panel.showModal();panel.scrollTop=0;save();sound.update(true);
}
function closePanel(){if(panel.open)panel.close();panelMode='';game.paused=document.hidden;last=performance.now();clearKeys();}
$('closePanel').addEventListener('click',closePanel);
panel.addEventListener('cancel',e=>{e.preventDefault();closePanel();});
panel.addEventListener('close',()=>{panelMode='';game.paused=document.hidden;last=performance.now();clearKeys();});
function mapHTML(){
  const s=game.save,active=Math.min(s.stage,2);
  return `<p class="map-note">Your little corner of the city. Pick a place and fly there.</p><canvas id="cityMap" class="map-drawing" width="760" height="320" aria-label="A picture of your discovered city landmarks. Choose a destination below."></canvas>${LANDMARKS.filter((_,i)=>i<=active).map((l,i)=>`<button class="place ${i===active&&s.stage<3?'current':''} ${i<s.stage?'completed':''}" data-travel="${l.id}"><span class="place-icon">${i<s.stage?'✓':['☀','✦','⚡'][i]}</span><span><strong>${l.name}</strong><small>${i<s.stage?'Restored · yours to explore':game.restoreReady?(i===0?'Touch the fountain’s glowing spark':'Touch the glowing beacon'):l.description}</small></span><em>↗</em></button>`).join('')}${s.stage===3?`<button class="panel-action" data-action="remix" ${game.replay?'disabled':''}>⚡ ${game.replay?'Robot remix in progress':'Bring on another robot army'}</button><button class="panel-action secondary" data-action="rings">✦ Fly the golden sky trail</button>`:''}<div class="install-note">${s.stage===3?'The city stays restored during remixes. Play as long as you like.':'More of the city appears as you help. There’s no timer, and you can always come back.'}</div>`;
}
function drawMap(){
  const el=$('cityMap');if(!el)return;
  const c=el.getContext('2d'),w=760,h=320,visible=Math.min(2,game.save.stage)+1;
  c.clearRect(0,0,w,h);
  const g=c.createLinearGradient(0,0,0,h);g.addColorStop(0,'#7ca5b4');g.addColorStop(.7,'#f5c59d');g.addColorStop(1,'#e8bb92');c.fillStyle=g;c.fillRect(0,0,w,h);
  c.fillStyle='#ffe8b4';c.beginPath();c.arc(635,65,29,0,Math.PI*2);c.fill();
  const positions=visible===1?[380]:visible===2?[230,530]:[140,380,620];
  c.strokeStyle='#ecd0a1';c.lineWidth=15;c.beginPath();c.moveTo(positions[0],250);c.lineTo(positions.at(-1),250);c.stroke();
  for(let j=0;j<visible;j++){
    const x=positions[j],done=j<game.save.stage;
    for(let k=0;k<3;k++){const bh=65+(k%2)*35;c.fillStyle=['#7b9299','#859b9e','#597c8d'][k];c.fillRect(x-70+k*47,230-bh,42,bh);c.fillStyle='#efcf9c';for(let row=0;row<3;row++)c.fillRect(x-58+k*47,235-bh+row*17,8,8);}
    c.beginPath();c.arc(x,249,20,0,Math.PI*2);c.fillStyle=done?'#c0fae0':'#ffe2a2';c.fill();c.fillStyle='#284f62';c.font='bold 21px system-ui';c.textAlign='center';c.fillText(done?'✓':'✦',x,256);
    c.font='700 18px system-ui';c.fillStyle='#24495b';c.fillText(LANDMARKS[j].short,x,295);
  }
  const nearest=LANDMARKS.slice(0,visible).reduce((a,b)=>Math.abs(a.x-game.player.x)<Math.abs(b.x-game.player.x)?a:b);
  hero(c,positions[LANDMARKS.indexOf(nearest)],120,55,game.time,{portrait:true});
  c.font='700 12px system-ui';c.fillStyle='#fff4d4';c.fillText('YOU',positions[LANDMARKS.indexOf(nearest)],66);
}
function showMap(){
  $('mapDot').hidden=true;openPanel('map','Your city','ADVENTURE MAP',mapHTML());drawMap();
}
function showPause(){
  openPanel('pause','A little breather','SKYSPARK',`<button class="panel-action" data-action="resume">▶ Keep flying</button><button class="panel-action secondary" data-action="map">⌖ Open the city map</button><div class="help"><p><strong>↗ Fly:</strong> tap the sky. Tap a rooftop to land.</p><p><strong>⚡ Smash:</strong> fly straight into a robot.</p><p><strong>Laser:</strong> slices toward the gold-ringed robot.</p><p><strong>Big Blast:</strong> clears the robots all around you.</p><p>Your shield keeps you safe. No fuel. No falling. No lost progress.</p><p>Keyboard: arrows / WASD · L laser · Space blast · M map · Esc pause.</p></div><div class="settings-row"><span>Music & sound</span><button data-action="sound">${sound.enabled?'On':'Off'}</button></div><div class="settings-row"><span>Gentle motion</span><button data-action="motion">${renderer.reduced?'On':'Off'}</button></div><button class="panel-action secondary" data-action="restart">Start the demo again</button>${hasBackup()?'<button class="panel-action secondary" data-action="restore">Restore previous adventure</button>':''}<div class="install-note">Install on iPhone: Safari → Share → Add to Home Screen. Your adventure saves on this device.${installPrompt?'<button class="panel-action secondary" data-action="install">Install SkySpark</button>':''}</div><p class="fineprint">${storageOK?'Progress saves automatically on this device.':'Saving is unavailable. Keep this page open to retain progress.'}<br>SkySpark · ${BUILD} · Original artwork & synthesized sound.</p>`);
}
function hasBackup(){try{return !!localStorage.getItem(BACKUP_KEY);}catch{return false;}}
function resetPresentation(){
  toastUntil=0;celebrationUntil=0;notified=false;pointer=null;downAt=null;
  $('toast').classList.remove('show');$('celebration').classList.remove('show');$('mapDot').hidden=true;
  $('hint').innerHTML='<span>↗</span> Tap the sky to fly · Tap a robot to smash';
  sound.enabled=game.save.sound;if(sound.master)sound.master.gain.value=sound.enabled?.22:0;updateSound();renderer.follow(game,0,true);
}
function restart(){
  try{
    const current=JSON.stringify(game.snapshot());localStorage.setItem(BACKUP_KEY,current);
    if(localStorage.getItem(BACKUP_KEY)!==current)throw Error('Backup failed');
    const next=freshSave();next.sound=sound.enabled;localStorage.setItem(SAVE_KEY,JSON.stringify(next));
    game=new SkyGame(next,onEvent);resetPresentation();closePanel();toast('A fresh adventure! Your previous one is backed up.',4);
  }catch{toast('Could not protect your save. Your current adventure is still here.',5);$('panelBody').insertAdjacentHTML('beforeend','<p class="restart-note">Your save could not be backed up. Nothing was restarted.</p>');}
}
function restore(){
  try{const raw=JSON.parse(localStorage.getItem(BACKUP_KEY));if(raw?.schema!==1)throw Error();const previous=readSave(raw);localStorage.setItem(SAVE_KEY,JSON.stringify(previous));game=new SkyGame(previous,onEvent);resetPresentation();closePanel();toast('Your previous adventure is back.',4);}catch{toast('That backup is unavailable. Your adventure has not changed.',5);}
}
$('panelBody').addEventListener('click',async e=>{
  const button=e.target.closest('button');if(!button||button.disabled)return;
  if(button.dataset.travel){const id=button.dataset.travel;closePanel();game.travel(id);return;}
  const action=button.dataset.action;
  if(action==='resume')closePanel();
  if(action==='map')showMap();
  if(action==='remix'){closePanel();game.startReplay();}
  if(action==='rings'){closePanel();game.ringFlight();}
  if(action==='restart')openPanel('restart','A fresh adventure?','KEEP YOUR PROGRESS SAFE','<p class="restart-note">Start again from Sunbeam Plaza. Your current adventure will be saved as a backup, which you can restore from Pause.</p><button class="panel-action" data-action="confirm-restart">Back up & start again</button><button class="panel-action secondary" data-action="pause">Keep this adventure</button>');
  if(action==='confirm-restart')restart();
  if(action==='restore')restore();
  if(action==='pause')showPause();
  if(action==='sound'){toggleSound();button.textContent=sound.enabled?'On':'Off';}
  if(action==='motion'){renderer.reduced=!renderer.reduced;button.textContent=renderer.reduced?'On':'Off';}
  if(action==='install'&&installPrompt){await installPrompt.prompt();installPrompt=null;button.remove();}
});
$('map').addEventListener('click',showMap);$('pause').addEventListener('click',showPause);
function toggleSound(){sound.toggle();game.save.sound=sound.enabled;updateSound();save();}
function updateSound(){$('sound').setAttribute('aria-pressed',String(sound.enabled));$('sound').setAttribute('aria-label',sound.enabled?'Turn sound off':'Turn sound on');}
$('sound').addEventListener('click',toggleSound);updateSound();
function bindPower(id,activate){
  const b=$(id);b.addEventListener('pointerdown',e=>{if(e.button!==0||b.disabled)return;e.preventDefault();unlock();activate();});
  b.addEventListener('click',e=>{if(e.detail===0&&!b.disabled)activate();});
}
bindPower('laser',()=>game.laser(renderer.bounds()));bindPower('blast',()=>game.blast());
$('go').addEventListener('click',()=>{
  if(game.restoreReady){game.moveTo(game.save.stage===0?480:1515,game.save.stage===0?690:340);return;}
  if(game.save.stage===3){showMap();return;}
  game.travel(LANDMARKS[Math.min(2,game.save.stage)].id);
});
$('stopTravel').addEventListener('click',()=>game.stop());
let pointer=null,downAt=null;
function point(e){const r=canvas.getBoundingClientRect();return renderer.screenToWorld(e.clientX-r.left,e.clientY-r.top);}
canvas.addEventListener('pointerdown',e=>{
  if(e.button!==0||game.paused||pointer!==null)return;
  e.preventDefault();pointer=e.pointerId;downAt={x:e.clientX,y:e.clientY};canvas.setPointerCapture(e.pointerId);
  const p=point(e);game.moveTo(p.x,p.y);
});
canvas.addEventListener('pointermove',e=>{if(e.pointerId!==pointer||game.paused||!downAt)return;if(Math.hypot(e.clientX-downAt.x,e.clientY-downAt.y)<7)return;const p=point(e);game.moveTo(p.x,p.y);});
for(const name of ['pointerup','pointercancel','lostpointercapture'])canvas.addEventListener(name,e=>{if(e.pointerId===pointer){pointer=null;downAt=null;}});
canvas.addEventListener('contextmenu',e=>e.preventDefault());
const keyNames={ArrowLeft:'left',a:'left',ArrowRight:'right',d:'right',ArrowUp:'up',w:'up',ArrowDown:'down',s:'down'};
document.addEventListener('keydown',e=>{
  const key=e.key.length===1?e.key.toLowerCase():e.key;
  if(key==='Escape'){if(panel.open)closePanel();else showPause();e.preventDefault();return;}
  if(panel.open)return;
  if(keyNames[key]){keys[keyNames[key]]=true;e.preventDefault();}
  if(e.repeat)return;
  if(key==='l'||key==='z'){game.laser(renderer.bounds());e.preventDefault();}
  if(key===' '){game.blast();e.preventDefault();}
  if(key==='m'){showMap();e.preventDefault();}
});
document.addEventListener('keyup',e=>{const key=e.key.length===1?e.key.toLowerCase():e.key;if(keyNames[key])delete keys[keyNames[key]];});
window.addEventListener('blur',clearKeys);window.addEventListener('pagehide',save);
document.addEventListener('visibilitychange',()=>{clearKeys();if(document.hidden){game.paused=true;save();sound.update(true);}else{last=performance.now();if(!panel.open)showPause();}});
new ResizeObserver(()=>{renderer.resize();renderer.follow(game,0,true);renderer.draw(game,0);}).observe($('playfield'));
reduced.addEventListener('change',e=>{renderer.reduced=e.matches;});
window.addEventListener('beforeinstallprompt',e=>{e.preventDefault();installPrompt=e;});
function hud(){
  const stage=game.save.stage,alive=game.enemies.filter(e=>e.hp>0),boss=alive.find(e=>e.type==='titan');
  $('robotCount').textContent=String(game.save.total);
  const titles=['Wake up the fountain','Light the rooftop beacon','Take on the giant robot','The city is yours!'];
  $('missionEyebrow').textContent=game.replay?`ROBOT REMIX ${game.wave}`:game.ringRun?'GOLDEN SKY TRAIL':stage===3?'SUPERHERO FREE PLAY':`ADVENTURE ${stage+1} OF 3`;
  $('missionText').textContent=game.replay?'Bring on the robot army!':game.ringRun?'Follow the golden rings':game.restoreReady?(stage===0?'Touch the fountain’s spark':'Touch the glowing beacon'):titles[stage];
  $('missionDetail').textContent=game.replay?`${alive.length} robots left · every power works`:game.ringRun?`${game.ringsTaken} / 8 rings · take your time`:stage===3?'Map → robot remixes & a golden sky trail':game.restoreReady?'Fly into the glowing star to bring it to life':`${alive.length} ${alive.length===1?'robot':'robots'} left · ${LANDMARKS[Math.min(2,stage)].name}`;
  $('go').setAttribute('aria-label',stage===3?'Choose your next adventure on the map':'Fly to your current adventure');
  $('laser').disabled=game.laserCd>0||game.paused;$('laserLabel').textContent=game.laserCd>0?'RECHARGING':'SLICE THROUGH';
  $('blast').disabled=game.blastCd>0||game.paused;$('blastLabel').textContent=game.blastCd>0?`READY IN ${Math.ceil(game.blastCd)}s`:'POWER READY';
  $('blastCharge').style.transform=`scaleX(${game.blastCd/5})`;$('blast').classList.toggle('ready',game.blastCd===0);
  $('combo').hidden=game.combo<3;$('combo').textContent=`${game.combo} × SUPER!`;
  $('bossHud').hidden=!boss||Math.abs(game.player.x-boss.x)>750;
  if(boss)$('bossSegments').innerHTML=Array.from({length:4},(_,i)=>`<i class="${i>=boss.hp?'lost':''}"></i>`).join('');
  $('flightStatus').hidden=!game.route;
  if(game.route)$('flightLabel').textContent=LANDMARKS.find(l=>l.id===game.route)?.name||'Flying';
  if(game.time>toastUntil)$('toast').classList.remove('show');
  if(game.time>celebrationUntil)$('celebration').classList.remove('show');
  $('hint').classList.toggle('dim',game.time>16);
  if(!storageOK)$('hint').textContent='Saving is unavailable. Keep this page open to keep progress.';
  else if(game.ringRun)$('hint').textContent='✦ Fly through the golden rings · There’s no timer';
  else if(stage===3)$('hint').textContent='Your city. Your superpowers. Pick another adventure on the map.';
  // DOM measurements support local regression checks without exporting saved-game contents.
  canvas.dataset.stage=String(stage);canvas.dataset.robots=String(alive.length);canvas.dataset.flying=String(!game.player.landed);
  canvas.dataset.playerX=String(Math.round(game.player.x));canvas.dataset.playerY=String(Math.round(game.player.y));canvas.dataset.paused=String(game.paused);
  if(stage===3&&!notified&&game.time>celebrationUntil+.5){notified=true;toast('Open your map: more robots and a sky trail are ready!',5);}
}
let hudAt=0;
function frame(now){
  const dt=Math.min(.04,(now-last)/1000);last=now;
  game.update(dt,keys,renderer.bounds());renderer.draw(game,dt);sound.update(game.paused);
  if(now-hudAt>70){hud();hudAt=now;}
  if(now-lastSave>2000){if(!game.paused)save();lastSave=now;}
  requestAnimationFrame(frame);
}
$('loading').hidden=true;hud();requestAnimationFrame(frame);
async function checkUpdate(){
  if(updatePending||document.hidden)return;
  try{
    const r=await fetch(`version.json?check=${Date.now()}`,{cache:'no-store'});if(!r.ok)return;
    const v=await r.json();if(typeof v.build!=='string'||v.build===buildVersion)return;
    updatePending=true;save();
    const scope=new URL('./',location.href).href;
    for(const reg of await navigator.serviceWorker.getRegistrations())if(reg.scope===scope)await reg.unregister();
    for(const name of await caches.keys())if(name.startsWith('skyspark-'))await caches.delete(name);
    location.replace(`index.html?fresh=${Date.now()}`);
  }catch{updatePending=false;}
}
if('serviceWorker'in navigator){
  (async()=>{
    // Upgrade an already installed host worker to its sibling-safe version.
    // This preserves Dino's own offline shell on devices that previously visited it.
    const parentScope=new URL('../',location.href).href;
    for(const reg of await navigator.serviceWorker.getRegistrations())if(reg.scope===parentScope)await reg.update().catch(()=>{});
    await navigator.serviceWorker.register(`sw.js?v=${BUILD}`,{updateViaCache:'none'});
  })().catch(()=>{});
  setTimeout(checkUpdate,2000);setInterval(checkUpdate,90000);
}
