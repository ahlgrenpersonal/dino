import {weaponRewardHTML} from './reward-view.js?v=world26';
import {BUILD,AREAS,HOME,weaponFor,readSave,visibleLandmarks,FINAL_AREA,dist,item,visibleChapters,nextChapter,equipmentClaimed} from './world.js?v=world26';
import {MiamiAdventure} from './engine.js?v=world26';
import {MiamiPainter} from './painter.js?v=world26';
import {paintPictures,areaPicture,enemyPicture,weaponPicture,robotPicture} from './ui-art.js?v=world26';
import {workshopHTML,drawWorkshop} from './workshop.js?v=world26';
import {adventureAudio} from './audio.js?v=world26';
import {bindPowerControl,updatePowerControl} from './power-control.js?v=world26';
import {atlasBot} from './bot-art.js?v=world26';
import {bindWorldNavigation} from './world-input.js?v=world26';
import {mountAtlas} from './atlas.js?v=world26';
const buildVersion='world26';
const SAVE_KEY='battlebot-miami-save-v1';
const $=id=>document.getElementById(id);
let stored;try{stored=JSON.parse(localStorage.getItem(SAVE_KEY));}catch{}
const game=new MiamiAdventure(readSave(stored)),painter=new MiamiPainter($('world'));
painter.camera={...game.player};
const panel=$('panel');let mode=null,workshopObserver,frameCount=0,last=performance.now(),saveAt=0,toastTimer,workTab='weapon',workshopDetails=true,atlasController,workshopRequested=false,storageWarned=false,weaponStamp='',bossStamp='',robotStamp='';
const keys=new Set();
document.body.dataset.details='false';
function persist(){try{localStorage.setItem(SAVE_KEY,JSON.stringify(game.snapshot()));}catch{if(!storageWarned){storageWarned=true;const el=document.createElement('div');el.className='storage-warning';el.innerHTML='<span aria-hidden="true">⚠</span><span class="adult-copy">Saving is unavailable. Keep this page open to keep your progress.</span>';el.setAttribute('aria-label','Saving is unavailable. Keep this page open to keep your progress.');$('game').append(el);}}}
const sound=adventureAudio(()=>game.save.sound);
const tone=(f=400,d=.09)=>sound.tone(f,d);
const esc=value=>String(value).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
function toast(text,icon='✓',art=null){const el=$('toast');el.setAttribute('aria-label',text);el.innerHTML=`<span class="toast-icon" aria-hidden="true">${icon}</span>${art?(typeof art==='string'?`<canvas width="150" height="100" data-weapon="${art}" aria-hidden="true"></canvas>`:`<canvas width="136" height="136" data-equipment="${art.id}" data-type="${art.type}" aria-hidden="true"></canvas>`):''}<span class="adult-copy">${esc(text)}</span>`;paintPictures(el,game.save);el.classList.add('show');clearTimeout(toastTimer);toastTimer=setTimeout(()=>el.classList.remove('show'),3000);}
function nextArea(){return nextChapter(game.save)||AREAS[FINAL_AREA];}
function close(){workshopObserver?.disconnect();workshopObserver=null;atlasController?.destroy();atlasController=null;if(mode==='workshop')workshopDetails=true;if(panel.open)panel.close();mode=null;game.paused=false;keys.clear();last=performance.now();persist();$('world').focus({preventScroll:true});}
function head(title,sub='',eyebrow='BATTLE BOT MIAMI'){return `<div class="panel-head"><div><div class="eyebrow adult-copy">${eyebrow}</div><h1 id="panelTitle" class="sr-only">${title}</h1>${sub?`<p class="adult-copy">${sub}</p>`:''}</div><button class="close" data-action="close" aria-label="Close">×</button></div>`;}

