import { BUILD, WEAPONS, armorSegments, SkyGame, LEVELS, readSave } from './engine.js?v=world101';
import { Renderer, worldPicture } from './art.js?v=world101';
import { VictoryReturn, worldMenuHTML } from './world-menu.js?v=world101';
import { Sound } from './audio.js?v=world101';
import { loadProgress } from './saves.js?v=world101';
const buildVersion = 'world101';
const SAVE_KEY='skyspark-save-v1',BACKUP_KEY='skyspark-before-restart-v1';
const $=id=>document.getElementById(id),canvas=$('world'),panel=$('panel'),sound=new Sound();
let storageOK=true,savePending=0,lastSave=0,last=performance.now(),panelMode='',toastUntil=0,celebrationUntil=0,notified=false,installPrompt=null,updatePending=false;
const keys={},reduced=matchMedia('(prefers-reduced-motion: reduce)');
function load(){return loadProgress(()=>localStorage,SAVE_KEY);}
let game=new SkyGame(load(),onEvent);
const victoryReturn=new VictoryReturn();
let justFinished=game.run.complete?game.save.level:null;
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
    justFinished=e.level;victoryReturn.start(e.level);clearKeys();game.target=null;
    celebrate('SUPER VICTORY','Super!', 'Back to your worlds…');
    $('celebration').classList.add('victory');$('victoryCountdown').hidden=false;updateCountdown();
    // Save completion and unlocks before the automatic return.
    save();
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
  clearKeys();game.paused=true;panelMode=mode;panel.dataset.mode=mode;$('panelTitle').textContent=title;$('panelEyebrow').textContent=eyebrow;$('panelBody').innerHTML=html;
  if(!panel.open)panel.showModal();panel.scrollTop=0;save();sound.update(true);
}
function closePanel(){if(panel.open)panel.close();panelMode='';game.paused=document.hidden;last=performance.now();clearKeys();sound.update(game.paused);unlock();}
$('closePanel').addEventListener('click',closePanel);
panel.addEventListener('cancel',e=>{e.preventDefault();closePanel();});
panel.addEventListener('close',()=>{panelMode='';game.paused=document.hidden;last=performance.now();clearKeys();});
function showMap(){
  victoryReturn.cancel();$('celebration').classList.remove('show','victory');$('victoryCountdown').hidden=true;
  $('mapDot').hidden=true;openPanel('map','Choose a world','LET’S FLY',worldMenuHTML(game.save,justFinished));
  for(const picture of panel.querySelectorAll('[data-world]'))worldPicture(picture,Number(picture.dataset.world));
}
function updateCountdown(){
  const count=Math.ceil(victoryReturn.remaining);
  $('victoryCountdown').setAttribute('aria-label',`Returning to worlds in ${count} seconds`);
  for(const [i,dot] of [...$('victoryCountdown').children].entries())dot.classList.toggle('spent',i>=count);
}
function showPause(){
  openPanel('pause','A little breather','SKYSPARK',`<button class="panel-action" data-action="resume">▶ Keep flying</button><button class="panel-action secondary" data-action="map">⌖ Open the adventure map</button><div class="help"><p><strong>↗ Fly:</strong> tap the sky. Tap a rooftop to land.</p><p><strong>⚡ Smash:</strong> fly straight into a robot.</p><p><strong>Sparks:</strong> lightning jumps through up to sixteen robots.</p><p><strong>Laser:</strong> sweeps through robots and cuts through armor.</p><p><strong>Big Blast:</strong> clears the robots all around you.</p><p>Your shield keeps you safe. No fuel. No falling. No lost progress.</p><p>Keyboard: arrows / WASD · X sparks · L laser · Space blast · M map · Esc pause.</p></div><div class="settings-row"><span>Music & sound</span><button data-action="sound">${sound.enabled?'On':'Off'}</button></div><div class="settings-row"><span>Gentle motion</span><button data-action="motion">${renderer.reduced?'On':'Off'}</button></div><button class="panel-action secondary" data-action="restart">Start this level again</button>${hasBackup()?'<button class="panel-action secondary" data-action="restore">Restore previous save</button>':''}<div class="install-note">Install on iPhone: Safari → Share → Add to Home Screen. Your adventure saves on this device.${installPrompt?'<button class="panel-action secondary" data-action="install">Install SkySpark</button>':''}</div><p class="fineprint">${storageOK?'Progress saves automatically on this device.':'Saving is unavailable. Keep this page open to retain progress.'}<br>SkySpark · ${BUILD} · Original artwork & synthesized sound.</p>`);
}
function hasBackup(){try{return !!localStorage.getItem(BACKUP_KEY);}catch{return false;}}
function resetPresentation(){
  justFinished=game.run.complete?game.save.level:null;
  victoryReturn.cancel();$('celebration').classList.remove('victory');$('victoryCountdown').hidden=true;
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
  if(e.button!==0||game.paused||victoryReturn.active||pointer!==null)return;
  e.preventDefault();pointer=e.pointerId;downAt={x:e.clientX,y:e.clientY};canvas.setPointerCapture(e.pointerId);
  const p=point(e);game.moveTo(p.x,p.y);
});
canvas.addEventListener('pointermove',e=>{if(e.pointerId!==pointer||game.paused||victoryReturn.active||!downAt)return;if(Math.hypot(e.clientX-downAt.x,e.clientY-downAt.y)<7)return;const p=point(e);game.moveTo(p.x,p.y);});
for(const name of ['pointerup','pointercancel','lostpointercapture'])canvas.addEventListener(name,e=>{if(e.pointerId===pointer){pointer=null;downAt=null;}});
canvas.addEventListener('contextmenu',e=>e.preventDefault());
const keyNames={ArrowLeft:'left',a:'left',ArrowRight:'right',d:'right',ArrowUp:'up',w:'up',ArrowDown:'down',s:'down'};
document.addEventListener('keydown',e=>{
  const key=e.key.length===1?e.key.toLowerCase():e.key;
  if(key==='Escape'){if(panel.open)closePanel();else showPause();e.preventDefault();return;}
  if(panel.open)return;
  if(victoryReturn.active){if(key==='m')showMap();e.preventDefault();return;}
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
  $('sparks').disabled=game.sparkCd>0||game.paused||victoryReturn.active;$('sparkLabel').textContent=game.sparkCd>0?'RECHARGING':'JUMP THROUGH 16';
  $('sparkCharge').style.transform=`scaleX(${game.sparkCd/WEAPONS.sparksCooldown})`;
  $('laserCharge').style.transform=`scaleX(${game.laserCd/WEAPONS.laserCooldown})`;
  $('laser').disabled=game.laserCd>0||game.paused||victoryReturn.active;$('laserLabel').textContent=game.laserCd>0?'RECHARGING':'SWEEP & SLICE';
  $('blast').disabled=game.blastCd>0||game.paused||victoryReturn.active;$('blastLabel').textContent=game.blastCd>0?`READY IN ${game.blastCd.toFixed(1)}s`:'POWER READY';
  $('blastCharge').style.transform=`scaleX(${game.blastCd/WEAPONS.blastCooldown})`;$('blast').classList.toggle('ready',game.blastCd===0);
  $('combo').hidden=game.combo<3;$('combo').textContent=`${game.combo} × SUPER!`;
  $('bossHud').hidden=!boss||Math.abs(game.player.x-boss.x)>750;$('playfield').classList.toggle('boss-active',!$('bossHud').hidden);
  if(boss){$('bossHud').querySelector('span').textContent=game.level.boss.toUpperCase();$('bossSegments').innerHTML=armorSegments(boss).map(fill=>`<i style="background:linear-gradient(to right,#ffd393 ${fill*100}%,#73868d ${fill*100}%)"></i>`).join('');$('bossSegments').setAttribute('aria-valuemax',String(boss.maxHp));$('bossSegments').setAttribute('aria-valuenow',String(boss.hp));}
  if(game.time>toastUntil)$('toast').classList.remove('show');if(game.time>celebrationUntil)$('celebration').classList.remove('show');
  $('hint').classList.toggle('dim',game.time>8&&!done&&storageOK);
  $('hint').textContent=!storageOK?'Saving is unavailable. Keep this page open to keep progress.':done?'★':'Fly right · Tap a robot to smash';
  canvas.dataset.level=game.level.id;canvas.dataset.stage=String(run.checkpoint);canvas.dataset.robots=String(alive.length);canvas.dataset.flying=String(!game.player.landed);canvas.dataset.complete=String(done);
  canvas.dataset.projectiles=String(game.projectiles.length);canvas.dataset.shieldHits=String(game.shieldHits);canvas.dataset.shotsCleared=String(game.shotsCleared);
  canvas.dataset.kills=String(run.kills);canvas.dataset.boss=boss?.name||'';canvas.dataset.bossHp=String(boss?.hp||0);
  canvas.dataset.playerX=String(Math.round(game.player.x));canvas.dataset.playerY=String(Math.round(game.player.y));canvas.dataset.paused=String(game.paused);
  $('game').dataset.biome=game.level.biome;
  $('sound').dataset.state=sound.ctx?.state||'idle';$('sound').dataset.active=String(sound.active);$('sound').dataset.beat=String(sound.beat);
}
let hudAt=0;
function frame(now){
  const elapsed=Math.max(0,(now-last)/1000),dt=Math.min(.04,elapsed);last=now;
  if(victoryReturn.tick(elapsed,game.paused||document.hidden))showMap();
  if(victoryReturn.active)updateCountdown();
  game.update(dt,keys,renderer.bounds());renderer.draw(game,dt);sound.update(game.paused);
  if(now-hudAt>70){hud();hudAt=now;}
  if(now-lastSave>2000){if(!game.paused)save();lastSave=now;}
  requestAnimationFrame(frame);
}
$('loading').hidden=true;if(game.run.complete)showMap();hud();requestAnimationFrame(frame);
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
