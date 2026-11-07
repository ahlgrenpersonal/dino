// Bundled speech first; only explicitly local device voices may be used as fallback.
export const SOUND_FILES = Object.freeze({
  moo: 'moo', baa: 'baa', woof: 'woof', pop: 'pop', more: 'more',
  'ready, set': 'ready-set', go: 'go', 'beep beep': 'beep', boo: 'boo', hi: 'hi',
  ball: 'ball', up: 'up', mama: 'mama', dada: 'dada', 'ma ma': 'ma', 'ba ba': 'ba', oh: 'oh'
});
export function soundFile(text) {
  return SOUND_FILES[String(text).toLowerCase().replace(/[.!?]/g, '').replace(/\s+/g, ' ').trim()];
}
export function selectLocalVoice(voices) {
  return voices.find(v => v.localService === true && /^en([_-]|$)/i.test(v.lang));
}
export function createSpeaker({ synth, Utterance, makeAudio, onUnavailable = () => {} }) {
  let activeAudio = null, generation = 0;
  function stop() {
    generation++;
    if (activeAudio) { activeAudio.pause(); activeAudio.currentTime = 0; activeAudio = null; }
    synth?.cancel();
  }
  function synthesize(text, token) {
    if (token !== generation) return false;
    const voice = synth && selectLocalVoice(synth.getVoices());
    if (!voice || !Utterance) { onUnavailable(text); return false; }
    const utterance = new Utterance(text);
    utterance.voice = voice; utterance.lang = voice.lang;
    utterance.rate = 0.82; utterance.pitch = 1.05; utterance.volume = 0.75;
    utterance.onerror = event => { if (token === generation && !['canceled', 'interrupted'].includes(event.error)) onUnavailable(text); };
    synth.speak(utterance);
    return true;
  }
  return {
    stop,
    say(text, enabled = true) {
      stop();
      if (!enabled) return false;
      const token = generation, file = soundFile(text);
      if (file && makeAudio) {
        const audio = makeAudio(new URL(`./assets/audio/${file}.wav`, import.meta.url).href);
        activeAudio = audio; audio.volume = 0.75;
        let handled = false;
        const fallback = () => {
          if (handled || token !== generation) return;
          handled = true; audio.pause(); activeAudio = null; synthesize(text, token);
        };
        audio.onerror = fallback;
        audio.onended = () => { if (token === generation && activeAudio === audio) activeAudio = null; };
        try { Promise.resolve(audio.play()).catch(fallback); } catch { fallback(); }
        return true;
      }
      return synthesize(text, token);
    }
  };
}