function open(name,html){workshopObserver?.disconnect();workshopObserver=null;atlasController?.destroy();atlasController=null;mode=name;panel.dataset.mode=name;game.paused=true;keys.clear();$('panelContent').innerHTML=html;if(!panel.open)panel.showModal();panel.scrollTop=0;paintPictures(panel,game.save);}
const mapIcon='<img class="map-icon" src="assets/map.svg" alt="" aria-hidden="true">';
function iconAction(action,icon,label,primary=false){return `<button class="${primary?'primary':'secondary'} picture-action" data-action="${action}" aria-label="${label}"><span aria-hidden="true">${icon}</span><b class="adult-copy">${label}</b></button>`;}
function pause(){open('pause',`${head('Take a breather','Your adventure is saved.')}<div class="panel-body"><div class="pause-actions">${iconAction('close','▶','Keep exploring',true)}${iconAction('build','⚙','Home workshop')}${iconAction('map',mapIcon,'Adventure map')}${game.save.king?iconAction('replay','↻ ♛','Respawn the world'):''}</div><label class="settings-row"><span aria-hidden="true">♥ 🛡</span><span class="adult-copy">Gentle battles</span><input id="gentle" aria-label="Gentle mode" type="checkbox" ${game.save.gentle?'checked':''}></label><label class="settings-row"><span id="pauseSoundIcon" aria-hidden="true">${game.save.sound?'🔊':'🔇'}</span><span class="adult-copy">Sound</span><input id="audio" aria-label="Sound" type="checkbox" ${game.save.sound?'checked':''}></label><p class="map-note adult-copy">Tap a monster for a powerful strike. Attacks also happen automatically. Power gives a six-second boost. Armor, wheels and gear work like the original adventure. Your game saves on this device.<br>Build ${buildVersion} · Round ${game.save.cycle}</p></div>`);$('gentle').onchange=e=>{game.save.gentle=e.target.checked;persist();};$('audio').onchange=e=>{game.save.sound=e.target.checked;$('pauseSoundIcon').textContent=game.save.sound?'🔊':'🔇';sound.syncMusic();persist();hud();};}
function placeCard(l){return `<button class="place picture-place" data-landmark="${l.id}" aria-label="Walk to ${esc(l.name)}"><canvas width="220" height="150" data-place="${l.id}" aria-hidden="true"></canvas><span class="place-mark" aria-hidden="true">${(l.equipment?equipmentClaimed(game.save,l):game.save.discoveries.includes(l.id))?'✓':l.equipment?'ϟ':'➜'}</span><b class="adult-copy">${esc(l.name)}</b></button>`;}
function showMap(){const visible=visibleChapters(game.save),next=nextArea();open('map',`${head('Miami adventure map','New areas appear one at a time.')}<div class="panel-body"><button class="region-row current-destination" data-action="trail" aria-label="Follow highlighted trail"><canvas width="88" height="72" data-area="${next.id}" aria-hidden="true"></canvas><div><b class="adult-copy">${next.name}</b><span aria-hidden="true">${game.save.king?'♛ ✓':'ϟ '.repeat(game.campsIn(next.id))}</span></div><em>➜</em></button><div class="atlas-stage"><div class="atlas-tools" role="group" aria-label="Map zoom"><output id="mapZoom" class="atlas-zoom" aria-label="Map zoom level">100%</output><button id="mapZoomOut" aria-label="Zoom out">−</button><button id="mapZoomIn" aria-label="Zoom in">+</button><button id="mapFit" aria-label="Show whole map">⛶</button><button id="mapGo" class="atlas-go" aria-label="Follow highlighted trail">➜</button></div><canvas id="atlas" class="map-canvas" aria-label="Unlocked Miami map. Pinch to zoom. Tap public land to walk there."></canvas></div><details class="other-destinations"><summary aria-label="Other destinations"><span aria-hidden="true">${mapIcon} ⌖</span><b class="adult-copy">Other destinations</b></summary><div class="region-list">${visible.map(a=>`<button class="region-row ${a.id===next.id?'active-region':''}" data-area="${a.id}" aria-label="Walk to ${a.name}"><canvas width="88" height="72" data-area="${a.id}" aria-hidden="true"></canvas><div><b class="adult-copy">${a.name}</b></div><em>${a.id===0?'⌂':game.save.cleared.includes(`boss-${a.id}`)?'✓':'➜'}</em></button>`).join('')}</div></details><details class="places-list"><summary aria-label="Parks and places"><span aria-hidden="true">♧ ⌖</span><b class="adult-copy">Parks and places</b></summary><div class="region-list">${visibleLandmarks(game.save).map(placeCard).join('')}</div></details></div>`);
 const source=document.createElement('canvas');painter.map(source,game,{showPlayer:false});const transform={...painter.mapTransform};
 atlasController=mountAtlas($('atlas'),{source,initialZoom:1,maxZoom:10,onOverlay:(c,zoom)=>{c.save();c.translate(transform.ox+game.player.x*transform.s,transform.oy+game.player.y*transform.s);c.scale(1/zoom,1/zoom);atlasBot(c,0,0,game.save,weaponFor(game.save.weapon).art);c.restore();},onChange:zoom=>{$('mapZoom').value=`${Math.round(zoom*100)}%`;$('mapZoomOut').disabled=zoom<=1;$('mapZoomIn').disabled=zoom>=10;},onSelect:p=>{const point=painter.mapDestination(p,game.save);if(point){close();workshopRequested=false;game.moveTo(point);}}});
 $('mapZoomIn').onclick=()=>atlasController.zoomBy(1.35);$('mapZoomOut').onclick=()=>atlasController.zoomBy(1/1.35);$('mapFit').onclick=()=>atlasController.reset();$('mapGo').onclick=trail;
}
function workshop(){if(!game.isHome()){close();workshopRequested=true;game.goHome();toast('Heading to the workshop.','⌂ ➜');return;}workshopRequested=false;game.route=[];game.target=null;game.powerTarget=null;game.repair();persist();open('workshop',workshopHTML(game.save,workTab,workshopDetails,head));panel.dataset.details=String(workshopDetails);panel.querySelector('.close').insertAdjacentHTML('beforebegin',`<button class="icon-button workshop-info" data-action="equipment-details" aria-label="Equipment details" aria-pressed="${workshopDetails}">ⓘ</button>`);drawWorkshop(panel,game.save,workTab);workshopObserver=new ResizeObserver(()=>drawWorkshop(panel,game.save,workTab));workshopObserver.observe($('botPreview'));}
function reward(id,area){workTab='weapon';open('reward',weaponRewardHTML(id,area,{head,iconAction,mapIcon}));}
function equipmentFind(e){
 workTab=e.kind;const found=item(e.kind,e.id);
 open('equipment',`${head(e.fresh?'Equipment found!':'Equipment ready!',found.name)}<div class="panel-body"><div class="equipment-reveal"><canvas width="88" height="72" data-category="${e.kind}" aria-hidden="true"></canvas><span aria-hidden="true">➜</span><canvas class="equipment-prize" width="272" height="272" data-equipment="${e.id}" data-type="${e.kind}" aria-label="${esc(found.name)}"></canvas><b aria-hidden="true">✓</b></div><p class="adult-copy">${esc(found.desc)} ${e.equipped?'Equipped and ready to use.':'Yours to choose in the workshop.'}</p><div class="pause-picture-grid">${iconAction('close','▶','Keep exploring',true)}${iconAction('build','⚙','See this equipment in the workshop')}</div></div>`);
}

