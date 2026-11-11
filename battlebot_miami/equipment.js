// Equipment carried over from the standard Bot Adventure.
export const ADVENTURE_COLORS=["#ee6954","#459de0","#57bd85","#f4c54b","#f28d42","#ac7fe0"];
export const ADVENTURE_EQUIPMENT={
 "weapon": [
  {
   "id": "bumper",
   "name": "Bumper",
   "desc": "A spring-loaded punch. A brave little beginning.",
   "damage": 6,
   "range": 1.4,
   "rate": 0.65,
   "cost": 0,
   "gears": 0,
   "unlock": -1,
   "power": 1
  },
  {
   "id": "blaster",
   "name": "Blaster",
   "desc": "Bright energy bolts. Reach bots from a distance.",
   "damage": 10,
   "range": 3,
   "rate": 0.75,
   "cost": 16,
   "gears": 2,
   "unlock": -1,
   "power": 2
  },
  {
   "id": "saw",
   "name": "Buzz Saw",
   "desc": "A spinning steel blade. Lots of very quick hits.",
   "damage": 12,
   "range": 1.65,
   "rate": 0.3,
   "cost": 32,
   "gears": 3,
   "unlock": 0,
   "power": 3
  },
  {
   "id": "hammer",
   "name": "Thunder Hammer",
   "desc": "A mighty slam. Smashes several bots at once.",
   "damage": 42,
   "range": 1.9,
   "rate": 1.05,
   "cost": 55,
   "gears": 4,
   "unlock": 1,
   "power": 4
  },
  {
   "id": "lightning",
   "name": "Arc Caster",
   "desc": "Crackling lightning jumps between nearby bots.",
   "damage": 32,
   "range": 2.8,
   "rate": 0.65,
   "cost": 85,
   "gears": 5,
   "unlock": 2,
   "power": 5
  },
  {
   "id": "rocket",
   "name": "Rocket Launcher",
   "desc": "Big rockets. Big explosions. Big smiles.",
   "damage": 105,
   "range": 3.2,
   "rate": 1.35,
   "cost": 130,
   "gears": 6,
   "unlock": 3,
   "power": 6
  },
  {
   "id": "flame",
   "name": "Flamethrower",
   "desc": "A roaring fan of fire. Sweeps through a crowd.",
   "damage": 38,
   "range": 2.6,
   "rate": 0.18,
   "cost": 180,
   "gears": 7,
   "unlock": 4,
   "power": 7
  },
  {
   "id": "frost",
   "name": "Freeze Cannon",
   "desc": "Ice bursts freeze small bots and slow big ones.",
   "damage": 70,
   "range": 3,
   "rate": 0.45,
   "cost": 230,
   "gears": 8,
   "unlock": 5,
   "power": 8
  },
  {
   "id": "boomerang",
   "name": "Boomerang Blade",
   "desc": "A flying blade that cuts out and back again.",
   "damage": 110,
   "range": 3.2,
   "rate": 0.7,
   "cost": 280,
   "gears": 9,
   "unlock": 6,
   "power": 9
  },
  {
   "id": "tractor",
   "name": "Magnet Launcher",
   "desc": "Pulls nearby bots together in a magnetic blast.",
   "damage": 90,
   "range": 2.8,
   "rate": 1,
   "cost": 330,
   "gears": 10,
   "unlock": 7,
   "power": 10
  },
  {
   "id": "drone",
   "name": "Drone Bay",
   "desc": "Launches a flying helper with its own blaster.",
   "damage": 70,
   "range": 3,
   "rate": 0.35,
   "cost": 380,
   "gears": 11,
   "unlock": 8,
   "power": 11
  },
  {
   "id": "rail",
   "name": "Rail Cannon",
   "desc": "A brilliant shot that pierces a line of bots.",
   "damage": 220,
   "range": 3.25,
   "rate": 0.7,
   "cost": 440,
   "gears": 12,
   "unlock": 9,
   "power": 12
  },
  {
   "id": "meteor",
   "name": "Meteor Launcher",
   "desc": "Calls a spectacular shower of explosive stars.",
   "damage": 360,
   "range": 3.2,
   "rate": 1.2,
   "cost": 510,
   "gears": 14,
   "unlock": 10,
   "power": 13
  },
  {
   "id": "gravity",
   "name": "Gravity Hammer",
   "desc": "Pulls bots inward, then launches a mighty slam.",
   "damage": 270,
   "range": 2.6,
   "rate": 0.65,
   "cost": 580,
   "gears": 16,
   "unlock": 11,
   "power": 14
  },
  {
   "id": "sunbeam",
   "name": "Sunbeam Cannon",
   "desc": "A brilliant golden beam pierces a whole line of bots.",
   "damage": 340,
   "range": 3.25,
   "rate": 0.7,
   "cost": 650,
   "gears": 18,
   "unlock": 12,
   "power": 15
  },
  {
   "id": "swarm",
   "name": "Swarm Launcher",
   "desc": "Three tiny flying bots chase enemies together.",
   "damage": 150,
   "range": 3.2,
   "rate": 0.75,
   "cost": 720,
   "gears": 20,
   "unlock": 13,
   "power": 16
  },
  {
   "id": "supernova",
   "name": "Supernova Launcher",
   "desc": "Three star rockets burst into mighty golden shockwaves.",
   "damage": 280,
   "range": 3.2,
   "rate": 1.2,
   "cost": 850,
   "gears": 22,
   "unlock": 14,
   "power": 17
  },
  {
   "id": "crystalbeam",
   "name": "Crystal Beam",
   "desc": "The queen’s brilliant beam. Pierces a whole line of bots and their shields.",
   "damage": 1100,
   "range": 3.6,
   "rate": 0.8,
   "cost": 0,
   "gears": 0,
   "unlock": 15,
   "power": 18,
   "royalReward": true
  },
  {
   "id": "twinrockets",
   "name": "Royal Twin Rockets",
   "desc": "The king’s twin launchers. Two homing rockets deliver the mightiest explosive burst.",
   "damage": 1900,
   "range": 3.4,
   "rate": 1.25,
   "cost": 0,
   "gears": 0,
   "unlock": 15,
   "power": 19,
   "royalReward": true
  }
 ],
 "armor": [
  {
   "id": "light",
   "name": "Explorer Shell",
   "desc": "Light and colorful, with room to grow.",
   "hp": 70,
   "defense": 0,
   "cost": 0,
   "gears": 0,
   "unlock": -1
  },
  {
   "id": "steel",
   "name": "Steel Armor",
   "desc": "Riveted plates. More health for longer adventures.",
   "hp": 115,
   "defense": 1,
   "cost": 24,
   "gears": 2,
   "unlock": -1
  },
  {
   "id": "heavy",
   "name": "Heavy Armor",
   "desc": "Big shoulder plates and a very tough shell.",
   "hp": 185,
   "defense": 2,
   "cost": 65,
   "gears": 4,
   "unlock": 1
  },
  {
   "id": "reflect",
   "name": "Prism Armor",
   "desc": "A brilliant shield. Reflects some enemy damage.",
   "hp": 155,
   "defense": 2,
   "reflect": true,
   "cost": 95,
   "gears": 5,
   "unlock": 2
  },
  {
   "id": "bastion",
   "name": "Bastion Armor",
   "desc": "Thick harbor plates. Ready for a bigger adventure.",
   "hp": 300,
   "defense": 3,
   "cost": 210,
   "gears": 8,
   "unlock": 5
  },
  {
   "id": "polar",
   "name": "Polar Armor",
   "desc": "A bright crystal shell with extra protection.",
   "hp": 440,
   "defense": 4,
   "cost": 340,
   "gears": 11,
   "unlock": 8
  },
  {
   "id": "star",
   "name": "Star Armor",
   "desc": "A radiant shell that reflects incoming damage.",
   "hp": 640,
   "defense": 5,
   "reflect": true,
   "cost": 580,
   "gears": 16,
   "unlock": 12
  }
 ],
 "wheels": [
  {
   "id": "basic",
   "name": "Explorer Wheels",
   "desc": "A trusty pair of all-terrain wheels.",
   "speed": 2.15,
   "cost": 0,
   "gears": 0,
   "unlock": -1
  },
  {
   "id": "grip",
   "name": "Trail Tires",
   "desc": "Chunky tires. A little quicker everywhere.",
   "speed": 2.6,
   "cost": 28,
   "gears": 2,
   "unlock": -1
  },
  {
   "id": "speed",
   "name": "Turbo Wheels",
   "desc": "Bright blue wheels. Zoom across the valley.",
   "speed": 3.25,
   "cost": 60,
   "gears": 4,
   "unlock": 1
  },
  {
   "id": "treads",
   "name": "Tank Tracks",
   "desc": "Sturdy tracks. Extra health and steady movement.",
   "speed": 2.45,
   "hp": 40,
   "cost": 70,
   "gears": 4,
   "unlock": 2
  },
  {
   "id": "rover",
   "name": "Rover Wheels",
   "desc": "Big trail wheels. Fast, sturdy and ready to explore.",
   "speed": 3.65,
   "hp": 50,
   "cost": 240,
   "gears": 9,
   "unlock": 6
  },
  {
   "id": "hover",
   "name": "Hover Engines",
   "desc": "Glowing engines. Float quickly above the trails.",
   "speed": 4.15,
   "hp": 75,
   "cost": 500,
   "gears": 14,
   "unlock": 13
  }
 ],
 "gadget": [
  {
   "id": "none",
   "name": "Tool Pocket",
   "desc": "Ready for something wonderful.",
   "cost": 0,
   "gears": 0,
   "unlock": -1
  },
  {
   "id": "magnet",
   "name": "Loot Magnet",
   "desc": "Pulls in scrap and parts from far away.",
   "cost": 22,
   "gears": 2,
   "unlock": -1
  },
  {
   "id": "repair",
   "name": "Charge Coupler",
   "desc": "Recharges twice as fast when parked at a charging station.",
   "cost": 50,
   "gears": 3,
   "unlock": 0
  },
  {
   "id": "shield",
   "name": "Bubble Shield",
   "desc": "Blocks one hit every eight seconds.",
   "cost": 80,
   "gears": 5,
   "unlock": 2
  },
  {
   "id": "aegis",
   "name": "Aegis Shield",
   "desc": "Blocks one hit every four seconds.",
   "cost": 210,
   "gears": 8,
   "unlock": 6
  },
  {
   "id": "capacitor",
   "name": "Power Capacitor",
   "desc": "Longer power surges, ready again much sooner.",
   "cost": 310,
   "gears": 10,
   "unlock": 9
  },
  {
   "id": "vacuum",
   "name": "Treasure Vacuum",
   "desc": "Collects treasure from much farther away.",
   "cost": 350,
   "gears": 11,
   "unlock": 10
  },
  {
   "id": "buddy",
   "name": "Helper Drone",
   "desc": "A little companion adds extra blaster shots.",
   "cost": 420,
   "gears": 13,
   "unlock": 13
  }
 ]
};
