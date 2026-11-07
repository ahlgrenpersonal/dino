import { BUILD, KEYS, ACTIVITIES, FLAGS, VIDEO_FILES, activityById, filterActivities, initialTurn, transition, cleanPreferences, cleanObservations, toggleObservation, readLocal, writeLocal, createTimeline, cleanClipCatalog } from './core.js?v=world4';
import { art, icon, garden } from './art.js?v=world4';
import { createSpeaker } from './audio.js?v=world4';
import { observeUpdates } from './updates.js?v=world4';

const $ = selector => document.querySelector(selector);
const buildVersion = 'world4';
const timeline = createTimeline();
const toastTimeline = createTimeline();
let storage;
try { storage = window.localStorage; } catch { storage = null; }
let preferences = readLocal(storage, KEYS.preferences, cleanPreferences);
let observations = readLocal(storage, KEYS.observations, cleanObservations);
let storageAvailable = Boolean(storage);
let state = initialTurn();
let filter = 'all';
let panel = 'guide';
let clips = [];
let clipIndex = 0;
let currentVideo = null;
let resumeActivity = false;
let beforeInstall = null;
let registration = null;
let pendingUpdate = false;
let toastUndo = null;
const flagLabels = { enjoyed: 'Wanted more', shared: 'Shared a moment', gesture: 'Gesture', sound: 'Sound', word: 'Word attempt' };
// Reuse the gesture-unlocked media element for delayed turns on mobile browsers.
const wordPlayer = $('#wordAudio');
const speaker = createSpeaker({ synth: window.speechSynthesis, Utterance: window.SpeechSynthesisUtterance, makeAudio: source => { wordPlayer.src = source; return wordPlayer; }, onUnavailable: () => { $('#audioHint').textContent = 'Audio is unavailable here. Say the sound together, or try a video sample.'; } });

