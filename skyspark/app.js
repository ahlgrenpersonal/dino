import { BUILD, WEAPONS, armorSegments, SkyGame, LEVELS, SITE_COUNT, unlockedLevel, freshSave, readSave } from './engine.js?v=world94';
import { Renderer, hero } from './art.js?v=world94';
import { Sound } from './audio.js?v=world94';
import { loadProgress } from './saves.js?v=world94';
const buildVersion = 'world94';
const SAVE_KEY='skyspark-save-v1',BACKUP_KEY='skyspark-before-restart-v1';
const $=id=>document.getElementById(id),canvas=$('world'),panel=$('panel'),sound=new Sound();
let storageOK=true,savePending=0,lastSave=0,last=performance.now(),panelMode='',toastUntil=0,celebrationUntil=0,notified=false,installPrompt=null,updatePending=false;
const keys={},reduced=matchMedia('(prefers-reduced-motion: reduce)');
function load(){return loadProgress(()=>localStorage,SAVE_KEY);}
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
  sound.effect(e.type,e);
  if(['destroy','titan-hit','checkpoint'].includes(e.type))soonSave();
  if(e.type==='milestone')soonSave();
  if(e.type==='level-complete'){
    const next=LEVELS[e.level+1];celebrate('LEVEL COMPLETE',`${LEVELS[e.level].short} saved!`,next?`${next.name} is now on your map.`:'Three worlds saved. Fly any level again!');$('mapDot').hidden=false;soonSave();
  }
  if(e.type==='level-enter'){resetPresentation();toast(`${e.replay?'A fresh flight through':'Welcome to'} ${LEVELS[e.level].name}!`,4);save();}
  if(e.type==='ring')toast(`Sky ring ${e.count} / 12`,1.3);
  if(e.type==='rings-complete'){celebrate('SKY TRAIL COMPLETE','Beautiful flying!','Every ring collected. No rush. All yours.');soonSave();}
  if(e.type==='rings-start')toast('Follow the golden rings. Take your time!',4);
}
function unlock(){sound.unlock();}
for(const event of ['pointerdown','pointerup','touchend','click','keydown'])document.addEventListener(event,unlock,{passive:true});
function clearKeys(){for(const key of Object.keys(keys))delete keys[key];}
function openPanel(mode,title,eyebrow,html){
  clearKeys();game.paused=true;panelMode=mode;$('panelTitle').textContent=title;$('panelEyebrow').textContent=eyebrow;$('panelBody').innerHTML=html;
  if(!panel.open)panel.showModal();panel.scrollTop=0;save();sound.update(true);
}
function closePanel(){if(panel.open)panel.close();panelMode='';game.paused=document.hidden;last=performance.now();clearKeys();sound.update(game.paused);unlock();}
$('closePanel').addEventListener('click',closePanel);
panel.addEventListener('cancel',e=>{e.preventDefault();closePanel();});
panel.addEventListener('close',()=>{panelMode='';game.paused=document.hidden;last=performance.now();clearKeys();});
function mapHTML(){
  const unlocked=unlockedLevel(game.save),current=game.save.level;
  return `<p class="map-note">Fly freely through each world. The boss waits at the far right. Your unfinished flights stay saved.</p><canvas id="cityMap" class="map-drawing" width="760" height="320" aria-label="Your flight through ${game.level.name}. This is an overview, with no travel shortcuts."></canvas>${LEVELS.filter((_,i)=>i<=unlocked).map((l,i)=>{const run=game.save.runs[i],done=game.save.completed.includes(i);return `<button class="place biome-${l.biome} ${i===current?'current':''} ${done?'completed':''}" data-level="${i}"><span class="place-icon">${l.icon}</span><span><strong>${l.name}</strong><small>${run.complete?'Completed · tap to fly again':i===current?'Current flight · '+run.kills+' robots defeated':run.frontier>300?'Saved flight · '+run.kills+' robots defeated':'New adventure · '+l.boss}</small></span><em>${run.complete?'↻':'↗'}</em></button>`;}).join('')}<div class="install-note">Return to a finished level for a fresh adventure. An unfinished flight resumes where you left it.</div>`;
}
function drawMap(){
  const el=$('cityMap');if(!el)return;const c=el.getContext('2d'),biome=game.level.biome;
  const gradient=c.createLinearGradient(0,0,0,320);gradient.addColorStop(0,biome==='city'?'#7ca5b4':biome==='plains'?'#7fc7d4':'#686e9e');gradient.addColorStop(1,biome==='city'?'#edc09a':biome==='plains'?'#a9d891':'#c3bedb');c.fillStyle=gradient;c.fillRect(0,0,760,320);
  c.beginPath();c.arc(660,55,25,0,Math.PI*2);c.fillStyle='#ffebbc';c.fill();
  c.lineWidth=12;c.strokeStyle=biome==='mountains'?'#e4e1ee':'#dfd39e';c.beginPath();c.moveTo(60,233);c.lineTo(700,233);c.stroke();
  for(let i=0;i<Math.min(6,Math.floor(game.run.checkpoint/3)+1);i++){
    const x=75+i*120,done=game.run.restored.includes(i);
    if(biome==='city'){c.fillStyle='#5f8292';c.fillRect(x-26,135-(i%2)*25,50,85+(i%2)*25);c.fillStyle='#eacf98';for(let j=0;j<3;j++)c.fillRect(x-14,145+j*20-(i%2)*25,9,10);}
    else if(biome==='plains'){c.fillStyle='#659b72';c.beginPath();c.ellipse(x,211,55,25+(i%2)*15,0,Math.PI,Math.PI*2);c.fill();if(i%2){c.fillStyle='#75b8d2';c.fillRect(x-34,215,68,9);}}
    else{c.fillStyle='#667e9c';c.beginPath();c.moveTo(x-45,220);c.lineTo(x,115-(i%2)*20);c.lineTo(x+45,220);c.fill();c.fillStyle='#eeebef';c.beginPath();c.moveTo(x-13,146-(i%2)*20);c.lineTo(x,115-(i%2)*20);c.lineTo(x+14,147-(i%2)*20);c.fill();}
    c.beginPath();c.arc(x,233,17,0,Math.PI*2);c.fillStyle=done?'#b1f5d8':'#f3d99d';c.fill();c.fillStyle='#2c4e62';c.font='bold 16px system-ui';c.textAlign='center';c.fillText(done?'✓':String(i+1),x,239);
    c.font='700 11px system-ui';c.fillText(game.level.districts[i].split(' ')[0],x,276);
  }
  const px=60+game.player.x/9600*640;hero(c,px,95,51,game.time,{portrait:true});c.font='700 11px system-ui';c.fillStyle='#fff2d1';c.textAlign='center';c.fillText('YOU',px,39);
}
function showMap(){$('mapDot').hidden=true;openPanel('map','Your worlds','ADVENTURE MAP',mapHTML());drawMap();}
function showPause(){
  openPanel('pause','A little breather','SKYSPARK',`<button class="panel-action" data-action="resume">▶ Keep flying</button><button class="panel-action secondary" data-action="map">⌖ Open the adventure map</button><div class="help"><p><strong>↗ Fly:</strong> tap the sky. Tap a rooftop to land.</p><p><strong>⚡ Smash:</strong> fly straight into a robot.</p><p><strong>Sparks:</strong> lightning jumps through up to eight robots.</p><p><strong>Laser:</strong> sweeps through robots and cuts through armor.</p><p><strong>Big Blast:</strong> clears the robots all around you.</p><p>Your shield keeps you safe. No fuel. No falling. No lost progress.</p><p>Keyboard: arrows / WASD · X sparks · L laser · Space blast · M map · Esc pause.</p></div><div class="settings-row"><span>Music & sound</span><button data-action="sound">${sound.enabled?'On':'Off'}</button></div><div class="settings-row"><span>Gentle motion</span><button data-action="motion">${renderer.reduced?'On':'Off'}</button></div><button class="panel-action secondary" data-action="restart">Start this level again</button>${hasBackup()?'<button class="panel-action secondary" data-action="restore">Restore previous save</button>':''}<div class="install-note">Install on iPhone: Safari → Share → Add to Home Screen. Your adventure saves on this device.${installPrompt?'<button class="panel-action secondary" data-action="install">Install SkySpark</button>':''}</div><p class="fineprint">${storageOK?'Progress saves automatically on this device.':'Saving is unavailable. Keep this page open to retain progress.'}<br>SkySpark · ${BUILD} · Original artwork & synthesized sound.</p>`);
}
function hasBackup(){try{return !!localStorage.getItem(BACKUP_KEY);}catch{return false;}}
function resetPresentation(){
  toastUntil=0;celebrationUntil=0;notified=false;pointer=null;downAt=null;
  $('toast').classList.remove('show');$('celebration').classList.remove('show');$('mapDot').hidden=true;
  $('hint').innerHTML='<span>↗</span> Tap the sky to fly · Tap a robot to smash';
  if(sound.enabled!==game.save.sound)sound.setEnabled(game.save.sound);updateSound();renderer.follow(game,0,true);$('game').dataset.biome=game.level.biome;
}
function restart(){
  try{
    const current=JSON.stringify(game.snapshot());localStorage.setItem(BACKUP_KEY,current);
    if(localStorage.getItem(BACKUP_KEY)!==current)throw Error('Backup failed');
    game.restartLevel();save();resetPresentation();closePanel();toast('A fresh flight! Your previous save is backed up.',4);
  }catch{toast('Could not protect your save. Your current adventure is still here.',5);$('panelBody').insertAdjacentHTML('beforeend','<p class="restart-note">Your save could not be backed up. Nothing was restarted.</p>');}
}
function restore(){
  try{const raw=JSON.parse(localStorage.getItem(BACKUP_KEY));if(![1,2,3,4].includes(raw?.schema))throw Error();const previous=readSave(raw);localStorage.setItem(SAVE_KEY,JSON.stringify(previous));game=new SkyGame(previous,onEvent);resetPresentation();closePanel();toast('Your previous adventure is back.',4);}catch{toast('That backup is unavailable. Your adventure has not changed.',5);}
}
$('panelBody').addEventListener('click',async e=>{
  const button=e.target.closest('button');if(!button||button.disabled)return;
  if(button.dataset.level!==undefined){const level=Number(button.dataset.level);closePanel();if(game.selectLevel(level)){save();renderer.follow(game,0,true);}return;}
  const action=button.dataset.action;
  if(action==='resume')closePanel();
  if(action==='map')showMap();
  if(action==='restart')openPanel('restart','A fresh flight?','KEEP YOUR PROGRESS SAFE','<p class="restart-note">Start this level again. The other levels and your unlocks stay saved. Your current save is backed up before restarting.</p><button class="panel-action" data-action="confirm-restart">Back up & start again</button><button class="panel-action secondary" data-action="pause">Keep this adventure</button>');
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
bindPower('sparks',()=>game.sparks(renderer.bounds()));
bindPower('laser',()=>game.laser(renderer.bounds()));bindPower('blast',()=>game.blast());
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
  if(key==='x'){game.sparks(renderer.bounds());e.preventDefault();}
  if(key==='l'||key==='z'){game.laser(renderer.bounds());e.preventDefault();}
  if(key===' '){game.blast();e.preventDefault();}
  if(key==='m'){showMap();e.preventDefault();}
});
document.addEventListener('keyup',e=>{const key=e.key.length===1?e.key.toLowerCase():e.key;if(keyNames[key])delete keys[keyNames[key]];});
window.addEventListener('blur',clearKeys);window.addEventListener('pagehide',save);
document.addEventListener('visibilitychange',()=>{clearKeys();if(document.hidden){game.paused=true;save();sound.update(true);}else{sound.foreground();last=performance.now();if(!panel.open)showPause();}});
window.addEventListener('pageshow',e=>{sound.foreground();if(e.persisted&&!panel.open)showPause();});
new ResizeObserver(()=>{renderer.resize();renderer.follow(game,0,true);renderer.draw(game,0);}).observe($('playfield'));
reduced.addEventListener('change',e=>{renderer.reduced=e.matches;});
window.addEventListener('beforeinstallprompt',e=>{e.preventDefault();installPrompt=e;});
function hud(){
  const run=game.run,alive=game.enemies.filter(e=>e.hp>0),boss=alive.find(e=>e.boss),done=run.complete;
  $('robotCount').textContent=String(run.kills);
  $('sparks').disabled=game.sparkCd>0||game.paused;$('sparkLabel').textContent=game.sparkCd>0?'RECHARGING':'JUMP THROUGH 8';
  $('sparkCharge').style.transform=`scaleX(${game.sparkCd/WEAPONS.sparksCooldown})`;
  $('laserCharge').style.transform=`scaleX(${game.laserCd/WEAPONS.laserCooldown})`;
  $('laser').disabled=game.laserCd>0||game.paused;$('laserLabel').textContent=game.laserCd>0?'RECHARGING':'SWEEP & SLICE';
  $('blast').disabled=game.blastCd>0||game.paused;$('blastLabel').textContent=game.blastCd>0?`READY IN ${Math.ceil(game.blastCd)}s`:'POWER READY';
  $('blastCharge').style.transform=`scaleX(${game.blastCd/5})`;$('blast').classList.toggle('ready',game.blastCd===0);
  $('combo').hidden=game.combo<3;$('combo').textContent=`${game.combo} × SUPER!`;
  $('bossHud').hidden=!boss||Math.abs(game.player.x-boss.x)>750;$('playfield').classList.toggle('boss-active',!$('bossHud').hidden);
  if(boss){$('bossHud').querySelector('span').textContent=game.level.boss.toUpperCase();$('bossSegments').innerHTML=armorSegments(boss).map(fill=>`<i style="background:linear-gradient(to right,#ffd393 ${fill*100}%,#73868d ${fill*100}%)"></i>`).join('');$('bossSegments').setAttribute('aria-valuemax',String(boss.maxHp));$('bossSegments').setAttribute('aria-valuenow',String(boss.hp));}
  if(game.time>toastUntil)$('toast').classList.remove('show');if(game.time>celebrationUntil)$('celebration').classList.remove('show');
  $('hint').classList.toggle('dim',game.time>8&&!done&&storageOK);
  $('hint').textContent=!storageOK?'Saving is unavailable. Keep this page open to keep progress.':done?'Open the map to fly another level. Every return is a fresh adventure.':'Fly right · Tap a robot to smash';
  canvas.dataset.level=game.level.id;canvas.dataset.stage=String(run.checkpoint);canvas.dataset.robots=String(alive.length);canvas.dataset.flying=String(!game.player.landed);canvas.dataset.complete=String(done);
  canvas.dataset.kills=String(run.kills);canvas.dataset.boss=boss?.name||'';canvas.dataset.bossHp=String(boss?.hp||0);
  canvas.dataset.playerX=String(Math.round(game.player.x));canvas.dataset.playerY=String(Math.round(game.player.y));canvas.dataset.paused=String(game.paused);
  $('game').dataset.biome=game.level.biome;
  $('sound').dataset.state=sound.ctx?.state||'idle';$('sound').dataset.active=String(sound.active);$('sound').dataset.beat=String(sound.beat);
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
    const reloadKey=`skyspark-updating-${v.build}`;
    if(new URLSearchParams(location.search).get('updated')===v.build)return;
    try{if(sessionStorage.getItem(reloadKey))return;sessionStorage.setItem(reloadKey,'1');}catch{}
    updatePending=true;save();
    const scope=new URL('./',location.href).href;
    for(const reg of await navigator.serviceWorker.getRegistrations())if(reg.scope===scope)await reg.unregister();
    for(const name of await caches.keys())if(name.startsWith('skyspark-'))await caches.delete(name);
    location.replace(`index.html?fresh=${Date.now()}&updated=${encodeURIComponent(v.build)}`);
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
