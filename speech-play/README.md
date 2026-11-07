# Little Echo

A standalone, buildless PWA with six short activities for shared sound and word play.
This folder is independent of the other apps in the repository.

The phone layout uses one large activity card per row, 18–20 px body text,
56 px or larger main touch targets, and full-screen activity views. Activity
words are 52–64 px. Short screens can scroll to the parent tips and controls;
text is never shrunk to fit everything into one screen.

## Run locally

Requires Node.js 20 or later. No packages need installing.

```sh
cd speech-play
npm start
```

Open `http://127.0.0.1:4223/speech-play/`. The preview binds to loopback only.
It also serves `/dino/speech-play/` to check a nested GitHub Pages path.
`SPEECH_PLAY_PORT` changes the port. The preview only serves app assets and optional
local MP4 samples, never the repository, test artifacts, or generation receipts.

```sh
npm test
npm run check
```

Without npm, use `node tools/serve.mjs` and `node --test tests/*.test.mjs`.
PNG icons are included; rebuilding them with `python tools/make-icons.py` requires Pillow.

## Demo activities

- Animal hello: cow, sheep, and dog sounds.
- Bubble pop: three tappable bubbles and unlimited refills.
- Ready, set… go!: a short anticipation game and a beep example.
- Where’s bear?: hide, reveal, and repeat.
- Little everyday words: ball, up, mama, and dada.
- Make a little sound: a puppet for ma, ba, and oh.

Use the app together. Every activity allows replay and switching without speech.
The grown-up area includes off-screen play ideas, optional observations, settings,
and a local video comparison. “Wanted more” adds an activity to Favorites.
Observations are subjective parent notes, not speech recognition, scores, or
developmental measurements. This demo has not been clinically evaluated and is
not treatment. Activity ideas draw on [ASHA’s parent guidance](https://www.asha.org/public/developmental-milestones/communication-milestones-19-to-24-months/).

## Sound and privacy

No accounts, analytics, microphone access, personal recordings, names, or ages. Preferences and
five optional observation flags per activity stay in this browser’s localStorage,
using only `speech-play.*` keys. Storage errors are handled; the app still plays.
Clearing observations offers Undo. Browser data clearing may erase local settings.

Seventeen generic word/sound recordings are bundled for offline playback.
They were synthesized through the LOW-priority queue using Qwen3-TTS VoiceDesign,
without cloning any person’s voice. Only explicitly local English device voices
may be used as fallback. If all audio is unavailable, model the sound together.
Preview the generated speech yourself; file/codec validation does not establish
pronunciation quality. Installation UI and audio permissions vary across devices.
System reduced motion and the app’s Gentle motion setting reduce illustration motion.

`python tools/generate-audio.py` can create the generic word trials in ignored
`local-media/audio-trial/`, with durable no-replay receipts. The selected demo audio
is copied to `assets/audio/`. No model calls occur during app use or automated tests.

## Optional local H3 video trials

`python tools/generate-samples.py` submits three independent text-only H3 FL2VA
jobs through the public queue at `127.0.0.1:8080`. Every call explicitly sets LOW
priority, workload `test`, and the separate `speech_play_media_trial` client.
Each has its complete prompt/settings; no conversation or shared bot state is used.
There are no process operations or imports from another project. The samples
compare a clay animal, a generic adult presenter, and a felt puppet. Target words
are generic. Each clip is 124 frames at 24 fps (about 5.17 seconds), with native audio.

Outputs, prompts, and receipts go only to ignored `local-media/`. A submission marker
prevents accidental replays, including after uncertain HTTP outcomes. Completed
clips can be re-downloaded from their recorded queue result if necessary without
generating again. Review both audio and visuals before showing a clip to a child.
In For grown-ups → Video samples, load the samples explicitly and start playback.
Nothing autoplays. The illustrated activities work without these files.

**Generated video trials are excluded from the commit and from offline caching.**
The optional video panel handles missing media gracefully. No media is uploaded by
this app or tooling. Specific informed approval is required before uploading any
image or generated visual media to a public destination. Later publication must
include a review of the exact selected assets, metadata, and repository history.

## PWA and future publication

The app is ready to be hosted at a subdirectory such as `/dino/speech-play/`.
All runtime paths, manifest scope, and service-worker registration are relative.
The service worker owns only this folder and caches only an explicit shell list.
It never deletes another app’s caches or unregisters another app’s workers.
The current published root game isolates its own service workers and caches.
Keep that isolation when updating any sibling PWA: one app must never unregister
another app’s worker or clear its cache. The local preview serves only this PWA.
Navigation uses the network with a bounded offline fallback. The installed shell
is kept as a consistent build snapshot. Version checks offer an explicit update
button so updates need not interrupt play. No localStorage is cleared by updates.

After the first complete online load, the illustrated activities and bundled words work offline.
Optional local video samples are online/local-preview only. Launch from localhost
or HTTPS; installation and service workers are unavailable from a `file:` URL.

Build `world3` enlarges the playroom and activity views. Bump the build in `core.js`,
`app.js` (including imports), HTML asset queries, manifest start URL, service-worker
shell/cache, and `version.json` together. The other apps have independent versions.

Desktop/mobile browser checks do not establish physical iPhone Home Screen layout,
voice quality, or installation success; those require checking the actual device.
