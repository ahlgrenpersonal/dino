import test from 'node:test';
import assert from 'node:assert/strict';
import { ACTIVITIES, FLAGS, KEYS, VIDEO_FILES, VIDEO_POSTERS, initialTurn, primaryAction, bubbleMessage, transition, filterActivities, cleanPreferences, cleanObservations, toggleObservation, readLocal, writeLocal, createTimeline, cleanClipCatalog } from '../core.js';
import { selectLocalVoice, createSpeaker, soundFile } from '../audio.js';

test('the sampler covers sounds, single words, and different play interactions', () => {
  assert.equal(ACTIVITIES.length, 10);
  assert.equal(new Set(ACTIVITIES.map(a => a.id)).size, 10);
  assert.deepEqual([...new Set(ACTIVITIES.map(a => a.category))].sort(), ['play', 'sounds', 'words']);
  for (const activity of ACTIVITIES) {
    assert.ok(activity.examples.length >= 1);
    assert.ok(activity.tip && activity.realPlay);
    assert.ok(activity.examples.every(item => item.art && item.word && item.speech));
  }
});

test('every activity permits repeated turns and next examples with no speech or score input', () => {
  for (const activity of ACTIVITIES) {
    let state = initialTurn(activity.id);
    for (let i = 0; i < activity.examples.length; i++) {
      const next = transition(state, { type: 'play' });
      assert.equal(next.turns, state.turns + 1);
      state = transition(next, { type: 'next' });
    }
    assert.equal(state.index, 0);
    assert.equal(state.turns, 0);
  }
});

test('bubbles count each target once, accept only known targets, and reset indefinitely', () => {
  let state = initialTurn('bubbles');
  for (const index of [0, 1, 2]) state = transition(state, { type: 'pop', index });
  assert.equal(state.turns, 3);
  assert.deepEqual(state.popped, [0, 1, 2]);
  assert.strictEqual(transition(state, { type: 'pop', index: 1 }), state);
  assert.strictEqual(transition(state, { type: 'pop', index: 4 }), state);
  assert.deepEqual(transition(state, { type: 'reset' }), initialTurn('bubbles'));
});

test('car does not overlap turns and resumes from a cancelled anticipation', () => {
  let state = initialTurn('car');
  assert.strictEqual(transition(state, { type: 'go' }), state);
  state = transition(state, { type: 'ready' });
  assert.strictEqual(transition(state, { type: 'ready' }), state);
  state = transition(state, { type: 'go' });
  assert.equal(state.phase, 'go');
  assert.equal(state.turns, 1);
  assert.strictEqual(transition(state, { type: 'go' }), state);
  state = transition(state, { type: 'rest' });
  assert.equal(transition(state, { type: 'ready' }).phase, 'ready');
});

test('peekaboo can hide and reveal freely; changing examples resets transient state', () => {
  let state = transition(initialTurn('peekaboo'), { type: 'reveal' });
  assert.equal(state.revealed, true);
  state = transition(state, { type: 'reveal' });
  assert.equal(state.revealed, false);
  assert.equal(state.turns, 2);
  assert.deepEqual(transition(state, { type: 'example', index: 1 }), initialTurn('peekaboo', 1));
});

test('invalid activity and example selectors fall back safely', () => {
  assert.equal(initialTurn('unknown', -1).id, 'animals');
  for (const index of [-1, 100, NaN, 0.5, '1']) assert.equal(initialTurn('words', index).index, 0);
});

