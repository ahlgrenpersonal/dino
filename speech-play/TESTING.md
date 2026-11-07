# Validation

Run `node --test tests/*.test.mjs` from this folder. All 61 tests pass without
installed packages or inference calls. Automated coverage includes activity
transitions, duplicate/extra bubble presses, retained bubble targets, repeated
ball rolls, timer and audio cancellation, storage filtering/failure, Favorites,
local-only voice fallback, bundled audio integrity, identical repeated beeps,
PWA build consistency, offline shell/media ranges, cache isolation, preview file
restrictions, worker races, bounded activation, and stalled version responses.

## Three review rounds

Each round received two independent source and screenshot reviews. Reviewers’
own browser sessions could not navigate. All browser actions were performed by
the primary agent in the in-app browser, following reviewer scenarios. Reviewers
independently inspected the resulting pixels and reported findings. These are
mediated interaction reviews, not independent browser operation.

- World13: checked all 22 original examples, all four grown-up panels, filters,
  Favorites, observation clearing/Undo, repeated bubbles, peekaboo, and video
  pause/resume/replay. Every activity was checked at 320x568 and examples at
  390x844. Fixed the redundant bubble More tab, clipped small-screen bubble
  caption, oversized inline icons, stale replay hints, unavailable private-video
  controls, and update discovery. The revised sampler has 21 examples.
- World14: repeated all 21 examples, primary/picture actions, and panel checks.
  Ten mixed ball presses alternated sides; muted videos played with Gentle
  motion. Fixed wide bubble/caption overlap, preserved return to an activity
  after installation help, and pinned the grown-up dismissal header. Verified
  genuine 760x844 bubble geometry and scrolled installation-help dismissal.
- World15: both reviewers inspected all 21 examples, four panels, corrected wide
  views, and final synthetic safe-area screenshots. No remaining visual blocker
  was reported. Fixed update reconciliation, preserved an already-current offline
  shell, and bounded version checks so stalled headers or bodies permit retries.

## Final browser evidence

At 390x844 with simulated 59px top and 34px bottom insets, every activity’s two
entire action buttons ended at y798, above the usable y810 boundary. Activity
Close started at y67, below the top inset. The grown-up Close remained at
87–143 while its content was scrolled to 850. These are browser simulations,
not physical iPhone Home Screen measurements.

A controlled, version-consistent upgrade fixture announced a newer build while
the old play activity remained open. One explicit update action caused one
non-precache document request and retained an anonymous favorite, Sound off,
and Gentle motion. The new module loaded and no stale update prompt remained.
With the server stopped, the applied build reloaded all nine activities and both
5.167-second videos played from cache. The release build was also separately
loaded with its server stopped and both bundled videos reached readyState 4.
Earlier inconsistent fixture runs were discarded; fixture files stay private.

## Privacy and verification limits

The publication audit checks all outgoing app files, reachable Git history,
neutral commit identities, filenames, URLs, storage/cache keys, media metadata,
and exact generic generation provenance. No media assets changed in these three
rounds. Reviewers inspected the activity illustration/video pixels. Original
trials, prompts, receipts, instructions, and test captures remain ignored.

Audio playback, PCM integrity, source-script provenance, and codec checks do not
certify pronunciation or lip sync. No independent listening, acoustic
transcription, physical iPhone installation, or real multi-touch testing is
claimed. The app records no microphone input and sends no observations to an
account.


## World16 video expansion

The main screen now starts with activities. The separate More little videos
card adds Puppy/Woof, Ball/Go, and Wave/Hi alongside the existing two-video card.
All five catalog videos are explicitly precached and served by the preview
allowlist. Existing activity IDs and saved observations retain their meaning.

Three new text-only H3 FL2VA jobs ran through the local HTTP queue with explicit
LOW priority and test provenance. Each clip is 124 frames at 24 fps, about
5.167 seconds. Two reviewers inspected 62 sampled frames per clip plus three
full-resolution stills. No visible text or identifying content was found. A
reviewer independently probed the exact public MP4s: H264/AAC only, no chapters,
and only generic MP4 brand/handler tags. Lossless remuxing preserved encoded
packets, decoded video/audio, and timestamps while removing optional metadata.
Private prompts, receipts, original files, and review sheets remain unpublished.

Browser checks covered poster start, focus transfer, play/pause/resume, replay
hints, switching without autoplay, both grown-up shortcuts, Favorites, mute,
and Gentle motion. All new examples kept both entire controls within 390x844
and 320x568 viewports. With the preview server stopped, the world16 shell
reloaded all ten activities; all three new videos played from cache. The Wave
clip reached its full end at readyState 4. The original two clips also played
after the shared video handling changed. No online browser console errors.

Reviewer browser operation remained mediated by the primary agent. No
independent listening, pronunciation certification, or physical iPhone test
is claimed.
