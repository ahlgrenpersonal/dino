export const BUILD = 'world16';
export const KEYS = Object.freeze({ preferences: 'speech-play.preferences.v1', observations: 'speech-play.observations.v1' });
export const FLAGS = Object.freeze(['enjoyed', 'shared', 'gesture', 'sound', 'word']);
export const VIDEO_FILES = Object.freeze({ 'cow-moo': 'cow-moo.mp4', 'puppet-ma': 'puppet-ma.mp4', 'puppy-woof': 'puppy-woof.mp4', 'ball-go': 'ball-go.mp4', 'hello-wave': 'hello-wave.mp4' });
export const ACTIVITIES = Object.freeze([
  { id: 'animals', title: 'Animal hello', category: 'sounds', label: 'Listen & copy', color: 'mint', description: 'A little moo. A little you.', target: 'Sounds & imitation', tip: 'Make the sound yourself, then leave a little quiet space. Any response is welcome.', realPlay: 'Find a toy animal or a picture in a book. Make its sound together.', examples: [
    { art: 'cow', label: 'Cow', word: 'Moo', speech: 'Moo', prompt: 'What does the cow say?' },
    { art: 'sheep', label: 'Sheep', word: 'Baa', speech: 'Baa', prompt: 'A soft little sheep sound.' },
    { art: 'dog', label: 'Dog', word: 'Woof', speech: 'Woof', prompt: 'Say hello to the puppy.' }
  ] },
  { id: 'bubbles', title: 'Bubble pop', category: 'play', label: 'Touch & discover', color: 'sky', description: 'Tiny bubbles, happy pops.', target: 'Cause & effect', tip: 'Try “pop,” then pause. Take turns popping. There is no need to ask for a word.', realPlay: 'Try real bubbles together. Pause before blowing another and notice any way of asking for more.', examples: [
    { art: 'bubbles', label: 'Pop', word: 'Pop!', speech: 'Pop', prompt: 'Tap a bubble. Pop, pop, pop!' }
  ] },
  { id: 'car', title: 'Ready, set… go!', category: 'play', label: 'Wait & wonder', color: 'peach', description: 'A little pause. Then off we go.', target: 'Anticipation & turns', tip: 'Join in with “ready, set…” and leave a playful pause. Then say “go” and enjoy the car together.', realPlay: 'Roll a toy car back and forth. Try the same “ready, set… go!” game.', examples: [
    { art: 'car', label: 'Go', word: 'Go!', speech: 'Go', prompt: 'Let’s send the little car on its way.' },
    { art: 'car', label: 'Beep', word: 'Beep!', speech: 'Beep beep', prompt: 'A friendly beep from the little car.' }
  ] },
  { id: 'peekaboo', title: 'Where’s bear?', category: 'play', label: 'Hide & surprise', color: 'lavender', description: 'Hide, peek, and say hello.', target: 'Shared enjoyment', tip: 'Copy the hiding action yourself. Follow their interest; a smile, movement, or sound can be a turn.', realPlay: 'Hide your face behind your hands or a scarf. Play peekaboo face to face.', examples: [
    { art: 'bear', label: 'Boo', word: 'Boo!', speech: 'Boo', prompt: 'Someone is hiding. Shall we peek?' },
    { art: 'bear', label: 'Hi', word: 'Hi!', speech: 'Hi', prompt: 'There you are. Hello, little bear.' }
  ] },
  { id: 'words', title: 'Little everyday words', category: 'words', label: 'Look & listen', color: 'butter', description: 'A ball. Another little roll.', target: 'Single words', tip: 'Say “ball” as it rolls. Pause, then offer “more” and roll it again. Any response can be a turn.', realPlay: 'Roll a real ball back and forth together. Pause, offer “more,” and enjoy another turn.', examples: [
    { art: 'ball', label: 'Ball', word: 'Ball', speech: 'Ball', prompt: 'A ball! Tap to roll it.' },
    { art: 'ball', label: 'More', word: 'More', speech: 'More', prompt: 'More? Let’s roll the ball again.' }
  ] },
  { id: 'people', title: 'People words', category: 'words', label: 'Familiar words', color: 'rose', description: 'Two little words for familiar people.', target: 'People & connection', tip: 'Use the word your family uses naturally. Point to a familiar person together, without asking for a repeat.', realPlay: 'Greet a familiar grown-up together. Any look, gesture, or sound can be a hello.', examples: [
    { art: 'heart', label: 'Mama', word: 'Mama', speech: 'Mama', prompt: 'A familiar word to share.' },
    { art: 'heart-blue', label: 'Dada', word: 'Dada', speech: 'Dada', prompt: 'Another familiar word to share.' }
  ] },
  { id: 'actions', title: 'Little action words', category: 'words', label: 'Words in motion', color: 'sky', description: 'Up, down, go, and a little hello.', target: 'Words to use together', tip: 'Match a single word to an action. Say it once, pause, and enjoy the action together.', realPlay: 'Lift a toy for “up,” lower it for “down,” roll it for “go,” or wave and say “hi.” Let the play lead.', examples: [
    { art: 'up', label: 'Up', word: 'Up!', speech: 'Up', prompt: 'Up, up, into the sky.' },
    { art: 'down', label: 'Down', word: 'Down!', speech: 'Down', prompt: 'Down, down, gently down.' },
    { art: 'car', label: 'Go', word: 'Go!', speech: 'Go', prompt: 'One little word to get moving.' },
    { art: 'puppet', label: 'Hi', word: 'Hi!', speech: 'Hi', prompt: 'A friendly hello and a wave.' }
  ] },
  { id: 'videos', title: 'Watch a little hello', category: 'play', label: 'Watch & copy', color: 'mint', description: 'A cow and a puppet, with time for a turn.', target: 'Two short videos', tip: 'Watch one short clip together, then pause. Copy the sound yourself and leave room for any response.', realPlay: 'Put the screen aside and play with a toy animal or puppet. Try the same sound face to face.', examples: [
    { art: 'cow', label: 'Cow', word: 'Moo', speech: 'Moo', video: 'cow-moo', prompt: 'Watch the cow. Then try a little moo together.' },
    { art: 'puppet', label: 'Puppet', word: 'Ma, ma', speech: 'Ma. Ma.', video: 'puppet-ma', prompt: 'Watch the puppet. Then leave space for a turn.' }
  ] },
  { id: 'video-play', title: 'More little videos', category: 'play', label: 'Watch & play', color: 'peach', description: 'Woof, go, and a friendly hi.', target: 'Three short videos', tip: 'Try one short clip, then pause. Notice what catches their interest. Repeat a favorite or stop whenever you like.', realPlay: 'Find a toy puppy, roll a ball, or wave to someone nearby. Try the same little sound away from the screen.', examples: [
    { art: 'dog', label: 'Puppy', word: 'Woof', speech: 'Woof', video: 'puppy-woof', prompt: 'A puppy says woof. Watch, then leave room for a turn.' },
    { art: 'ball', label: 'Ball', word: 'Go!', speech: 'Go', video: 'ball-go', prompt: 'Ready for a little roll? Go!' },
    { art: 'hello', label: 'Wave', word: 'Hi!', speech: 'Hi', video: 'hello-wave', prompt: 'A friendly wave and a little hi. Wave together if you like.' }
  ] },
  { id: 'copy', title: 'Make a little sound', category: 'sounds', label: 'Your turn, my turn', color: 'rose', description: 'A silly sound to share together.', target: 'Vocal play', tip: 'You can copy a sound they already make. Then offer yours and wait. Keep it playful and stop when interest fades.', realPlay: 'Put the screen aside and copy each other’s sounds, expressions, or gentle hand movements.', examples: [
    { art: 'puppet', label: 'Ma', word: 'Ma, ma', speech: 'Ma. Ma.', prompt: 'A soft little “ma.” Your turn, my turn.' },
    { art: 'puppet', label: 'Ba', word: 'Ba, ba', speech: 'Ba. Ba.', prompt: 'Try a bouncy little “ba.”' },
    { art: 'puppet', label: 'Oh', word: 'Oh!', speech: 'Oh', prompt: 'A round little “oh!”' }
  ] }
]);