test('the primary peekaboo button opens and closes the game instead of replaying only speech', () => {
  const hidden = initialTurn('peekaboo');
  assert.deepEqual(primaryAction(hidden), {label:'Peekaboo!',interaction:'play'});
  const revealed = transition(hidden,{type:'reveal'});
  assert.deepEqual(primaryAction(revealed), {label:'Hide bear',interaction:'play'});
  assert.deepEqual(primaryAction(transition(revealed,{type:'reveal'})), primaryAction(hidden));
  assert.deepEqual(primaryAction(initialTurn('videos')), {label:'Play video',interaction:'play'});
  assert.deepEqual(primaryAction(initialTurn('car')), {label:'Let’s go!',interaction:'play'});
  assert.deepEqual(primaryAction(initialTurn('car',1)), {label:'Hear it',interaction:'sound'});
  for (const id of ['animals','people','actions','copy']) {
    assert.deepEqual(primaryAction(initialTurn(id)), {label:'Hear it',interaction:'sound'});
  }
});

test('favorites reflect only the explicit parent observation, and can be removed', () => {
  assert.deepEqual(filterActivities('favorites', {}), []);
  let notes = toggleObservation({}, 'bubbles', 'enjoyed');
  assert.deepEqual(filterActivities('favorites', notes).map(a => a.id), ['bubbles']);
  notes = toggleObservation(notes, 'bubbles', 'enjoyed');
  assert.deepEqual(notes, {});
  assert.equal(filterActivities('sounds').length, 2);
  assert.equal(filterActivities('words').length, 3);
  assert.equal(filterActivities('play').length, 5);
});

test('word cards cover everyday, people, and action words, with bundled examples', () => {
  const cards = filterActivities('words');
  assert.deepEqual(cards.map(card => card.id), ['words', 'people', 'actions']);
  assert.deepEqual(cards.find(card => card.id === 'actions').examples.slice(0,2).map(item => item.label), ['Up','Down']);
  assert.equal(new Set(cards.flatMap(card => card.examples.map(item => item.speech))).size, 8);
  for (const card of cards) assert.ok(card.examples.every(item => soundFile(item.speech)));
  assert.deepEqual(cleanObservations({words:{enjoyed:true},people:{sound:true},actions:{word:true}}), {words:{enjoyed:true},people:{sound:true},actions:{word:true}});
});

test('video sampler uses exactly the two bundled clips and switches without a speech requirement', () => {
  const videos = ACTIVITIES.find(card => card.id === 'videos');
  assert.deepEqual(videos.examples.map(item => VIDEO_FILES[item.video]), ['duck-quack.mp4', 'puppet-ma.mp4']);
  const first = initialTurn('videos');
  assert.equal(transition(first, {type:'next'}).index, 1);
  assert.deepEqual(transition(transition(first, {type:'next'}), {type:'next'}), first);
  assert.ok(Object.values(VIDEO_FILES).every(file => /^[a-z-]+\.mp4$/.test(file)));
});

test('storage schemas reject arbitrary text, unknown activities, flags, and truthy non-booleans', () => {
  assert.deepEqual(cleanObservations({ unknown: { enjoyed: true }, animals: { enjoyed: true, name: 'private-marker', sound: 'yes', word: false }, copy: { gesture: true } }), { animals: { enjoyed: true }, copy: { gesture: true } });
  assert.deepEqual(cleanObservations(null), {});
  assert.deepEqual(cleanObservations('unexpected'), {});
  assert.deepEqual(toggleObservation({}, 'unknown', 'enjoyed'), {});
  assert.deepEqual(toggleObservation({}, 'animals', 'unknown'), {});
  assert.deepEqual(cleanPreferences({ sound: false, gentle: true, extra: 'private-marker' }), { sound: false, gentle: true });
  assert.deepEqual(cleanPreferences(null), { sound: true, gentle: false });
  assert.ok(Object.values(KEYS).every(key => key.startsWith('speech-play.')));
  assert.equal(FLAGS.length, 5);
});

