# Board Games

A standalone, offline-friendly Tic Tac Toe PWA. Play Noodle, a goofy illustrated buddy, or take turns with a friend on one device.

- Easy chooses uniformly among empty tiles. No search or perfect-play engine.
- Optional Extra Gentle: with the configured probability, exclude immediate winning moves when a non-winning move exists. When the check fails, choose randomly as normal. This probability is the chance of applying avoidance, not the final win rate.
- Winning-move hints support every row, column and diagonal, with an adjustable probability per eligible turn.
- Noodle has twelve expressions, including three randomized reactions when the human wins. Computer wins use supportive expressions and no celebration.
- Settings and legal game positions are saved locally. No accounts, analytics, external fonts, or model calls.
- Sound is opt-in. Calm motion and operating-system reduced-motion preferences suppress animation.

Serve the repository with any static HTTP server, then open `/board-games/`. Install from the browser’s home-screen/install action. First load requires a connection; subsequent offline launches use the cached app shell. The service worker is scoped to this folder and only removes caches prefixed `board-games-`.

Run checks: `cd board-games` then `npm test`. Rebuild raster icons with `python tools/make-icons.py` (Pillow).

Build `world3`: keep the build identifier in the app, HTML asset queries, module imports, manifest, service-worker cache/assets, and version.json synchronized for future public changes. The app checks version.json on launch and foregrounding, preserving local storage during updates.

Phone browser checks do not establish physical iPhone standalone layout behavior; confirm that on a device before claiming it is verified.
