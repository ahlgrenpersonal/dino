# Battle Bot Miami

A picture-based robot adventure through a small north-up Miami. Tap land to walk and the bot automatically battles nearby monsters. The mission picture points to the next camp; three battery symbols wake each district boss. The lightning button gives Power. Boss portraits, weapon pictures, arrows and check marks carry the play flow without requiring reading.

Pause → ⓘ toggles place names and adult details. These are optional and saved independently of progress. Home repairs the bot for free. Map cards show the unlocked areas and places as pictures. Build shows earned weapon pictures, robot colors, armor and wheels. Gentle mode starts on; running out of health returns the bot home with all discoveries kept.

Brickell is safe, with Panorama Tower’s single blue-glass “Trash Can Building” silhouette, Brickell City Centre’s free Ribbon Bubbler, Brickell Park, the Hammock Playground and 1814 Brickell Park. Brickell Key is a waterfront circuit around an inaccessible residential center. Little Havana has Domino Park, Tower Theater and a riverside playground, with mummy robots to battle.

Coconut Grove includes CocoWalk, Peacock Park, Park Grove’s rounded towers, Grove at Grand Bay’s twisting towers, the curved balconies of Mr. C Residences, Regatta Park, City Hall and Dinner Key Marina. Mechanical peacocks with blue necks, eye-spotted fans and wheels join the witch robots in combat.

Downtown’s waterfront has separate pictures for Bayfront Park and its pirate-ship playground, the circular jet fountain, Bayside Marketplace, Miamarina’s boats and dining terraces, the observation wheel, the arena and Museum Park. Frost Science has the planetarium dome; the nearby art museum is a quieter backdrop.

Rickenbacker Causeway reaches Hobie Beach and Virginia Key. North Point Beach and Crandon Beach have lifeguard-tower illustrations. Bear Cut Bridge leads to Key Biscayne; Cape Florida’s lighthouse and beach are farther south than Crandon. Captain Rattle waits near Cape Florida. The Frost Queen opens MacArthur Causeway to Miami Beach. After the beach camps and every earlier boss, the King near South Pointe awards the Fire-Jet Launcher.

Each chapter appears only when unlocked. After victory, all locations stay visible. Respawning restores every camp and boss while preserving weapons, upgrades, scrap, stamps and color. Clear the other bosses again to challenge the King in each new round. Old saves keep earned progress when the map expands.

The game preserves broad relative locations with an enlarged arcade scale. It does not track real-world beach conditions, lifeguard hours or temporary access changes. The Cape Florida state-park beach has no lifeguard-tower illustration.

From the repository root, run `npm start --prefix battlebot_miami`, then open `http://127.0.0.1:4217/`. No dependency installation is needed. `MIAMI_PORT` selects another port. `npm test --prefix battlebot_miami` checks campaign completion, landmark walks, private boundaries, bridge-only crossings, combat, peacocks, rewards, replay, saves, picture rendering, viewport changes and PWA behavior.

Keyboard: arrows/WASD move, Space gives Power, M opens the map, and P/Escape pauses. Native keyboard controls work within paused dialogs. The PWA caches only listed app assets, uses separate save/cache namespaces, and never loads personal place overrides. Build world10.
