# Validation

Run `node --test tests/*.test.mjs` from this folder. The current demo has 44
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

Build world9: 44 tests pass, including retained bubble target identities, preserved peer bursts, duplicate-target rejection, explicit refill/reset, and extra empty Pop presses. Reproduced world8 by pressing Pop twice and then double-clicking: the field refilled to three. The same sequence in world9 leaves three popped; extra Enter presses do not refill it. Four mixed direct/primary/keyboard cycles ended at exactly three popped before explicit More. Both bubble examples share this cycle. No refill overlay exists. Every primary control in all21examples was clicked; both videos played with native controls absent. Custom pause, replay after ending, poster-start focus, and switching videos passed. Safe-area bounds and bubble/caption clearance passed at390x844,320x568,700x390 using synthetic59px top/34px bottom insets. Two independent source reviews passed. No media changed. Browser tests do not establish physical iPhone playback or multi-touch behavior; rendering tests establish that peer target nodes are retained.

Build world10:44 tests pass and an independent source review is clear. In-app phone-viewport checks inspected Mama’s pink heart and Dada’s light blue heart, switched examples, and pressed Hear it on both. Both action buttons fit the viewport; no browser console errors. Both hearts share the existing shape/face. Code-drawn pixels were inspected; no raster/audio/video assets changed.

Build world11:44 tests pass, including the adjacent Up/Down ordering and bundled audio coverage. At390x844 and320x568, all four action examples loaded the expected audio and kept action buttons within the viewport. The active balloon groups use opposite float-up/float-down animations. Independent review caught short-stage clipping; moving the inner SVG group by16units keeps all balloon paths within the220unit viewBox. New Down! recording:0.56seconds, monoPCM16/24kHz, generic Qwen3-TTS VoiceDesign through LOW/test local queue. Source receipt/hash and WAV metadata checked privately; no cloned/reference voice. No independent listening or acoustic transcription is claimed. The code-drawn downward arrow/balloon pixels were inspected.