test('storage failure and malformed JSON do not prevent play', () => {
  assert.deepEqual(readLocal(null, KEYS.observations, cleanObservations), {});
  assert.deepEqual(readLocal({ getItem: () => '{bad' }, KEYS.preferences, cleanPreferences), { sound: true, gentle: false });
  assert.equal(writeLocal({ setItem() { throw new Error('quota'); } }, KEYS.observations, {}), false);
  const memory = new Map();
  const storage = { getItem: key => memory.get(key), setItem: (key, value) => memory.set(key, value) };
  assert.equal(writeLocal(storage, KEYS.observations, { animals: { sound: true } }), true);
  assert.deepEqual(readLocal(storage, KEYS.observations, cleanObservations), { animals: { sound: true } });
});

test('a cancelled timeline cannot run stale turn callbacks even if already queued', () => {
  const queue = new Map(); let id = 0, calls = 0;
  const timeline = createTimeline({ set: callback => { queue.set(++id, callback); return id; }, clear: () => {} });
  timeline.after(1600, () => { calls++; });
  timeline.cancel();
  queue.get(1)();
  assert.equal(calls, 0);
  timeline.after(500, () => { calls++; }); queue.get(2)();
  assert.equal(calls, 1);
});

test('timeline clears all owned timers and leaves a fresh usable turn', () => {
  const cleared = []; let id = 0;
  const timeline = createTimeline({ set: () => ++id, clear: handle => cleared.push(handle) });
  timeline.after(1, () => {}); timeline.after(2, () => {}); timeline.cancel();
  assert.deepEqual(cleared, [1, 2]);
  timeline.cancel(); assert.equal(cleared.length, 2);
});

test('speech never picks network-backed voices or a different language as a fallback', () => {
  assert.equal(selectLocalVoice([{ name: 'Remote English', lang: 'en-US', localService: false }]), undefined);
  assert.equal(selectLocalVoice([{ name: 'Local other', lang: 'fr-FR', localService: true }]), undefined);
  const local = { name: 'Local English', lang: 'en-GB', localService: true };
  assert.strictEqual(selectLocalVoice([{ name: 'Remote', lang: 'en-US', localService: false }, local]), local);
  const unnamed = { localService: true, lang: 'en-US', get name() { throw new Error('Voice labels must not be inspected'); } };
  assert.strictEqual(selectLocalVoice([unnamed]), unnamed);
});

test('speech cancels overlapping audio, respects mute, and reports unavailable local speech', () => {
  let cancelled = 0, spoken = [], unavailable = [];
  const voice = { name: 'Local English', localService: true, lang: 'en-US' };
  const synth = { cancel() { cancelled++; }, getVoices() { return [voice]; }, speak(value) { spoken.push(value); } };
  const speaker = createSpeaker({ synth, Utterance: class { constructor(text) { this.text = text; } }, onUnavailable: value => unavailable.push(value) });
  assert.equal(speaker.say('pop', false), false);
  assert.equal(spoken.length, 0);
  assert.equal(speaker.say('moo'), true);
  assert.equal(spoken[0].text, 'moo'); assert.strictEqual(spoken[0].voice, voice);
  spoken[0].onerror({ error: 'canceled' });
  spoken[0].onerror({ error: 'interrupted' });
  assert.deepEqual(unavailable, []);
  spoken[0].onerror({ error: 'voice-unavailable' });
  assert.deepEqual(unavailable, ['moo']);
  speaker.stop(); assert.equal(cancelled, 3);
  spoken[0].onerror({ error: 'voice-unavailable' });
  assert.deepEqual(unavailable, ['moo']);
  const missing = createSpeaker({ onUnavailable: value => unavailable.push(value) });
  assert.equal(missing.say('baa'), false); assert.deepEqual(unavailable, ['moo', 'baa']);
});

test('illustrated examples and delayed car cues have bundled audio; videos have their own sound', () => {
  for (const activity of ACTIVITIES) for (const item of activity.examples) assert.ok(item.video ? VIDEO_FILES[item.video] : soundFile(item.speech), item.speech);
  assert.equal(soundFile('Ready, set'), 'ready-set');
  assert.equal(soundFile('Ma. Ma.'), 'ma');
  assert.equal(soundFile('unknown phrase'), undefined);
});