function fillIcons(root = document) { root.querySelectorAll('[data-icon]').forEach(element => { element.innerHTML = icon(element.dataset.icon); }); }
function escapeHTML(value) { return String(value).replace(/[&<>"']/g, character => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[character])); }
function persist(key, value) { storageAvailable = writeLocal(storage, key, value); if (!storageAvailable) toast('Changes work for this visit, but this browser cannot save them.'); }
function toast(message, undo = null) {
  toastTimeline.cancel(); toastUndo = undo;
  // Modal dialogs make background content inert; keep Undo in the active top layer.
  (document.querySelector('dialog[open]') || document.body).append($('#toast'));
  $('#toast').replaceChildren(document.createTextNode(message));
  if (undo) { const button = document.createElement('button'); button.textContent = 'Undo'; button.id = 'undoButton'; $('#toast').append(button); }
  $('#toast').hidden = false;
  toastTimeline.after(undo ? 12000 : 5000, () => { $('#toast').hidden = true; toastUndo = null; });
}
$('#toast').addEventListener('click', event => { if (event.target.closest('#undoButton') && toastUndo) { toastUndo(); toastUndo = null; $('#toast').hidden = true; } });

function applyPreferences() {
  document.body.classList.toggle('gentle', preferences.gentle);
  $('#soundButton').setAttribute('aria-pressed', String(preferences.sound));
  $('#soundButton').setAttribute('aria-label', preferences.sound ? 'Turn sound off' : 'Turn sound on');
  $('#soundLabel').textContent = preferences.sound ? 'Sound on' : 'Sound off';
  $('#soundButton [data-icon]').innerHTML = icon(preferences.sound ? 'sound' : 'muted');
  if (currentVideo) currentVideo.muted = !preferences.sound;
  if (!preferences.sound) speaker.stop();
}
function renderCards() {
  const list = filterActivities(filter, observations);
  $('#activityGrid').innerHTML = list.length ? list.map(activity => `<button class="activity-card" data-activity="${activity.id}" aria-label="Play ${escapeHTML(activity.title)}"><span class="card-picture ${activity.color}"><span class="card-badge">${activity.label}</span>${observations[activity.id]?.enjoyed ? `<span class="favorite-badge">${icon('heart')}</span>` : ''}${art(activity.examples[0].art)}</span><span class="card-content"><h3>${activity.title}</h3><p>${activity.description}</p><span class="card-foot"><span>${activity.target}</span><span class="card-arrow">${icon('arrow')}</span></span></span></button>`).join('') : `<div class="empty-state">${icon('heart')}<h3>A little room for favorites</h3><p>Mark “Wanted more” in Little moments<br>to find those activities here.</p><button class="secondary-button" id="openNotebook">Open Little moments</button></div>`;
  $('#activityGrid .empty-state>svg')?.setAttribute('style', 'width:28px;height:28px;margin:0 auto 15px');
}
function stopTurn() {
  timeline.cancel(); speaker.stop();
  $('#activityStage').classList.remove('playing', 'ready', 'go');
  state = transition(state, { type: 'rest' });
  if (currentVideo) currentVideo.pause();
}
function example() { return activityById(state.id).examples[state.index]; }
function openActivity(id) {
  stopTurn(); state = initialTurn(id); renderActivity();
  if (!$('#activityDialog').open) $('#activityDialog').showModal();
}
function closeActivity() { stopTurn(); $('#activityDialog').close(); }
function renderActivity() {
  const activity = activityById(state.id);
  const focusedExample = $('#exampleTabs').contains(document.activeElement) ? document.activeElement.dataset.example : null;
  $('#activityTitle').textContent = activity.title;
  $('#activityLabel').textContent = activity.label;
  $('#exampleTabs').innerHTML = activity.examples.map((item, index) => `<button data-example="${index}" class="${index === state.index ? 'active' : ''}" aria-pressed="${index === state.index}">${item.label}</button>`).join('');
  $('#parentTip').textContent = activity.tip;
  $('#realPlay').textContent = activity.realPlay;
  $('#hearButton span:last-child').textContent = state.id === 'videos' ? 'Play video' : 'Hear it';
  $('#audioHint').textContent = preferences.sound ? 'Listen, copy, or simply enjoy it together.' : 'Sound is off. You can model the sound together.';
  renderStage();
  if (focusedExample !== null) $('#exampleTabs').querySelector(`[data-example="${state.index}"]`)?.focus({ preventScroll: true });
}
function renderStage() {
  const activity = activityById(state.id), item = example(), stage = $('#activityStage');
  const restoreFocus = stage.contains(document.activeElement);
  if (currentVideo && stage.contains(currentVideo)) { currentVideo.pause(); currentVideo = null; }
  stage.className = `activity-stage ${activity.color} ${state.revealed ? 'revealed' : ''} ${state.phase}`;
  if (state.id === 'videos') {
    stage.innerHTML = `<video id="activityVideo" class="activity-video" controls playsinline preload="none" aria-label="${escapeHTML(item.label)} video: ${escapeHTML(item.word)}"><source src="./assets/video/${VIDEO_FILES[item.video]}" type="video/mp4"></video><button class="stage-button video-start" id="startActivityVideo" aria-label="Watch ${escapeHTML(item.label)} video">${art(item.art)}<span class="tap-hint">Watch video</span></button>`;
    currentVideo = $('#activityVideo'); currentVideo.muted = !preferences.sound;
    const video = currentVideo;
    const reportError = () => {
      if (currentVideo !== video || !video.isConnected || !$('#activityDialog').open) return;
      $('#audioHint').textContent = 'This video is unavailable. Try another, or make the sound together.';
      $('#startActivityVideo').hidden = false;
    };
    video.addEventListener('error', reportError);
    video.querySelector('source').addEventListener('error', reportError);
    video.addEventListener('ended', () => {
      if (currentVideo === video && video.isConnected) $('#audioHint').textContent = 'Now a little pause. Try the sound together, or play it again.';
    });
  } else if (state.id === 'bubbles') {
    stage.innerHTML = `<div class="bubble-field">${[0, 1, 2].map(index => `<button class="bubble ${state.popped.includes(index) ? 'popped' : ''}" data-pop="${index}" aria-label="Pop bubble ${index + 1}" ${state.popped.includes(index) ? 'disabled' : ''}>${state.popped.includes(index) ? 'Pop!' : ''}</button>`).join('')}${state.popped.length === 3 ? `<div class="bubble-refill"><span>More bubbles?</span><button id="refillButton" class="secondary-button">More! ${icon('refresh')}</button></div>` : ''}</div>`;
  } else {
    const label = state.id === 'peekaboo' ? (state.revealed ? 'Hide bear again' : 'Find the bear') : state.id === 'car' && state.index === 0 ? 'Ready, set, go' : `Play ${item.word}`;
    stage.innerHTML = `<button class="stage-button" id="stageButton" aria-label="${escapeHTML(label)}">${art(item.art)}${state.id === 'peekaboo' ? `<span class="peek-cover"></span><span class="peek-label">${state.revealed ? 'Hide again' : 'Where’s bear?'}</span>` : `<span class="tap-hint">${state.id === 'car' && state.index === 0 ? 'Tap to go' : 'Tap to play'}</span>`}${state.id === 'car' && state.index === 0 ? `<span class="phase-banner" aria-live="polite">${state.phase === 'ready' ? 'Ready, set…' : state.phase === 'go' ? 'Go!' : ''}</span>` : ''}</button>`;
  }
  $('#activityWord').textContent = item.word;
  $('#activityPrompt').textContent = item.prompt;
  if (restoreFocus) (stage.querySelector('#stageButton, .bubble:not(:disabled), #refillButton'))?.focus({ preventScroll: true });
}
function say(text) {
  if (currentVideo) currentVideo.pause();
  const played = speaker.say(text, preferences.sound);
  if (!preferences.sound) $('#audioHint').textContent = 'Sound is off. You can model the sound together.';
  else if (played) $('#audioHint').textContent = 'A little pause. Leave space for a turn, in any form.';
}
function animate() {
  const stage = $('#activityStage');
  stage.classList.remove('playing');
  // Flush the previous animation without delaying audio past the user gesture.
  void stage.offsetWidth; stage.classList.add('playing');
  timeline.after(1300, () => stage.classList.remove('playing'));
}
function play() {
  const item = example();
  if (state.id === 'videos') { playActivityVideo(); return; }
  if (state.id === 'car' && state.index === 0) {
    if (state.phase !== 'idle') return;
    state = transition(state, { type: 'ready' }); renderStage(); say('Ready, set');
    timeline.after(2250, () => { state = transition(state, { type: 'go' }); renderStage(); say('Go!'); timeline.after(1900, () => { state = transition(state, { type: 'rest' }); renderStage(); }); });
    return;
  }
  if (state.id === 'peekaboo') {
    state = transition(state, { type: 'reveal' }); renderStage();
    if (state.revealed) say(item.speech);
    return;
  }
  state = transition(state, { type: 'play' }); say(item.speech); animate();
}

function playActivityVideo() {
  const video = currentVideo;
  if (!video || !$('#activityStage').contains(video)) return;
  speaker.stop();
  $('#startActivityVideo').hidden = true;
  video.play().catch(() => {
    if (currentVideo !== video || !video.isConnected || !$('#activityDialog').open) return;
    $('#startActivityVideo').hidden = false;
    $('#audioHint').textContent = 'This video could not start. Tap Watch video to try again.';
  });
}

$('#activityGrid').addEventListener('click', event => {
  const card = event.target.closest('[data-activity]');
  if (card) openActivity(card.dataset.activity);
  if (event.target.closest('#openNotebook')) openGrownups('notebook');
});
$('#filters').addEventListener('click', event => {
  const button = event.target.closest('[data-filter]'); if (!button) return;
  filter = button.dataset.filter;
  $('#filters').querySelectorAll('button').forEach(item => { item.classList.toggle('active', item === button); item.setAttribute('aria-pressed', String(item === button)); });
  renderCards();
});
$('#activityStage').addEventListener('click', event => {
  const bubble = event.target.closest('[data-pop]');
  if (event.target.closest('#startActivityVideo')) { playActivityVideo(); }
  else if (bubble) {
    const next = transition(state, { type: 'pop', index: Number(bubble.dataset.pop) });
    if (next !== state) { state = next; say('Pop'); renderStage(); }
  } else if (event.target.closest('#refillButton')) { state = transition(state, { type: 'reset' }); renderStage(); say('More'); }
  else if (event.target.closest('#stageButton')) play();
});
$('#exampleTabs').addEventListener('click', event => {
  const button = event.target.closest('[data-example]'); if (!button) return;
  stopTurn(); state = transition(state, { type: 'example', index: Number(button.dataset.example) }); renderActivity();
});
$('#hearButton').addEventListener('click', () => { if (state.id === 'videos') playActivityVideo(); else { say(example().speech); animate(); } });
$('#nextButton').addEventListener('click', () => { stopTurn(); state = transition(state, { type: 'next' }); renderActivity(); });
$('#activityClose').addEventListener('click', closeActivity);
$('#backButton').addEventListener('click', closeActivity);
$('#activityDialog').addEventListener('cancel', stopTurn);
$('#activityDialog').addEventListener('close', stopTurn);

function openGrownups(nextPanel = 'guide', fromActivity = false) {
  resumeActivity = fromActivity;
  if ($('#activityDialog').open) { stopTurn(); $('#activityDialog').close(); }
  panel = nextPanel; renderGrownups();
  if (!$('#grownupDialog').open) $('#grownupDialog').showModal();
}
function closeGrownups() { $('#grownupDialog').close(); }
$('#grownupDialog').addEventListener('close', () => {
  if (currentVideo && $('#grownupDialog').contains(currentVideo)) { currentVideo.pause(); currentVideo = null; }
  if (resumeActivity) { resumeActivity = false; renderActivity(); $('#activityDialog').showModal(); }
});
function notebookHTML() {
  return `<h3>Notice what they enjoy.</h3><p>These are your observations, not scores or a developmental assessment. Mark a moment whenever you like. “Wanted more” adds an activity to Favorites.</p>${!storageAvailable ? '<p class="storage-warning">Storage is unavailable. These observations may last only for this visit.</p>' : ''}${ACTIVITIES.map(activity => `<section class="notebook-row"><h4>${activity.title}<button class="text-button" data-notebook-play="${activity.id}">Play ${icon('arrow')}</button></h4><div class="flags">${FLAGS.map(flag => `<button class="flag ${observations[activity.id]?.[flag] ? 'selected' : ''}" data-note="${activity.id}" data-flag="${flag}" aria-pressed="${Boolean(observations[activity.id]?.[flag])}">${observations[activity.id]?.[flag] ? icon('check') : ''}${flagLabels[flag]}</button>`).join('')}</div></section>`).join('')}<p style="margin-top:20px">Stored only in this browser. No names, recordings, accounts, or automatic uploads. Browser data clearing can erase these observations.</p>`;
}
function renderGrownups() {
  if (currentVideo) { currentVideo.pause(); currentVideo = null; }
  $('#grownupDialog').querySelectorAll('[data-panel]').forEach(button => { button.classList.toggle('active', button.dataset.panel === panel); button.setAttribute('aria-pressed', String(button.dataset.panel === panel)); });
  const views = {
    guide: `<div class="guide-intro"><h3>The best part is being together.</h3><p>Pick something that catches their interest. Join in, offer a sound, then leave a little space. A look, a movement, a gesture, or a sound can be part of the play.</p></div><ol class="guide-steps"><li>Follow their lead.<small>Choose freely, repeat a favorite, or stop. There is nothing to finish.</small></li><li>Offer a little model.<small>Say “moo,” “pop,” or one familiar word naturally. You can also copy a sound they make.</small></li><li>Pause and respond.<small>Give them room for a turn. Keep playing whether or not they speak.</small></li><li>Take it into the room.<small>Each activity includes a small idea for playing together away from the screen.</small></li></ol><p>This is a shared-play demo, not a treatment or an assessment. Use it alongside advice from a speech-language professional. Keep screen play brief and follow your child’s comfort.</p><p class="guidance-source">Activity ideas draw on <a href="https://www.asha.org/public/developmental-milestones/communication-milestones-19-to-24-months/" target="_blank" rel="noopener noreferrer">ASHA’s parent communication guidance</a>. This custom app has not been clinically evaluated.</p>`,
    notebook: notebookHTML(),
    clips: `<h3>A few different ways to say hello.</h3><p>Compare an animal, a person, and a puppet. These optional generated clips are local experiments. Preview them yourself before sharing; check the sound and mouth movements.</p><button id="loadClips" class="primary-button clip-load">${icon('play')} Load local samples</button><div id="clipArea"><p>No video plays automatically. The illustrated activities work without these clips.</p></div>`,
    settings: `<h3>A little quieter. A little simpler.</h3><div class="settings-row"><label for="soundSetting">Speech & video sound<small>Includes short generated word recordings. A local device voice is a fallback. No microphone is used. Preview sounds yourself before sharing.</small></label><input id="soundSetting" type="checkbox" role="switch" ${preferences.sound ? 'checked' : ''}></div><div class="settings-row"><label for="gentleSetting">Gentle motion<small>Reduce illustration movement. Your system’s reduced-motion preference is also respected. Videos play only when you start them.</small></label><input id="gentleSetting" type="checkbox" role="switch" ${preferences.gentle ? 'checked' : ''}></div><div class="install-help"><strong>Keep the playroom close.</strong><p>On iPhone or iPad, open in Safari, choose Share, then Add to Home Screen. On supporting browsers, use Install app. The playroom, word recordings, and two short videos work offline after the first complete load. Other local video experiments are not stored offline.</p></div><p>All preferences and observations stay in this browser. Nothing is recorded or sent to an account. There are no ads or analytics.</p><div class="settings-buttons"><button id="clearNotes" class="secondary-button">Clear little moments</button><button id="installFromSettings" class="secondary-button">${icon('download')} Install app</button></div><p>Little Echo · demo ${BUILD}. Each activity can be repeated in any order.</p>`
  };
  $('#grownupContent').innerHTML = views[panel] || views.guide;
}
$('#grownupsButton').addEventListener('click', () => openGrownups());
$('#howButton').addEventListener('click', () => openGrownups());
$('#grownupClose').addEventListener('click', closeGrownups);
$('#noticeButton').addEventListener('click', () => { openGrownups('notebook', true); $('#grownupContent').querySelector(`[data-note="${state.id}"]`)?.focus(); });
$('#grownupDialog').addEventListener('click', event => {
  const panelButton = event.target.closest('[data-panel]');
  if (panelButton) { panel = panelButton.dataset.panel; renderGrownups(); return; }
  const note = event.target.closest('[data-note]');
  if (note) {
    observations = toggleObservation(observations, note.dataset.note, note.dataset.flag);
    persist(KEYS.observations, observations);
    const activityId = note.dataset.note, flag = note.dataset.flag;
    renderGrownups(); renderCards();
    $('#grownupContent').querySelector(`[data-note="${activityId}"][data-flag="${flag}"]`)?.focus();
    return;
  }
  const playButton = event.target.closest('[data-notebook-play]');
  if (playButton) { resumeActivity = false; closeGrownups(); openActivity(playButton.dataset.notebookPlay); return; }
  if (event.target.closest('#clearNotes')) {
    const previous = observations; observations = {}; persist(KEYS.observations, observations); renderCards();
    toast('Little moments cleared.', () => { observations = previous; persist(KEYS.observations, observations); renderCards(); if ($('#grownupDialog').open && panel === 'notebook') renderGrownups(); });
  }
  if (event.target.closest('#loadClips')) loadClips();
  const clip = event.target.closest('[data-clip]'); if (clip) renderClip(Number(clip.dataset.clip));
  if (event.target.closest('#installFromSettings')) install();
  if (event.target.closest('#playClip') && currentVideo) currentVideo.play().catch(() => { const message = $('#clipError'); if (message) message.hidden = false; });
  if (event.target.closest('#pauseClip') && currentVideo) currentVideo.pause();
});
$('#grownupDialog').addEventListener('change', event => {
  if (event.target.id === 'soundSetting') preferences.sound = event.target.checked;
  if (event.target.id === 'gentleSetting') preferences.gentle = event.target.checked;
  persist(KEYS.preferences, preferences); applyPreferences();
});
$('#soundButton').addEventListener('click', () => { preferences.sound = !preferences.sound; persist(KEYS.preferences, preferences); applyPreferences(); });

async function loadClips() {
  const area = $('#clipArea'); if (!area) return;
  if (currentVideo) { currentVideo.pause(); currentVideo = null; }
  area.textContent = 'Looking for local samples…';
  try {
    const response = await fetch('./local-media/catalog.json', { cache: 'no-store' });
    if (!response.ok) throw new Error('missing');
    clips = cleanClipCatalog(await response.json());
    if (!clips.length) throw new Error('empty');
    if (!$('#grownupDialog').open || panel !== 'clips') return;
    renderClip(0);
  } catch {
    if ($('#grownupDialog').open && panel === 'clips') area.innerHTML = '<p>Local experiments are not available here. The playroom has two short clips under Watch a little hello. Other generated trials stay private.</p>';
  }
}
function renderClip(index) {
  if (!Number.isInteger(index) || !clips[index]) return;
  if (currentVideo) currentVideo.pause();
  clipIndex = index;
  const clip = clips[clipIndex];
  $('#clipArea').innerHTML = `<div class="clip-list" role="group" aria-label="Choose a video sample">${clips.map((row, i) => `<button data-clip="${i}" aria-pressed="${i === index}" class="${i === index ? 'active' : ''}">${escapeHTML(row.title)}</button>`).join('')}</div><video class="clip-video" id="sampleVideo" controls playsinline preload="metadata" aria-label="${escapeHTML(clip.title)}: ${escapeHTML(clip.word)}"><source src="./local-media/${clip.src}" type="video/mp4"></video><div class="activity-actions"><button id="playClip" class="primary-button">${icon('play')} Play sample</button><button id="pauseClip" class="secondary-button">Pause sample</button></div><p class="clip-caption">Target sound: <strong>${escapeHTML(clip.word)}</strong>. Start when you’re ready. Pause, copy it together, and leave room for a turn.</p><p id="clipError" role="status" hidden>This local video could not play. Try another sample or an illustrated activity.</p>`;
  currentVideo = $('#sampleVideo'); currentVideo.muted = !preferences.sound;
  const errorMessage = $('#clipError');
  const reportError = () => { if (errorMessage.isConnected) errorMessage.hidden = false; };
  currentVideo.addEventListener('error', reportError);
  currentVideo.querySelector('source').addEventListener('error', reportError);
}

async function install() {
  if (beforeInstall) { const prompt = beforeInstall; beforeInstall = null; await prompt.prompt(); }
  else { openGrownups('settings'); toast('In Safari: Share → Add to Home Screen. Other browsers: use the install option in the address bar.'); }
}
window.addEventListener('beforeinstallprompt', event => { event.preventDefault(); beforeInstall = event; });
$('#installButton').addEventListener('click', install);
document.addEventListener('visibilitychange', () => { if (document.hidden) { stopTurn(); if ($('#activityDialog').open) renderStage(); } });
window.addEventListener('pagehide', stopTurn);
window.addEventListener('keydown', event => {
  // Dialog Escape is native; this also stops audio before the close event arrives.
  if (event.key === 'Escape') speaker.stop();
});

function connectionStatus() {
  $('#connectionStatus').textContent = !navigator.onLine ? 'Offline · let’s play' : navigator.serviceWorker?.controller ? 'Playroom ready offline' : 'Made for playing together';
}
window.addEventListener('online', () => { connectionStatus(); checkUpdate(); });
window.addEventListener('offline', connectionStatus);
async function checkUpdate() {
  try {
    const response = await fetch(`./version.json?check=${Date.now()}`, { cache: 'no-store' });
    if (!response.ok) return;
    const data = await response.json();
    if (typeof data.build === 'string' && data.build !== buildVersion) offerUpdate();
  } catch { /* Offline play does not require a version check. */ }
}
function offerUpdate() {
  if (pendingUpdate) return;
  pendingUpdate = true;
  const button = document.createElement('button'); button.className = 'text-button'; button.id = 'updateButton'; button.textContent = 'Update ready';
  button.addEventListener('click', async () => {
    stopTurn();
    try {
      await registration?.update();
      if (registration?.waiting) registration.waiting.postMessage({ type: 'ACTIVATE' });
      else if (registration?.installing) {
        const worker = registration.installing;
        worker.addEventListener('statechange', () => { if (worker.state === 'installed') registration.waiting?.postMessage({ type: 'ACTIVATE' }); });
      } else location.reload();
    } catch { toast('The update is unavailable. Try again when online.'); }
  });
  $('.site-footer').append(button);
}
if ('serviceWorker' in navigator) {
  let reloading = false;
  navigator.serviceWorker.addEventListener('controllerchange', () => { connectionStatus(); if (pendingUpdate && !reloading) { reloading = true; location.reload(); } });
  navigator.serviceWorker.register('./sw.js', { scope: './', updateViaCache: 'none' }).then(result => {
    registration = result;
    observeUpdates(result, { hasController: () => Boolean(navigator.serviceWorker.controller), onWaiting: offerUpdate });
    navigator.serviceWorker.ready.then(connectionStatus);
    checkUpdate();
  }).catch(() => { $('#connectionStatus').textContent = 'Offline setup unavailable'; });
}
fillIcons(); $('#heroArt').innerHTML = garden(); applyPreferences(); renderCards(); connectionStatus();
