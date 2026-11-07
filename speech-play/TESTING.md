# Validation

Run `node --test tests/*.test.mjs` from this folder. The current demo has 41
passing tests and needs no installed Node packages. Automated tests use fake
scheduling, speech, workers, and caches; they never call an inference model.

Coverage includes activity turns/resets, primary-action routing, cancellation of
delayed work/audio, storage filtering/failure, favorites, local-only speech
fallback, audio coverage/PCM integrity, exact duplicate-beep composition, offline
navigation, app-scoped caches, WAV/MP4 byte ranges, build consistency, preview
file restrictions, and worker update races. New shell installs explicitly fetch
fresh files to avoid reusing older audio from the browser's HTTP cache.

## Browser interaction checks

The world5 demo was checked in the Codex in-app browser:

- All nine cards, including all 13 animal/word/syllable examples in the five
  simple sound/word cards; bundled audio loaded successfully.
- Both peekaboo tap targets reveal/hide the bear. The existing curtain elements
  are retained for their CSS transition. Switching examples resets the reveal.
  Gentle motion still reveals the bear without requiring an animation to finish.
- Repeated car primary taps preserve the ready/set phase until the scheduled go;
  the picture and primary button share the same guarded action.
- Bubble popping/refill; the replacement pop and repeated beep load correctly.
- Action words select the matching rise, drive, and wave animations; the new hand
  was visually inspected. No horizontal overflow in checked phone layouts.
- Both selected video clips play, switch without autoplay, and receive keyboard
  focus when started. Earlier world4 checks cover close/mute/notebook launch and
  server-stopped offline playback of both clips.
- Desktop, 390×844 and 320×568 phone checks; controls on short screens remain
  reachable by scrolling. Earlier checks also cover landscape and synthetic
  safe-area insets. These do not establish physical iPhone Home Screen behavior.
- Two independent source reviews were completed and their material findings fixed.

Screenshots, receipts, source trials, and disposable test artifacts stay local
and ignored. Only the two selected metadata-sanitized video copies are bundled.

Speech synthesis is not word-perfect. Playback/PCM checks do not certify speech
quality. The beep repeats the exact first utterance from the two-beep preview;
its second generated utterance is excluded. Pop uses a new normal-speaking-voice
direction. No independent listening or acoustic transcription is claimed.
