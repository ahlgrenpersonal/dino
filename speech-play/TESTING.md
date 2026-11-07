# Validation

Run `node --test tests/*.test.mjs` from this folder. All 59 tests pass without
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