export function activityById(id) { return ACTIVITIES.find(activity => activity.id === id) || ACTIVITIES[0]; }
export function primaryAction(state) {
  if (state.id === 'words') return { label: state.index === 0 ? 'Roll ball' : 'More!', interaction: 'play' };
  if (state.id === 'bubbles') return { label: 'Pop a bubble', interaction: 'play', disabled: state.popped.length === 3 };
  if (state.id === 'peekaboo') return { label: state.revealed ? 'Hide bear' : 'Peekaboo!', interaction: 'play' };
  if (activityById(state.id).examples[state.index]?.video) return { label: 'Play video', interaction: 'play' };
  if (state.id === 'car' && state.index === 0) return { label: 'Let’s go!', interaction: 'play' };
  return { label: 'Hear it', interaction: 'sound' };
}
export function bubbleMessage(state) {
  return state.popped.length === 3
    ? { word: 'More?', prompt: 'All popped! Tap More bubbles for another turn.' }
    : { word: 'Pop!', prompt: 'Tap a bubble. Pop, pop, pop!' };
}
export function filterActivities(filter, notes = {}) {
  if (filter === 'favorites') return ACTIVITIES.filter(activity => notes[activity.id]?.enjoyed);
  return ACTIVITIES.filter(activity => filter === 'all' || activity.category === filter);
}
export function initialTurn(id = 'animals', index = 0) {
  const activity = activityById(id);
  return { id: activity.id, index: Number.isInteger(index) && index >= 0 && index < activity.examples.length ? index : 0, popped: [], revealed: false, phase: 'idle', turns: 0, ballRight: false };
}
export function transition(state, action) {
  const activity = activityById(state.id);
  switch (action.type) {
    case 'example':
    case 'next': {
      const next = initialTurn(state.id, action.type === 'example' ? action.index : (state.index + 1) % activity.examples.length);
      return state.id === 'words' ? { ...next, ballRight: state.ballRight } : next;
    }
    case 'roll': return state.id === 'words' ? { ...state, ballRight: !state.ballRight, turns: state.turns + 1 } : state;
    case 'pop': {
      if (![0, 1, 2].includes(action.index) || state.popped.includes(action.index)) return state;
      return { ...state, popped: [...state.popped, action.index], turns: state.turns + 1 };
    }
    case 'reveal': return { ...state, revealed: !state.revealed, turns: state.turns + 1 };
    case 'ready': return state.phase === 'idle' ? { ...state, phase: 'ready' } : state;
    case 'go': return state.phase === 'ready' ? { ...state, phase: 'go', turns: state.turns + 1 } : state;
    case 'rest': return { ...state, phase: 'idle' };
    case 'play': return { ...state, turns: state.turns + 1 };
    case 'reset': return initialTurn(state.id, state.index);
    default: return state;
  }
}