game.onEvent=e=>{
 if(e.type==='toast')toast(e.text,'ⓘ');
 if(e.type==='attack')tone(weaponFor(game.save.weapon).id==='firejet'?180:560,.07);
 if(e.type==='power')tone(900,.2);
 if(e.type==='hurt')tone(130,.08);
 if(e.type==='defeat')tone(e.boss?350:230,.12);
 if(e.type==='camp'){persist();toast(`Battery found: ${e.count} of 3`,e.count===3?'ϟ ϟ ϟ':'ϟ');tone(950,.23);}
 if(e.type==='unlock'){persist();reward(e.reward,e.area);}
 if(e.type==='queen'){persist();reward('prism',FINAL_AREA);}
 if(e.type==='victory'){persist();reward('firejet',FINAL_AREA);}
 if(e.type==='findEquipment'){persist();tone(1100,.3);equipmentFind(e);}
 if(e.type==='rescue'){persist();toast('Recharged at home. Progress kept.','⌂ ♥');}
 if(e.type==='home'){persist();if(workshopRequested||e.arrival)workshop();}
 if(e.type==='charging'){persist();toast('Charging…','＋');}if(e.type==='charged'){persist();toast('Fully charged. Ready to roll!','✓');}
 if(e.type==='block')tone(760,.1);
 if(e.type==='pickup')tone(850,.04);
 if(e.type==='replay'){persist();toast(`Round ${game.save.cycle}`,'↻ ♛');}
};
function trail(){workshopRequested=false;close();game.goNext();}
$('panelContent').onclick=e=>{const b=e.target.closest('button');if(!b)return;const act=b.dataset.action;if(act){if(act==='close')close();if(act==='map')showMap();if(act==='home')workshop();if(act==='build')workshop();if(act==='trail')trail();if(act==='depart'){close();game.moveTo({x:HOME.x+2,y:HOME.y+3});}if(act==='equipment-details'){workshopDetails=!workshopDetails;panel.dataset.details=String(workshopDetails);b.setAttribute('aria-pressed',String(workshopDetails));}if(act==='replay'){close();if(game.replay())showMap();}return;}
 if(b.dataset.landmark){const l=visibleLandmarks(game.save).find(l=>l.id===b.dataset.landmark);if(l){close();game.moveTo(l);}}
 if(b.dataset.area!==undefined){const r=Number(b.dataset.area);close();game.goArea(r);}
 if(b.dataset.tab){workTab=b.dataset.tab;const top=panel.scrollTop;workshop();panel.scrollTop=top;}
 if(b.dataset.color){game.save.color=b.dataset.color;persist();workshop();}
 if(b.dataset.part){const id=b.dataset.part,top=panel.scrollTop;if(game.save.owned.includes(id))game.equip(workTab,id);else game.craft(workTab,id);persist();workshop();panel.scrollTop=top;}

};
panel.addEventListener('keydown',e=>{if(!e.target.matches('[role=tab]')||!['ArrowLeft','ArrowRight'].includes(e.key))return;e.preventDefault();const tabs=['weapon','armor','wheels','gadget'];workTab=tabs[(tabs.indexOf(workTab)+(e.key==='ArrowRight'?1:3))%4];workshop();panel.querySelector(`[data-tab=${workTab}]`).focus();});
panel.addEventListener('cancel',e=>{e.preventDefault();close();});
$('pause').onclick=pause;$('map').onclick=showMap;$('home').onclick=()=>{game.goHome();toast('Fully repaired.','⌂ ♥');};$('build').onclick=workshop;bindPowerControl($('power'),()=>game.power());
$('interact').onclick=()=>game.repair();
$('sound').onclick=()=>{game.save.sound=!game.save.sound;sound.syncMusic();tone(600,.15);persist();hud();};
bindWorldNavigation($('world'),{paused:()=>game.paused,point:e=>{const b=$('world').getBoundingClientRect();return painter.worldPoint(e.clientX-b.left,e.clientY-b.top);},tap:p=>{workshopRequested=false;game.tap(p,painter.scale);$('moveHint').hidden=true;return !game.target;},move:p=>{workshopRequested=false;game.moveTo(p);}});
window.addEventListener('keydown',e=>{if(!game.paused&&['ArrowUp','ArrowDown','ArrowLeft','ArrowRight',' '].includes(e.key))e.preventDefault();if(e.repeat)return;const k=e.key.toLowerCase();if(k==='escape'||k==='p'){panel.open?close():pause();return;}if(game.paused)return;if(k==='m'){showMap();return;}if(k===' ')game.power();keys.add(k);});
window.addEventListener('keyup',e=>keys.delete(e.key.toLowerCase()));window.addEventListener('blur',()=>{keys.clear();persist();if(!panel.open)pause();});
document.addEventListener('visibilitychange',()=>{if(document.hidden){keys.clear();persist();if(!panel.open)pause();sound.syncMusic();}});window.addEventListener('pagehide',persist);
new ResizeObserver(()=>painter.resize()).observe($('playfield'));window.visualViewport?.addEventListener('resize',()=>painter.resize());document.fonts?.ready.then(()=>painter.resize());
function hud(){$('interact').hidden=!game.stationNear()||game.player.hp>=game.maxHp()||!!game.charging;const s=game.save;$('scrapCount').textContent=s.scrap;$('healthText').textContent=`${Math.ceil(game.player.hp)} / ${game.maxHp()}`;$('healthFill').style.width=`${100*game.player.hp/game.maxHp()}%`;$('weaponLabel').textContent=weaponFor(s.weapon).name;updatePowerControl($('power'),$('powerLabel'),game);$('soundIcon').textContent=s.sound?'🔊':'🔇';$('sound').setAttribute('aria-pressed',String(s.sound));$('soundLabel').textContent=s.sound?'Sound on':'Sound off';$('sound').setAttribute('aria-label',s.sound?'Turn sound off':'Turn sound on');$('sound').classList.toggle('muted',!s.sound);
 if(weaponStamp!==s.weapon){weaponStamp=s.weapon;weaponPicture($('weaponBadge'),s.weapon);}const rb=`${s.color}-${s.build.armor}-${s.build.wheels}-${s.build.gadget}-${s.weapon}`;if(robotStamp!==rb){robotStamp=rb;robotPicture($('brandBot'),s);}
 const boss=game.enemies.find(e=>e.boss&&e.hp>0&&game.awake(e)&&dist(e,game.player)<9);$('bossHud').hidden=!boss;if(boss){$('bossName').textContent=boss.name;$('royalGuard').hidden=boss.area<6||boss.guardBroken;$('bossHealth').style.width=`${100*boss.hp/boss.maxHp}%`;if(bossStamp!==boss.id){bossStamp=boss.id;enemyPicture($('bossPortrait'),boss.area);}}
}
function frame(now){const dt=Math.min(.05,(now-last)/1000);last=now;game.update(dt,{x:Number(keys.has('arrowright')||keys.has('d'))-Number(keys.has('arrowleft')||keys.has('a')),y:Number(keys.has('arrowdown')||keys.has('s'))-Number(keys.has('arrowup')||keys.has('w'))});painter.draw(game,dt);hud();if(panel.open&&mode==='workshop'&&frameCount++%3===0)drawWorkshop(panel,game.save,workTab);if(now-saveAt>4000){persist();saveAt=now;}requestAnimationFrame(frame);}
requestAnimationFrame(frame);
if(!stored)setTimeout(()=>toast('Tap the picture and follow the trail.','☝ ➜'),600);
if(new URLSearchParams(location.search).has('display'))console.info({build:BUILD,viewport:[innerWidth,innerHeight]});
async function checkVersion(){try{const response=await fetch(`version.json?check=${Date.now()}`,{cache:'no-store'});if(!response.ok)return;const v=await response.json();if(!/^world\d+$/.test(v.build)||v.build===buildVersion||new URLSearchParams(location.search).get('update')===v.build)return;persist();const scope=new URL('./',location.href).href;for(const r of await navigator.serviceWorker?.getRegistrations()||[])if(r.scope===scope)await r.unregister();for(const k of await caches.keys())if(k.startsWith('battlebot-miami-'))await caches.delete(k);location.replace(`index.html?fresh=${Date.now()}&update=${v.build}`);}catch{}}
if('serviceWorker'in navigator)navigator.serviceWorker.register('sw.js',{updateViaCache:'none'}).catch(()=>{});checkVersion();setInterval(()=>{if(!game.paused)checkVersion();},90000);
