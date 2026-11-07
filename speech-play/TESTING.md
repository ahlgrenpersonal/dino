# Validation

Run `node --test tests/*.test.mjs` from this folder. The current demo has 42
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

Build world6: all 41 Node tests pass. The version is visible at the top of the playroom, activity header, and grown-up panel in a 320x568 in-app browser viewport, with no horizontal overflow. An independent source review caught a narrow activity-header collision; the final mobile header uses separate rows and passed re-review. These checks do not establish physical iPhone behavior. No media changed in this build.

Build world7: all 41 Node tests pass. The final layout passed 48 in-app browser checks: every activity/example at 390x844, plus all nine activities at 320x568, 700x390, and 1280x720. A local fixture reserved 59px top and 34px bottom space. Both entire action buttons remained within these usable bounds; bubble targets remained within their stage. Video play/switch/play, scrolling with pinned controls, activity entry scroll reset, and peekaboo reveal passed with no browser console errors. An independent review caught clipped bubble targets on short screens; the final stage minimum height passed re-review. Synthetic viewport/inset checks do not establish physical iPhone Home Screen behavior. No media changed.

Build world8: 42 Node tests pass, including bubble primary routing through all three pops and refill. Hands-on browser checks pressed the primary control for all 21 examples across all nine activities; observed pop counts, peek reveal, car ready state, illustration playback classes, and both running videos. Complete primary pop/refill cycles, direct bubble taps, and More-example refill passed. With sound off and Gentle motion on, all three bubbles still visibly clear and refill works. Version text appears once on the main screen and is absent from activity dialogs and settings. Full action-button bounds and bubble geometry passed at 320x568 and 700x390; all examples passed button bounds at390x844 with synthetic59px top/34px bottom insets. No browser console errors. Both independent source reviews passed; the refill overlay now waits briefly so the final burst can show, without a delay under Gentle motion or reduced-motion preference. No media changed. No independent listening or physical iPhone verification is claimed.
