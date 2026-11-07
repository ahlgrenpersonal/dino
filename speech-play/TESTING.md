# Demo validation

Run `node --test tests/*.test.mjs` from this folder. The initial demo has 36
passing tests and needs no installed Node packages. Tests use fake scheduling,
speech, workers, and caches; they never call an inference model.

Automated coverage includes activity turns and resets, cancellation of delayed
work/audio, storage failure and schema filtering, favorites, local-only speech
fallback, audio-file coverage and PCM integrity, offline navigation, scoped cache
cleanup, WAV byte ranges, version consistency, shell completeness, preview server
file restrictions, and worker-registration update races.

The demo was also checked through the Codex in-app browser:

- All six activity types, example selection, replay, and bundled audio loading.
- Bubble refills, repeated peekaboo, car anticipation and cancellation on close.
- Observation persistence, favorites, modal-accessible Clear/Undo, and returning
  from the notebook to the activity.
- Optional animal, adult-presenter, and puppet video samples: explicit playback,
  pause, switching, and pause on closing. All three MP4s fully decoded to 124
  frames at 24 fps with audio tracks. This is not pronunciation-quality validation.
- Desktop layout and 390×844 / 320×568 phone viewports, including reachable
  scrolling dialog controls and no horizontal overflow.
- Reload and bundled audio with the preview server actually stopped.
- A disposable nested-path fixture upgraded from world1 to world2 using the
  explicit update button, retained its favorite, then reloaded and played audio
  with that server stopped. Fixture files are not part of the demo commit.
- No browser console errors during the final online smoke check.

Two independent code reviews were completed and their material findings resolved.
Screenshots, generated video samples, generation receipts, and disposable fixtures
remain ignored and local.

Physical iPhone Home Screen behavior and generated speech quality still require
on-device/adult review. The publication candidate uses the current remote baseline,
whose root worker already preserves sibling apps’ caches and registrations.
Nothing is deployed by these checks.