test('bundled audio plays before device speech, with mute and immediate cancellation', async () => {
  const players = []; let deviceSpeech = 0;
  const speaker = createSpeaker({ synth: { cancel() {}, getVoices() { deviceSpeech++; return []; } }, makeAudio: source => {
    const player = { src: source, currentTime: 4, paused: false, play() { return Promise.resolve(); }, pause() { this.paused = true; } };
    players.push(player); return player;
  } });
  assert.equal(speaker.say('Pop', false), false); assert.equal(players.length, 0);
  assert.equal(speaker.say('Pop'), true); assert.ok(players[0].src.endsWith('/assets/audio/pop.wav'));
  speaker.say('Moo'); assert.equal(players[0].paused, true); assert.equal(players[0].currentTime, 0);
  speaker.stop(); assert.equal(players[1].paused, true);
  await Promise.resolve(); assert.equal(deviceSpeech, 0);
});

test('late audio failures after close cannot restart speech', async () => {
  let rejectPlay, unavailable = 0;
  const speaker = createSpeaker({ makeAudio: () => ({ currentTime: 0, pause() {}, play() { return new Promise((resolve, reject) => { rejectPlay = reject; }); } }), onUnavailable: () => { unavailable++; } });
  speaker.say('Moo'); speaker.stop(); rejectPlay(new Error('interrupted'));
  await Promise.resolve(); await Promise.resolve();
  assert.equal(unavailable, 0);
});

test('reusing one gesture-unlocked player cannot revive a cancelled turn', async () => {
  let rejectedFirst, plays = 0, unavailable = 0;
  const player = { currentTime: 0, paused: false, pause() { this.paused = true; }, play() { this.paused = false; return ++plays === 1 ? new Promise((resolve, reject) => { rejectedFirst = reject; }) : Promise.resolve(); } };
  const speaker = createSpeaker({ makeAudio: source => { player.src = source; return player; }, onUnavailable: () => { unavailable++; } });
  speaker.say('Moo'); const oldError = player.onerror;
  speaker.say('Pop'); rejectedFirst(new Error('interrupted')); oldError();
  await Promise.resolve(); await Promise.resolve();
  assert.equal(unavailable, 0); assert.ok(player.src.endsWith('/pop.wav')); assert.equal(player.paused, false);
  speaker.stop(); assert.equal(player.paused, true);
});

test('missing bundled audio falls back once, with no duplicate failure reports', async () => {
  let unavailable = 0, player;
  const speaker = createSpeaker({ makeAudio: () => { player = { pause() {}, play() { return Promise.reject(new Error('missing')); } }; return player; }, onUnavailable: () => { unavailable++; } });
  speaker.say('Moo'); await Promise.resolve(); await Promise.resolve(); player.onerror();
  assert.equal(unavailable, 1);
});

test('local clip catalog cannot inject markup, traversal paths, remote media, or unlimited records', () => {
  const valid = { id: 'cow-moo', src: 'cow-moo.mp4', style: 'animal', title: '<test>', word: 'Moo' };
  assert.deepEqual(cleanClipCatalog(null), []);
  assert.deepEqual(cleanClipCatalog([valid, { ...valid, src: '../secret.mp4' }, { ...valid, src: 'https://example.org/x.mp4' }, { ...valid, title: 'x'.repeat(61) }]), [valid]);
  assert.equal(cleanClipCatalog(Array(20).fill(valid)).length, 12);
});

test('bubble primary never changes into refill, even with extra presses', () => {
 for (const example of [0,1]) {
  let state = initialTurn('bubbles',example);
  for (const index of [0,1,2]) {
   assert.deepEqual(primaryAction(state),{label:'Pop a bubble',interaction:'play',disabled:false});
   state = transition(state,{type:'pop',index});
  }
  for (let extra=0;extra<10;extra++) {
   state=transition(state,{type:'pop',index:undefined});
   assert.equal(state.popped.length,3);
   assert.deepEqual(primaryAction(state),{label:'Pop a bubble',interaction:'play',disabled:true});
  }
  state=transition(state,{type:'reset'});
  assert.deepEqual(state.popped,[]);
  assert.equal(primaryAction(state).disabled,false);
 }
});

