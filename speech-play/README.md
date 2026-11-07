# Little Echo

A standalone, buildless PWA with nine short activities for shared sound and word play.
This folder is independent of the other apps in the repository.

## Run locally

Requires Node.js 20 or later. No packages need installing.

```sh
cd speech-play
npm start
npm test
npm run check
```

Open `http://127.0.0.1:4223/speech-play/`. Set `SPEECH_PLAY_PORT` to change the port.
The loopback preview also serves `/dino/speech-play/` for nested-path checks.
It serves an explicit app allowlist, never repository instructions or test artifacts.
Without npm, use `node tools/serve.mjs` and `node --test tests/*.test.mjs`.

## Play together

- Animal hello: cow, sheep, and dog sounds.
- Bubble pop: pop three bubbles, then request more with the separate refill button.
- Ready, set… go!: a short anticipation game and a beep example.
- Where’s bear?: hide, reveal, and repeat from the picture or primary button.
- Little everyday words: roll the same ball for Ball and More.
- People words: a pink Mama heart and a light blue Dada heart.
- Little action words: up, down, go, and hi, with matching movement.
- Watch a little hello: short generated cow and felt-puppet videos.
- Make a little sound: ma, ba, and oh.

The main screen shows the build once. Large activity controls stay in a pinned
row inside the viewport; tips and other supporting content scroll above it.
The grown-up area includes play ideas, optional observations, settings, and a
shortcut to the bundled videos. “Wanted more” adds an activity to Favorites.
Every activity permits repetition and switching without speech or a score.

Observations are subjective notes, not speech recognition or developmental
measurements. This shared-play demo has not been clinically evaluated and is
not treatment. Activity ideas draw on [ASHA’s parent guidance](https://www.asha.org/public/developmental-milestones/communication-milestones-19-to-24-months/).

## Sound, video, and privacy

No accounts, analytics, microphone access, or personal recordings. Preferences
and five optional observation flags per activity stay in this browser using
`speech-play.*` localStorage keys. Storage errors do not prevent play. Clearing
observations offers Undo. Browser data clearing can erase local observations.

Eighteen generic word/sound recordings are bundled. They were synthesized through
the LOW-priority local queue using Qwen3-TTS VoiceDesign without voice cloning.
Only explicitly local English device voices may be used as a fallback. Beep
repeats the same retained utterance twice. Preview the generated speech yourself;
codec and playback checks do not establish pronunciation quality.

The two bundled H3 FL2VA clips show generated characters, a clay cow and a felt
puppet. Each lasts about five seconds and starts only after a tap. Large controls
below the picture handle play/pause without native controls obscuring the video.
Clips respect Sound off and pause on close, switching, or backgrounding. Review
speech and mouth movements yourself. Gentle motion and system reduced motion
reduce illustration movement; videos still require an explicit start.

Optional generation tools submit self-contained LOW-priority test jobs through
the local HTTP queue. App use and automated tests make no model calls. Original
trials, prompts, and receipts stay in ignored `local-media/`; selected public
copies have optional metadata removed. The app never loads private trial catalogs.
Every publication requires inspection of exact outgoing files, media, and Git
history. Privacy-reviewed generic media may be published within authorized work.

## PWA updates

All runtime paths, manifest scope, and service-worker registration are relative.
The service worker owns only this folder and its own scope-specific caches.
After the first complete online load, activities, words, and both videos work
offline. Navigation uses a bounded network request with an installed-shell
fallback. Updates preserve localStorage and require an explicit update action.

Bump the build in `core.js`, `app.js` and its imports, HTML asset queries,
manifest start URL, service-worker shell/cache, and `version.json` together.
Other apps have independent versions.

Browser checks do not establish physical iPhone Home Screen layout, pronunciation
quality, or installation success. Those require checking the actual device.