export function cleanPreferences(value) {
  return { sound: value?.sound !== false, gentle: value?.gentle === true };
}
export function cleanObservations(value) {
  const result = {};
  for (const { id } of ACTIVITIES) {
    const flags = {};
    for (const flag of FLAGS) if (value?.[id]?.[flag] === true) flags[flag] = true;
    if (Object.keys(flags).length) result[id] = flags;
  }
  return result;
}
export function toggleObservation(notes, id, flag) {
  if (!ACTIVITIES.some(a => a.id === id) || !FLAGS.includes(flag)) return cleanObservations(notes);
  return cleanObservations({ ...notes, [id]: { ...notes[id], [flag]: !notes[id]?.[flag] } });
}
export function readLocal(storage, key, cleaner) {
  try { return cleaner(JSON.parse(storage.getItem(key))); } catch { return cleaner(null); }
}
export function writeLocal(storage, key, value) {
  try { storage.setItem(key, JSON.stringify(value)); return true; } catch { return false; }
}

// A turn owns its timeouts. Closing, switching, or hiding the page invalidates them.
export function createTimeline({ set = setTimeout, clear = clearTimeout } = {}) {
  let generation = 0;
  const handles = new Set();
  return {
    cancel() { generation++; for (const handle of handles) clear(handle); handles.clear(); },
    after(ms, callback) {
      const current = generation;
      const handle = set(() => { handles.delete(handle); if (current === generation) callback(); }, ms);
      handles.add(handle);
      return handle;
    }
  };
}

export function cleanClipCatalog(value) {
  if (!Array.isArray(value)) return [];
  return value.filter(row => row && /^[a-z0-9-]+$/.test(row.id) && /^[a-z0-9-]+\.mp4$/.test(row.src)
    && ['animal', 'human', 'puppet'].includes(row.style) && typeof row.title === 'string' && row.title.length <= 60
    && typeof row.word === 'string' && row.word.length <= 30).slice(0, 12);
}
