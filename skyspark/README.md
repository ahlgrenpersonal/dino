# SkySpark

A touch-first superhero flying adventure with three large, side-scrolling worlds. Fly into robots, slice them with eye lasers, chain electric sparks, and unleash an expanding electric sphere. All powers are available immediately. No health loss, flight fuel, timers, or death screen.

- **Sunbeam City:** sunset rooftops, gardens, markets and a skybridge, ending with the Iron Colossus.
- **Emerald Plains:** grassy hills, lakes, flowers and windmills, ending with a giant tracked excavator, the Earthmover.
- **Stormpeak Range:** snowy cliffs, pines and crystal beacons, ending with the flying robot Stormwing.

Each world is 9,600 units wide. Robot formations populate all 18 stretches of the route: city has 288 ordinary robots, plains 360 and mountains 540, plus eight boss defenders and the boss in each world. Only nearby stretches are active at a time. Flying right activates more robots independently of previous kills. The boss appears near the far end even when earlier robots were bypassed. Defeating the boss completes the level. Clearing districts restores their landmarks automatically; there are no restoration-star gates.

Touch: tap the sky to fly, a rooftop to land, or a robot to smash. Sparks jumps through up to eight nearby robots in sequence (1.2-second cooldown). Laser starts at the gold-ringed target and sweeps gently upward or downward toward the larger nearby group, piercing every robot along its beam (2.2-second cooldown, three armor damage per boss per cast). Big Blast expands around the hero (five-second cooldown). Keyboard: arrows/WASD, X sparks, L laser, Space blast, M map, Escape pause. Fly freely left and right. There is no mission panel, guide arrow, automatic route or within-level fast travel. The top-bar Map button selects worlds; the bottom buttons are Sparks, Laser and Big Blast; its route illustration is an overview. The robot tally counts defeats in the current flight.

Completing a world unlocks the next. Selecting a completed world automatically starts a fresh run. Unfinished worlds resume independently, including all defeated robot IDs, boss damage, per-flight tally and position. Returning to earlier stretches preserves defeated robots while unbeaten robots remain available. Original demo and earlier saves migrate locally without resetting progress or sound preference. Boss health is tripled to 12/18/24 armor points; older partial boss damage is scaled to preserve its fraction. A save previously stranded at the far right can now reveal its boss immediately. Manual restart protects the previous save as a recoverable backup and leaves other worlds intact.

Music unlocks on a touch or key press. Returning from the background presents Pause; Keep flying rebuilds interrupted audio on the user gesture. Unmuting also rebuilds the audio graph.

Serve this folder with a static HTTP server. Open index.html on localhost or HTTPS. Install through Safari's Share > Add to Home Screen on iPhone, or a supported browser's install menu. After the first successful online load and service-worker installation, the game can run offline. Worker scope and caches are isolated from sibling games. refresh.html refreshes only SkySpark's app shell and preserves saved progress.

All scenery, characters, effects and music are drawn or synthesized by the app. No reference photographs, external fonts, analytics, accounts or runtime inference calls are used. Existing lightning icons remain unchanged. Application modules and the service-worker shell use build world94.

Run npm test in this folder for piercing/adaptive laser sweeps, staged eight-target lightning, cooldowns, boss damage/migration, spatial spawning, boss arrival with bypassed enemies, full forward-flight campaigns with at least 50 defeats in every world, defeated-ID persistence, migration/reload/replay, boss collisions, rendering, viewport and audio recovery checks. The command node tools/verify-workers.mjs <release-root> additionally checks parent/child service-worker cache isolation. Browser simulation does not replace a physical iPhone Home Screen playtest.
