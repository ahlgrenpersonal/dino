# SkySpark

A touch-first superhero flying adventure with three large, side-scrolling worlds. Fly into robots, slice them with eye lasers, chain electric sparks, and unleash an expanding electric sphere. All four powers are available immediately. No health loss, flight fuel, timers, or death screen.

- **Sunbeam City:** sunset rooftops, gardens, markets and a skybridge, ending with the Iron Colossus.
- **Emerald Plains:** grassy hills, lakes, flowers and windmills, ending with a giant tracked excavator, the Earthmover.
- **Stormpeak Range:** snowy cliffs, pines and crystal beacons, ending with the flying robot Stormwing. More squads and a stronger, moving boss make this the busiest world.

Each world is 9,600 units wide, three times the original demo width, with 18 encounter areas and six restoration landmarks. The map reveals districts as the adventure progresses. Only the current squad is active, keeping mobile rendering and navigation manageable. A roughly 15-minute level is a playtest goal; scripted completion times do not establish a child's playtime.

Touch: tap the sky to fly, a rooftop to land, or a robot to smash. Laser aims at the gold-ringed robot. Big Blast expands around the hero. The guide arrow flies toward the current adventure; revealed map destinations revisit familiar places. Keyboard: arrows/WASD, L laser, Space blast, M map, Escape pause.

Completing a world unlocks the next. Selecting a completed world automatically starts a fresh run. Unfinished worlds resume independently, including defeated robots, boss damage and position. Reloading a completed world preserves its victory until it is selected again. An optional golden sky trail remains available after victory. Original demo saves migrate locally into the larger city, preserving completed-city unlocks, counters and sound preference. Manual restart protects the previous save as a recoverable backup and leaves other worlds intact.

Music unlocks on a touch or key press. Returning from the background presents Pause; Keep flying rebuilds interrupted audio on the user gesture. Unmuting also rebuilds the audio graph. Mock checks cover interrupted, closed and frozen contexts, failed resume, stale promises and scheduler reset. Audible recovery on a physical iPhone still requires device testing.

Serve this folder with a static HTTP server. Open index.html on localhost or HTTPS. Install through Safari's Share > Add to Home Screen on iPhone, or a supported browser's install menu. After the first successful online load and service-worker installation, the game can run offline. Worker scope and caches are isolated from sibling games. refresh.html refreshes only SkySpark's app shell and preserves saved progress.

All scenery, characters, effects and music are drawn or synthesized by the app. No reference photographs, external fonts, analytics, accounts or runtime inference calls are used. Existing lightning icons remain unchanged. Application modules and the service-worker shell use build world92.

Run npm test in this folder for engine/progression, migration/reload/replay, boss collisions, rendering-coordinate, viewport, PWA asset and audio recovery checks. The command node tools/verify-workers.mjs <release-root> additionally checks actual parent/child service-worker cache isolation against a release checkout. Browser simulation does not replace a physical iPhone Home Screen playtest.