test('More repeats the same ball roll and keeps its side when switching word labels', () => {
 const words=ACTIVITIES.find(activity=>activity.id==='words');
 assert.deepEqual(words.examples.map(item=>item.art),['ball','ball']);
 let state=initialTurn('words');
 assert.deepEqual(primaryAction(state),{label:'Roll ball',interaction:'play'});
 state=transition(state,{type:'roll'});
 assert.equal(state.ballRight,true);
 state=transition(state,{type:'next'});
 assert.equal(state.ballRight,true);
 assert.deepEqual(primaryAction(state),{label:'More!',interaction:'play'});
 for(let press=0;press<6;press++) {
  const before=state;
  state=transition(state,{type:'roll'});
  assert.equal(state.ballRight,!before.ballRight);
  assert.equal(state.turns,before.turns+1);
 }
 state=transition(state,{type:'example',index:0});
 assert.equal(state.ballRight,true);
 assert.equal(initialTurn('words').ballRight,false);
 const other=initialTurn('bubbles');
 assert.strictEqual(transition(other,{type:'roll'}),other);
});

test('bubble words follow the pop and explicit refill phases', () => {
 let state=initialTurn('bubbles');
 assert.equal(ACTIVITIES.find(a=>a.id==='bubbles').examples.length,1);
 assert.equal(bubbleMessage(state).word,'Pop!');
 for(const index of [0,1]) state=transition(state,{type:'pop',index});
 assert.equal(bubbleMessage(state).word,'Pop!');
 state=transition(state,{type:'pop',index:2});
 assert.equal(bubbleMessage(state).word,'More?');
 assert.match(bubbleMessage(state).prompt,/More bubbles/);
 assert.equal(primaryAction(state).disabled,true);
 state=transition(state,{type:'reset'});
 assert.equal(bubbleMessage(state).word,'Pop!');
});

test('the new video card has three distinct targets and reuses video actions without changing existing observations', () => {
 const extra=ACTIVITIES.find(a=>a.id==='video-play');
 assert.deepEqual(extra.examples.map(e=>e.video),['puppy-woof','ball-go','hello-wave']);
 assert.deepEqual(extra.examples.map(e=>e.speech),['Woof','Go','Hi']);
 assert.equal(Object.keys(VIDEO_FILES).length,5);
 let state=initialTurn(extra.id);
 for(let i=0;i<3;i++) {
  assert.deepEqual(primaryAction(state),{label:'Play video',interaction:'play'});
  assert.ok(VIDEO_FILES[extra.examples[state.index].video]);
  state=transition(state,{type:'next'});
 }
 assert.deepEqual(state,initialTurn(extra.id));
 const notes=cleanObservations({videos:{enjoyed:true},'video-play':{shared:true}});
 assert.deepEqual(notes,{videos:{enjoyed:true},'video-play':{shared:true}});
 assert.deepEqual(filterActivities('favorites',notes).map(a=>a.id),['videos']);
});

test('video previews cover every clip and the cow belongs only to Animal hello', () => {
 assert.deepEqual(Object.keys(VIDEO_POSTERS),Object.keys(VIDEO_FILES));
 for (const [id,poster] of Object.entries(VIDEO_POSTERS)) assert.equal(poster,id+'.jpg');
 const cowExamples=ACTIVITIES.flatMap(a=>a.examples.filter(e=>e.art==='cow').map(()=>a.id));
 assert.deepEqual(cowExamples,['animals']);
 assert.equal(ACTIVITIES.find(a=>a.id==='videos').examples[0].video,'duck-quack');
});
