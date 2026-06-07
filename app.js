const bombCountEl = document.querySelector("#bombCount");
const bombLayer = document.querySelector("#bombLayer");
const findCountEl = document.querySelector("#findCount");
const enemyLayer = document.querySelector("#enemyLayer");
const itemButton = document.querySelector("#itemButton");
const room = document.querySelector("#room");
const terrainLayer = document.querySelector("#terrainLayer");
const hero = document.querySelector(".hero");
const bombButton = document.querySelector("#bombButton");
const resetButton = document.querySelector("#resetButton");
const statusText = document.querySelector("#statusText");
const pauseButton = document.querySelector("#pauseButton");

const itemStorageKey = "dino-collected-items";
const inventoryStorageKey = "dino-inventory";
const oldItemStorageKey = "dino-boom-berries-collected";
const terrainStorageKey = "dino-destroyed-terrain";
const buildVersion = "world18";
const worldColumns = 50;
const worldRows = 1;
const screenGrid = {
  columns: 10,
  rows: 18
};
const startScreen = { x: 0, y: 0 };
const startPosition = { x: 4, y: 10 };
const gateScreenX = 30;
const bombFuseMs = 3000;
const bombExplosionMs = 900;
const bombDamage = 10;
const directionVectors = {
  up: { x: 0, y: -1 },
  right: { x: 1, y: 0 },
  down: { x: 0, y: 1 },
  left: { x: -1, y: 0 }
};
const oppositeDirections = {
  up: "down",
  right: "left",
  down: "up",
  left: "right"
};
const enemyTypes = {
  fodder: {
    name: "Little dino",
    className: "enemy-fodder",
    hp: 1,
    moveDelay: 1800,
    attackWindup: 1300,
    attackCooldown: 2400,
    aggroRange: 8,
    staggerShield: 0,
    staggerDamage: 1,
    pursue: true,
    damageFront: 1,
    damageOther: 1
  },
  raptor: {
    name: "Raptor",
    className: "enemy-raptor",
    hp: 1,
    moveDelay: 650,
    attackWindup: 550,
    attackCooldown: 1100,
    aggroRange: 12,
    staggerShield: 0,
    staggerDamage: 1,
    pursue: true,
    damageFront: 1,
    damageOther: 1
  },
  tank: {
    name: "Armor dino",
    className: "enemy-tank",
    hp: 6,
    moveDelay: 1700,
    attackWindup: 850,
    attackCooldown: 1700,
    aggroRange: 7,
    staggerShield: 0,
    staggerDamage: 1,
    pursue: true,
    damageFront: 1,
    damageOther: 2
  },
  giant: {
    name: "Giant grazer",
    className: "enemy-giant",
    hp: 5,
    moveDelay: 2400,
    attackWindup: 1600,
    attackCooldown: 3200,
    aggroRange: 2,
    staggerShield: 1,
    staggerDamage: 2,
    pursue: false,
    damageFront: 1,
    damageOther: 1
  },
  trex: {
    name: "T-rex",
    className: "enemy-trex",
    hp: 4,
    moveDelay: 700,
    attackWindup: 500,
    attackCooldown: 1000,
    aggroRange: 12,
    staggerShield: 0,
    staggerDamage: 1,
    pursue: true,
    damageFront: 1,
    damageOther: 1
  }
};

let initialScreen = { ...startScreen };
let initialStatus = "Ready";
let currentScreen = { ...startScreen };
let enemiesByScreen = new Map();
let inventory = loadInventory();
let collectedItems = loadCollectedItems();
let destroyedTerrain = loadDestroyedTerrain();
let droppedBombs = [];
let bombSequence = 0;
let heroPosition = { ...startPosition };
let heroFacing = "down";
let roomStatus = "Ready";
let isPaused = false;
let pausedAt = 0;

const previewScreen = new URLSearchParams(window.location.search).get("screen");

if (previewScreen) {
  const [previewX, previewY] = previewScreen.split(",").map(Number);

  if (
    Number.isInteger(previewX) &&
    Number.isInteger(previewY) &&
    previewX >= 0 &&
    previewX < worldColumns &&
    previewY >= 0 &&
    previewY < worldRows
  ) {
    initialScreen = { x: previewX, y: previewY };
    initialStatus = "Preview";
    currentScreen = { ...initialScreen };
    roomStatus = initialStatus;
  }
}

function keyFor(position) {
  return `${position.x},${position.y}`;
}

function cellKey(position) {
  return `${position.x},${position.y}`;
}

function createRandom(seed) {
  let state = seed >>> 0;

  return () => {
    state = (state * 1664525 + 1013904223) >>> 0;
    return state / 4294967296;
  };
}

function makeCellSet(cells) {
  return new Set(cells.map(cellKey));
}

function addCell(cells, x, y) {
  if (x >= 0 && x < screenGrid.columns && y >= 0 && y < screenGrid.rows) {
    cells.push({ x, y });
  }
}

function removeCells(cells, shouldRemove) {
  for (let index = cells.length - 1; index >= 0; index -= 1) {
    if (shouldRemove(cells[index])) {
      cells.splice(index, 1);
    }
  }
}

function addUniqueCell(cells, x, y) {
  const candidate = { x, y };

  if (!cells.some((cell) => isSameCell(cell, candidate))) {
    addCell(cells, x, y);
  }
}

function isGateCell(cell) {
  return cell.x >= 7 && cell.x <= 9;
}

function terrainKey(screen, type, cell) {
  return `${keyFor(screen)}:${type}:${cellKey(cell)}`;
}

function fixedItemForScreen(screenX, screenY) {
  if (screenX === startScreen.x && screenY === startScreen.y) {
    return { id: "start-bombs", type: "bomb", count: 3, x: 6, y: 8, hidden: false };
  }

  if (screenX === gateScreenX && screenY === 0) {
    return { id: "gate-bombs", type: "bomb", count: 2, x: 2, y: 9, hidden: false };
  }

  return null;
}

function reservePickupArea(blockedCells, item) {
  if (!item) {
    return;
  }

  for (let y = item.y - 1; y <= item.y + 1; y += 1) {
    for (let x = item.x - 1; x <= item.x + 1; x += 1) {
      if (x >= 0 && x < screenGrid.columns && y >= 0 && y < screenGrid.rows) {
        blockedCells.add(cellKey({ x, y }));
      }
    }
  }
}

function isReservedCell(position) {
  return (
    (Math.abs(position.x - startPosition.x) <= 1 && Math.abs(position.y - startPosition.y) <= 1) ||
    position.x === 0 ||
    position.x === screenGrid.columns - 1 ||
    position.y === 0 ||
    position.y === screenGrid.rows - 1
  );
}

function findOpenCell(random, blockedCells, occupiedCells = []) {
  for (let attempt = 0; attempt < 80; attempt += 1) {
    const candidate = {
      x: 1 + Math.floor(random() * (screenGrid.columns - 2)),
      y: 1 + Math.floor(random() * (screenGrid.rows - 2))
    };

    if (
      !isReservedCell(candidate) &&
      !blockedCells.has(cellKey(candidate)) &&
      !occupiedCells.some((cell) => isSameCell(cell, candidate))
    ) {
      return candidate;
    }
  }

  return null;
}

function addGateScreenTerrain(screenX, water, bridges, ponds, mountains, rocks, trees) {
  if (screenX !== gateScreenX) {
    return;
  }

  removeCells(water, isGateCell);
  removeCells(bridges, isGateCell);
  removeCells(ponds, isGateCell);
  removeCells(mountains, isGateCell);
  removeCells(rocks, isGateCell);

  for (let x = 7; x <= 9; x += 1) {
    for (let y = 0; y < screenGrid.rows; y += 1) {
      addUniqueCell(trees, x, y);
    }
  }
}

function filterDestroyedTerrain(screen) {
  screen.trees = screen.trees.filter((cell) => !destroyedTerrain.has(terrainKey(screen, "tree", cell)));
  screen.obstacles = [...screen.rocks, ...screen.trees, ...screen.mountains];

  return screen;
}

function createScreen(screenX, screenY) {
  const seed = 1009 + screenX * 9176 + screenY * 1319;
  const random = createRandom(seed);
  const water = [];
  const bridges = [];
  const ponds = [];
  const mountains = [];
  const rocks = [];
  const trees = [];
  const enemies = [];
  const fixedItem = fixedItemForScreen(screenX, screenY);
  const theme = screenX % 9 < 3 ? "meadow" : screenX % 9 < 6 ? "highland" : "lowland";
  const name = screenX === startScreen.x && screenY === startScreen.y ? "Sunny path" : "Wild path";

  if (screenX % 7 === 2 || screenX % 11 === 5) {
    for (let y = 0; y < screenGrid.rows; y += 1) {
      addCell(water, 3, y);
      addCell(water, 4, y);
    }

    const bridgeY = 4 + Math.floor(random() * 8);
    for (let x = 3; x <= 4; x += 1) {
      addCell(bridges, x, bridgeY);
      addCell(bridges, x, bridgeY + 1);
    }
  }

  if (screenX % 8 === 4) {
    const lakeTop = 4 + Math.floor(random() * 4);

    for (let x = 2; x <= 7; x += 1) {
      addCell(water, x, lakeTop);
      addCell(water, x, lakeTop + 1);
      addCell(water, x, lakeTop + 2);
    }

    const bridgeX = 4 + Math.floor(random() * 2);
    for (let y = lakeTop; y <= lakeTop + 2; y += 1) {
      addCell(bridges, bridgeX, y);
      addCell(bridges, bridgeX + 1, y);
    }
  }

  if (screenX !== startScreen.x && screenX % 5 === 1) {
    const wallX = 5 + Math.floor(random() * 2);
    const gapTop = 4 + Math.floor(random() * 8);

    for (let y = 1; y < screenGrid.rows - 1; y += 1) {
      if (y === gapTop || y === gapTop + 1 || y === gapTop + 2) {
        continue;
      }

      addCell(mountains, wallX, y);
      addCell(mountains, wallX + 1, y);
    }
  }

  if (screenX % 6 === 3) {
    for (let x = 1; x <= 8; x += 1) {
      if (x === 4 || x === 5) {
        continue;
      }

      addCell(mountains, x, 2);
      addCell(mountains, x, 3);
    }
  }

  addGateScreenTerrain(screenX, water, bridges, ponds, mountains, rocks, trees);

  const pondCount = screenX === startScreen.x && screenY === startScreen.y ? 0 : Math.floor(random() * 3);
  const reservedWater = new Set([...water.map(cellKey), ...bridges.map(cellKey)]);

  for (let index = 0; index < pondCount; index += 1) {
    const pond = findOpenCell(random, reservedWater, ponds);

    if (pond) {
      ponds.push(pond);
      reservedWater.add(cellKey(pond));
    }
  }

  const blockedForScenery = new Set([
    ...water.map(cellKey),
    ...bridges.map(cellKey),
    ...ponds.map(cellKey),
    ...mountains.map(cellKey)
  ]);
  reservePickupArea(blockedForScenery, fixedItem);
  const rockCount = 5 + Math.floor(random() * 6);

  for (let index = 0; index < rockCount; index += 1) {
    const rock = findOpenCell(random, blockedForScenery, rocks);

    if (rock) {
      rocks.push(rock);
      blockedForScenery.add(cellKey(rock));
    }
  }

  const treeCount = 4 + Math.floor(random() * 6);

  for (let index = 0; index < treeCount; index += 1) {
    const tree = findOpenCell(random, blockedForScenery, trees);

    if (tree) {
      trees.push(tree);
      blockedForScenery.add(cellKey(tree));
    }
  }

  const enemyCount = screenX === startScreen.x && screenY === startScreen.y
    ? 1
    : 1 + Math.floor(random() * 5);
  const distanceFromStart = Math.min(screenX, worldColumns - screenX);
  const enemyChoices = distanceFromStart > 9
    ? ["fodder", "fodder", "raptor", "tank", "giant", "trex"]
    : distanceFromStart > 4
      ? ["fodder", "fodder", "raptor", "tank", "giant"]
      : ["fodder", "fodder", "raptor"];

  for (let index = 0; index < enemyCount; index += 1) {
    const enemy = pickFreeCell(random, blockedForScenery, enemies);

    if (enemy) {
      enemies.push({
        id: `enemy-${screenX}-${screenY}-${index}`,
        type: enemyChoices[Math.floor(random() * enemyChoices.length)],
        x: enemy.x,
        y: enemy.y,
        facing: ["up", "right", "down", "left"][Math.floor(random() * 4)]
      });
    }
  }

  const itemRoll = random();
  let item = fixedItem;

  if (!item && itemRoll < 0.3) {
    const hidden = ponds.length > 0 && random() < 0.6;
    const itemPosition = hidden
      ? ponds[Math.floor(random() * ponds.length)]
      : findOpenCell(random, blockedForScenery, enemies);

    if (itemPosition) {
      item = {
        id: `item-${screenX}-${screenY}`,
        type: itemRoll < 0.1 ? "bomb" : "treasure",
        count: 1 + Math.floor(random() * 3),
        x: itemPosition.x,
        y: itemPosition.y,
        hidden
      };
    }
  }

  return filterDestroyedTerrain({
    x: screenX,
    y: screenY,
    name,
    theme,
    water,
    bridges,
    ponds,
    rocks,
    trees,
    mountains,
    obstacles: [...rocks, ...trees, ...mountains],
    enemies,
    item
  });
}

function pickFreeCell(random, blockedCells, enemies) {
  for (let attempt = 0; attempt < 60; attempt += 1) {
    const candidate = {
      x: 1 + Math.floor(random() * (screenGrid.columns - 2)),
      y: 2 + Math.floor(random() * (screenGrid.rows - 4))
    };

    if (
      !isReservedCell(candidate) &&
      !blockedCells.has(cellKey(candidate)) &&
      !enemies.some((enemy) => isSameCell(enemy, candidate))
    ) {
      return candidate;
    }
  }

  return null;
}

const world = new Map();

for (let y = 0; y < worldRows; y += 1) {
  for (let x = 0; x < worldColumns; x += 1) {
    const screen = createScreen(x, y);
    world.set(keyFor(screen), screen);
  }
}

ensureHeroOnFreeCell();

function loadCollectedItems() {
  try {
    const saved = JSON.parse(localStorage.getItem(itemStorageKey) || "[]");
    const collected = new Set(Array.isArray(saved) ? saved : []);

    return collected;
  } catch {
    return new Set();
  }
}

function loadInventory() {
  try {
    const saved = JSON.parse(localStorage.getItem(inventoryStorageKey) || "{}");

    return {
      bombs: Number.isFinite(saved.bombs) ? saved.bombs : 0,
      treasures: Number.isFinite(saved.treasures) ? saved.treasures : 0
    };
  } catch {
    return { bombs: 0, treasures: 0 };
  }
}

function loadDestroyedTerrain() {
  try {
    const saved = JSON.parse(localStorage.getItem(terrainStorageKey) || "[]");

    return new Set(Array.isArray(saved) ? saved : []);
  } catch {
    return new Set();
  }
}

function saveInventory() {
  localStorage.setItem(inventoryStorageKey, JSON.stringify(inventory));
}

function saveCollectedItems() {
  localStorage.setItem(itemStorageKey, JSON.stringify([...collectedItems]));
}

function saveDestroyedTerrain() {
  localStorage.setItem(terrainStorageKey, JSON.stringify([...destroyedTerrain]));
}

function currentRoom() {
  return world.get(keyFor(currentScreen));
}

function createEnemies(screen) {
  const now = performance.now();

  return screen.enemies.map((enemy) => ({
    ...enemy,
    hp: enemyTypes[enemy.type].hp,
    maxHp: enemyTypes[enemy.type].hp,
    nextMoveAt: now + enemyTypes[enemy.type].moveDelay,
    nextAttackAt: now + enemyTypes[enemy.type].attackCooldown,
    attackStartedAt: null,
    dizzyUntil: 0
  }));
}

function enemiesForCurrentScreen() {
  return enemiesForScreen(currentRoom());
}

function enemiesForScreen(screen) {
  const screenKey = keyFor(screen);

  if (!enemiesByScreen.has(screenKey)) {
    enemiesByScreen.set(screenKey, createEnemies(screen));
  }

  return enemiesByScreen.get(screenKey);
}

function setEnemiesForCurrentScreen(enemies) {
  setEnemiesForScreen(currentRoom(), enemies);
}

function setEnemiesForScreen(screen, enemies) {
  enemiesByScreen.set(keyFor(screen), enemies);
}

function gridToPercent(position, max) {
  return `${((position + 0.5) / max) * 100}%`;
}

function gridToYPosition(position) {
  return `calc(${(position + 0.5) / screenGrid.rows} * (100% - var(--play-bottom)))`;
}

function isSameCell(a, b) {
  return a.x === b.x && a.y === b.y;
}

function directionBetween(from, to) {
  const deltaX = to.x - from.x;
  const deltaY = to.y - from.y;

  if (Math.abs(deltaX) > Math.abs(deltaY)) {
    return deltaX > 0 ? "right" : "left";
  }

  if (deltaY !== 0) {
    return deltaY > 0 ? "down" : "up";
  }

  return null;
}

function distanceBetween(a, b) {
  return Math.abs(a.x - b.x) + Math.abs(a.y - b.y);
}

function isAdjacent(a, b) {
  return distanceBetween(a, b) === 1;
}

function isBridgeCell(position) {
  return makeCellSet(currentRoom().bridges).has(cellKey(position));
}

function isWaterCell(position) {
  return makeCellSet(currentRoom().water).has(cellKey(position));
}

function isPondCell(position) {
  return makeCellSet(currentRoom().ponds).has(cellKey(position));
}

function isObstacleOnScreen(screen, position) {
  const obstacleCells = makeCellSet(screen.obstacles);
  const waterCells = makeCellSet(screen.water);
  const bridgeCells = makeCellSet(screen.bridges);

  return obstacleCells.has(cellKey(position)) || (waterCells.has(cellKey(position)) && !bridgeCells.has(cellKey(position)));
}

function isObstacleCell(position) {
  return isObstacleOnScreen(currentRoom(), position);
}

function enemyAt(position) {
  return enemiesForCurrentScreen().find((enemy) => isSameCell(enemy, position));
}

function isBlockedCell(position, ignoredEnemyId = null) {
  if (
    position.x < 0 ||
    position.x >= screenGrid.columns ||
    position.y < 0 ||
    position.y >= screenGrid.rows ||
    isObstacleCell(position)
  ) {
    return true;
  }

  return enemiesForCurrentScreen().some((enemy) =>
    enemy.id !== ignoredEnemyId && isSameCell(enemy, position)
  );
}

function status(message) {
  roomStatus = message;
}

function shiftTimedState(duration) {
  droppedBombs.forEach((bomb) => {
    if (!bomb.explodedAt) {
      bomb.explodesAt += duration;
    }
  });

  enemiesByScreen.forEach((enemies) => {
    enemies.forEach((enemy) => {
      enemy.nextMoveAt += duration;
      enemy.nextAttackAt += duration;

      if (enemy.attackStartedAt !== null) {
        enemy.attackStartedAt += duration;
      }

      if (enemy.dizzyUntil > 0) {
        enemy.dizzyUntil += duration;
      }
    });
  });
}

function setPaused(paused) {
  if (paused === isPaused) {
    return;
  }

  isPaused = paused;

  if (isPaused) {
    pausedAt = performance.now();
    status("Paused");
  } else {
    shiftTimedState(performance.now() - pausedAt);
    pausedAt = 0;
    status("Ready");
  }

  renderRoom();
}

function togglePause() {
  setPaused(!isPaused);
}

function setHeroFacing(deltaX, deltaY) {
  if (deltaX > 0) {
    heroFacing = "right";
  } else if (deltaX < 0) {
    heroFacing = "left";
  } else if (deltaY > 0) {
    heroFacing = "down";
  } else if (deltaY < 0) {
    heroFacing = "up";
  }
}

function wrapPosition(direction) {
  if (direction === "left") {
    return { x: screenGrid.columns - 1, y: heroPosition.y };
  }

  if (direction === "right") {
    return { x: 0, y: heroPosition.y };
  }

  if (direction === "up") {
    return { x: heroPosition.x, y: screenGrid.rows - 1 };
  }

  return { x: heroPosition.x, y: 0 };
}

function findEntryPosition(preferredPosition, direction) {
  if (!isBlockedCell(preferredPosition)) {
    return preferredPosition;
  }

  const candidates = [];

  if (direction === "left" || direction === "right") {
    for (let offset = 1; offset < screenGrid.rows; offset += 1) {
      candidates.push({ x: preferredPosition.x, y: preferredPosition.y - offset });
      candidates.push({ x: preferredPosition.x, y: preferredPosition.y + offset });
    }
  } else {
    for (let offset = 1; offset < screenGrid.columns; offset += 1) {
      candidates.push({ x: preferredPosition.x - offset, y: preferredPosition.y });
      candidates.push({ x: preferredPosition.x + offset, y: preferredPosition.y });
    }
  }

  return candidates.find((candidate) =>
    candidate.x >= 0 &&
    candidate.x < screenGrid.columns &&
    candidate.y >= 0 &&
    candidate.y < screenGrid.rows &&
    !isBlockedCell(candidate)
  );
}

function findFirstFreeCell() {
  const centerFirst = [startPosition];
  const cells = [];

  for (let y = 0; y < screenGrid.rows; y += 1) {
    for (let x = 0; x < screenGrid.columns; x += 1) {
      cells.push({ x, y });
    }
  }

  return [...centerFirst, ...cells].find((candidate) => !isBlockedCell(candidate));
}

function isGateOpen() {
  const gateScreen = world.get(`${gateScreenX},0`);

  if (!gateScreen) {
    return true;
  }

  for (let y = 0; y < screenGrid.rows; y += 1) {
    const tunnelIsOpen = [7, 8, 9].every((x) => !isObstacleOnScreen(gateScreen, { x, y }));

    if (tunnelIsOpen) {
      return true;
    }
  }

  return false;
}

function ensureHeroOnFreeCell() {
  if (isBlockedCell(heroPosition)) {
    heroPosition = findFirstFreeCell() || { x: 0, y: 0 };
  }
}

function moveToNextScreen(direction) {
  if (direction !== "left" && direction !== "right") {
    status("Edge");
    return;
  }

  if (currentScreen.x === 0 && direction === "left" && !isGateOpen()) {
    status("Forest gate");
    return;
  }

  const vector = directionVectors[direction];
  const nextScreen = {
    x: (currentScreen.x + vector.x + worldColumns) % worldColumns,
    y: 0
  };

  currentScreen = nextScreen;
  heroPosition = findEntryPosition(wrapPosition(direction), direction) || findFirstFreeCell() || startPosition;
  status(currentRoom().name);
}

function moveHero(deltaX, deltaY) {
  if (isPaused) {
    status("Paused");
    renderRoom();
    return;
  }

  const direction = directionBetween(heroPosition, {
    x: heroPosition.x + deltaX,
    y: heroPosition.y + deltaY
  });
  const nextPosition = {
    x: heroPosition.x + deltaX,
    y: heroPosition.y + deltaY
  };
  const targetEnemy = enemyAt(nextPosition);

  if (targetEnemy) {
    if (heroFacing !== direction) {
      setHeroFacing(deltaX, deltaY);
      status("Ready");
      renderRoom();
      return;
    }

    swingClub();
    return;
  }

  setHeroFacing(deltaX, deltaY);

  if (
    nextPosition.x < 0 ||
    nextPosition.x >= screenGrid.columns ||
    nextPosition.y < 0 ||
    nextPosition.y >= screenGrid.rows
  ) {
    moveToNextScreen(direction);
  } else if (isBlockedCell(nextPosition)) {
    status("Blocked");
  } else {
    heroPosition = nextPosition;
    status("Ready");
  }

  renderRoom();
}

function staggerHero(direction, steps) {
  const vector = directionVectors[direction];

  for (let step = 0; step < steps; step += 1) {
    const nextPosition = {
      x: heroPosition.x + vector.x,
      y: heroPosition.y + vector.y
    };

    if (isBlockedCell(nextPosition)) {
      break;
    }

    heroPosition = nextPosition;
  }
}

function animateClub() {
  hero.classList.remove("is-swinging");
  hero.classList.remove("swing-up", "swing-right", "swing-down", "swing-left");
  requestAnimationFrame(() => hero.classList.add("is-swinging"));
  hero.classList.add(`swing-${heroFacing}`);
  window.setTimeout(() => {
    hero.classList.remove("is-swinging");
    hero.classList.remove("swing-up", "swing-right", "swing-down", "swing-left");
  }, 420);
}

function swingClub() {
  if (isPaused) {
    status("Paused");
    renderRoom();
    return;
  }

  animateClub();

  const vector = directionVectors[heroFacing];
  const targetPosition = {
    x: heroPosition.x + vector.x,
    y: heroPosition.y + vector.y
  };
  const enemy = enemyAt(targetPosition);

  if (!enemy) {
    status("Swing");
    renderRoom();
    return;
  }

  const type = enemyTypes[enemy.type];
  const directionToHero = directionBetween(enemy, heroPosition);
  const hitFromFront = directionToHero === enemy.facing;
  const hitFromBack = directionToHero === oppositeDirections[enemy.facing];
  const damage = hitFromFront ? type.damageFront : type.damageOther;

  enemy.hp -= damage;
  enemy.dizzyUntil = performance.now() + (enemy.type === "giant" || enemy.type === "trex" ? 0 : 700);
  enemy.attackStartedAt = null;

  if (enemy.hp <= 0) {
    setEnemiesForCurrentScreen(enemiesForCurrentScreen().filter((candidate) => candidate.id !== enemy.id));
    status(`${type.name} vanished`);
  } else if (hitFromFront) {
    status(`${type.name} shielded`);
  } else if (hitFromBack) {
    status(`${type.name} bonked`);
  } else {
    status(`${type.name} dizzy`);
  }

  renderRoom();
}

function isInBombBlast(bomb, position) {
  return Math.abs(position.x - bomb.x) <= 1 && Math.abs(position.y - bomb.y) <= 1;
}

function bombAt(position) {
  return droppedBombs.find((bomb) =>
    bomb.screenKey === keyFor(currentScreen) &&
    !bomb.explodedAt &&
    isSameCell(bomb, position)
  );
}

function destroyBlastTerrain(screen, bomb) {
  let destroyedCount = 0;
  const keptTrees = [];

  screen.trees.forEach((cell) => {
    if (isInBombBlast(bomb, cell)) {
      destroyedTerrain.add(terrainKey(screen, "tree", cell));
      destroyedCount += 1;
      return;
    }

    keptTrees.push(cell);
  });

  screen.trees = keptTrees;

  if (destroyedCount > 0) {
    screen.obstacles = [...screen.rocks, ...screen.trees, ...screen.mountains];
    saveDestroyedTerrain();
  }

  return destroyedCount;
}

function damageBlastEnemies(screen, bomb) {
  const enemies = enemiesForScreen(screen);
  let removedCount = 0;
  const now = performance.now();
  const survivors = enemies.filter((enemy) => {
    if (!isInBombBlast(bomb, enemy)) {
      return true;
    }

    enemy.hp -= bombDamage;
    enemy.dizzyUntil = now + 900;
    enemy.attackStartedAt = null;

    if (enemy.hp <= 0) {
      removedCount += 1;
      return false;
    }

    return true;
  });

  setEnemiesForScreen(screen, survivors);

  return removedCount;
}

function explodeBomb(bomb) {
  const screen = world.get(bomb.screenKey);

  if (!screen) {
    bomb.explodedAt = performance.now();
    return;
  }

  const removedEnemies = damageBlastEnemies(screen, bomb);
  const destroyedTerrainCount = destroyBlastTerrain(screen, bomb);
  bomb.explodedAt = performance.now();
  bomb.removedEnemies = removedEnemies;
  bomb.destroyedTerrainCount = destroyedTerrainCount;

  if (bomb.screenKey === keyFor(currentScreen)) {
    if (destroyedTerrainCount > 0) {
      status("Trees pop");
    } else if (removedEnemies > 0) {
      status("Boom");
    } else {
      status("Sparkles");
    }
  }
}

function dropBomb() {
  if (isPaused) {
    status("Paused");
    renderRoom();
    return;
  }

  if (inventory.bombs <= 0) {
    status("No bombs");
    renderRoom();
    return;
  }

  if (bombAt(heroPosition)) {
    status("Bomb set");
    renderRoom();
    return;
  }

  inventory.bombs -= 1;
  saveInventory();
  bombSequence += 1;
  droppedBombs.push({
    id: `bomb-${Date.now()}-${bombSequence}`,
    screenKey: keyFor(currentScreen),
    x: heroPosition.x,
    y: heroPosition.y,
    placedAt: performance.now(),
    explodesAt: performance.now() + bombFuseMs,
    explodedAt: null
  });

  status("Bomb set");

  renderRoom();
}

function updateBombs() {
  const now = performance.now();

  droppedBombs.forEach((bomb) => {
    if (!bomb.explodedAt && now >= bomb.explodesAt) {
      explodeBomb(bomb);
    }
  });

  droppedBombs = droppedBombs.filter((bomb) => !bomb.explodedAt || now - bomb.explodedAt < bombExplosionMs);
}

function chooseEnemyStep(enemy) {
  const candidates = [];
  const horizontalFirst = Math.abs(heroPosition.x - enemy.x) >= Math.abs(heroPosition.y - enemy.y);

  if (horizontalFirst) {
    candidates.push(heroPosition.x > enemy.x ? "right" : "left");
    candidates.push(heroPosition.y > enemy.y ? "down" : "up");
  } else {
    candidates.push(heroPosition.y > enemy.y ? "down" : "up");
    candidates.push(heroPosition.x > enemy.x ? "right" : "left");
  }

  return candidates.filter((direction) => direction !== null).find((direction) => {
    const vector = directionVectors[direction];
    const nextPosition = { x: enemy.x + vector.x, y: enemy.y + vector.y };
    return !isSameCell(nextPosition, heroPosition) && !isBlockedCell(nextPosition, enemy.id);
  });
}

function updateEnemy(enemy, now) {
  const type = enemyTypes[enemy.type];

  if (now < enemy.dizzyUntil) {
    return;
  }

  const distance = distanceBetween(enemy, heroPosition);

  if (distance > type.aggroRange) {
    enemy.attackStartedAt = null;
    return;
  }

  if (isAdjacent(enemy, heroPosition)) {
    const directionToHero = directionBetween(enemy, heroPosition);

    if (enemy.facing !== directionToHero) {
      enemy.facing = directionToHero;
      enemy.attackStartedAt = null;
      enemy.nextAttackAt = Math.max(enemy.nextAttackAt, now + 300);
      return;
    }

    if (enemy.attackStartedAt === null && now >= enemy.nextAttackAt) {
      enemy.attackStartedAt = now;
      return;
    }

    if (enemy.attackStartedAt !== null && now - enemy.attackStartedAt >= type.attackWindup) {
      const stillAdjacent = isAdjacent(enemy, heroPosition);
      const stillFacingHero = enemy.facing === directionBetween(enemy, heroPosition);

      if (stillAdjacent && stillFacingHero) {
        const blockedByShield = heroFacing === oppositeDirections[enemy.facing];
        staggerHero(enemy.facing, blockedByShield ? type.staggerShield : type.staggerDamage);
        status(blockedByShield ? "Shield block" : "Bumped");
      }

      enemy.attackStartedAt = null;
      enemy.nextAttackAt = now + type.attackCooldown;
      return;
    }

    return;
  }

  enemy.attackStartedAt = null;

  if (!type.pursue || now < enemy.nextMoveAt) {
    return;
  }

  const stepDirection = chooseEnemyStep(enemy);

  if (stepDirection) {
    const vector = directionVectors[stepDirection];
    enemy.facing = stepDirection;
    enemy.x += vector.x;
    enemy.y += vector.y;
  }

  enemy.nextMoveAt = now + type.moveDelay;
}

function updateEnemies() {
  const now = performance.now();
  enemiesForCurrentScreen().forEach((enemy) => updateEnemy(enemy, now));
}

function gameTick() {
  if (isPaused) {
    return;
  }

  updateBombs();
  updateEnemies();
  renderRoom();
}

function renderTerrainCell(cell, className) {
  const element = document.createElement("div");
  element.className = className;
  element.style.gridColumnStart = String(cell.x + 1);
  element.style.gridRowStart = String(cell.y + 1);
  terrainLayer.append(element);
}

function renderTerrain() {
  const screen = currentRoom();
  terrainLayer.innerHTML = "";
  room.className = `room theme-${screen.theme}`;

  screen.water.forEach((cell) => renderTerrainCell(cell, "terrain-cell terrain-water"));
  screen.bridges.forEach((cell) => renderTerrainCell(cell, "terrain-cell terrain-bridge"));
  screen.ponds.forEach((cell) => renderTerrainCell(cell, "terrain-cell terrain-pond"));
  screen.mountains.forEach((cell) => renderTerrainCell(cell, "terrain-cell terrain-mountain"));
  screen.rocks.forEach((cell) => renderTerrainCell(cell, "terrain-cell terrain-rock"));
  screen.trees.forEach((cell) => renderTerrainCell(cell, "terrain-cell terrain-tree"));
}

function renderEnemies() {
  enemyLayer.innerHTML = "";
  const now = performance.now();

  enemiesForCurrentScreen().forEach((enemy) => {
    const type = enemyTypes[enemy.type];
    const enemyEl = document.createElement("div");
    enemyEl.className = [
      "enemy",
      type.className,
      `facing-${enemy.facing}`,
      enemy.attackStartedAt !== null ? "is-attacking" : "",
      now < enemy.dizzyUntil ? "is-dizzy" : ""
    ].filter(Boolean).join(" ");
    enemyEl.style.setProperty("--enemy-left", gridToPercent(enemy.x, screenGrid.columns));
    enemyEl.style.setProperty("--enemy-top", gridToYPosition(enemy.y));
    enemyEl.style.setProperty("--hp-ratio", String(enemy.hp / enemy.maxHp));
    enemyEl.setAttribute("aria-label", type.name);
    enemyEl.innerHTML = `
      <span class="enemy-shadow"></span>
      <span class="enemy-body">
        <span class="enemy-crest"></span>
        <span class="enemy-eye"></span>
        <span class="enemy-smile"></span>
      </span>
      <span class="enemy-hp"></span>
    `;
    enemyLayer.append(enemyEl);
  });
}

function renderBombs() {
  bombLayer.innerHTML = "";
  const now = performance.now();
  const visibleBombs = droppedBombs.filter((bomb) => bomb.screenKey === keyFor(currentScreen));

  visibleBombs.forEach((bomb) => {
    if (bomb.explodedAt) {
      for (let offsetY = -1; offsetY <= 1; offsetY += 1) {
        for (let offsetX = -1; offsetX <= 1; offsetX += 1) {
          const blastX = bomb.x + offsetX;
          const blastY = bomb.y + offsetY;

          if (blastX < 0 || blastX >= screenGrid.columns || blastY < 0 || blastY >= screenGrid.rows) {
            continue;
          }

          const blast = document.createElement("div");
          blast.className = "blast-cell";
          blast.style.setProperty("--bomb-left", gridToPercent(blastX, screenGrid.columns));
          blast.style.setProperty("--bomb-top", gridToYPosition(blastY));
          bombLayer.append(blast);
        }
      }

      return;
    }

    const secondsLeft = Math.max(1, Math.ceil((bomb.explodesAt - now) / 1000));
    const bombEl = document.createElement("div");
    bombEl.className = "dropped-bomb";
    bombEl.style.setProperty("--bomb-left", gridToPercent(bomb.x, screenGrid.columns));
    bombEl.style.setProperty("--bomb-top", gridToYPosition(bomb.y));
    bombEl.innerHTML = `
      <span class="bomb-fuse"></span>
      <span class="bomb-face"></span>
      <span class="bomb-timer">${secondsLeft}</span>
    `;
    bombLayer.append(bombEl);
  });
}

function renderItem() {
  const item = currentRoom().item;
  const hasItem = item && !collectedItems.has(item.id);
  const visibleItem = hasItem && !item.hidden;

  itemButton.hidden = !visibleItem;
  itemButton.classList.toggle("item-bomb", Boolean(item && item.type === "bomb"));
  itemButton.classList.toggle("item-treasure", Boolean(item && item.type === "treasure"));
  itemButton.setAttribute("aria-label", item && item.type === "bomb" ? "Bomb pickup" : "Treasure pickup");

  if (!hasItem) {
    return;
  }

  room.style.setProperty("--item-left", gridToPercent(item.x, screenGrid.columns));
  room.style.setProperty("--item-top", gridToYPosition(item.y));

  if (heroPosition.x === item.x && heroPosition.y === item.y) {
    collectedItems.add(item.id);
    if (item.type === "bomb") {
      inventory.bombs += item.count;
      status(item.hidden || isPondCell(heroPosition) ? "Found bombs" : "Bombs");
    } else {
      inventory.treasures += 1;
      status(item.hidden || isPondCell(heroPosition) ? "Found" : "Treasure");
    }
    saveCollectedItems();
    saveInventory();
    itemButton.hidden = true;
  }
}

function renderRoom() {
  renderTerrain();
  room.style.setProperty("--hero-left", gridToPercent(heroPosition.x, screenGrid.columns));
  room.style.setProperty("--hero-top", gridToYPosition(heroPosition.y));
  hero.classList.remove("facing-up", "facing-right", "facing-down", "facing-left");
  hero.classList.add(`facing-${heroFacing}`);
  renderItem();
  bombCountEl.textContent = String(inventory.bombs);
  findCountEl.textContent = String(inventory.treasures);
  statusText.textContent = roomStatus;
  pauseButton.textContent = isPaused ? "Play" : "Pause";
  pauseButton.setAttribute("aria-label", isPaused ? "Resume game" : "Pause game");
  renderBombs();
  renderEnemies();
}

function edgeMoveFromPointer(clientX, clientY, roomBounds) {
  const edgePaddingX = Math.max(18, roomBounds.width * 0.08);

  if (heroPosition.x === 0 && clientX <= roomBounds.left + edgePaddingX) {
    return { x: -1, y: 0 };
  }

  if (heroPosition.x === screenGrid.columns - 1 && clientX >= roomBounds.right - edgePaddingX) {
    return { x: 1, y: 0 };
  }

  return null;
}

function moveFromPointer(clientX, clientY) {
  const roomBounds = room.getBoundingClientRect();
  const edgeMove = edgeMoveFromPointer(clientX, clientY, roomBounds);

  if (edgeMove) {
    moveHero(edgeMove.x, edgeMove.y);
    return;
  }

  const heroBounds = hero.getBoundingClientRect();
  const heroCenterX = heroBounds.left + heroBounds.width / 2;
  const heroCenterY = heroBounds.top + heroBounds.height / 2;
  const distanceX = clientX - heroCenterX;
  const distanceY = clientY - heroCenterY;
  const tappedHero =
    clientX >= heroBounds.left &&
    clientX <= heroBounds.right &&
    clientY >= heroBounds.top &&
    clientY <= heroBounds.bottom;

  if (tappedHero && heroPosition.x === 0) {
    moveHero(-1, 0);
    return;
  }

  if (tappedHero && heroPosition.x === screenGrid.columns - 1) {
    moveHero(1, 0);
    return;
  }

  if (Math.abs(distanceX) > Math.abs(distanceY)) {
    moveHero(Math.sign(distanceX), 0);
    return;
  }

  moveHero(0, Math.sign(distanceY));
}

let lastTouchEndAt = 0;

["gesturestart", "gesturechange", "gestureend"].forEach((eventName) => {
  window.addEventListener(
    eventName,
    (event) => {
      event.preventDefault();
    },
    { passive: false }
  );
});

document.addEventListener(
  "touchmove",
  (event) => {
    if (event.touches.length > 1) {
      event.preventDefault();
    }
  },
  { passive: false }
);

document.addEventListener(
  "touchend",
  (event) => {
    if (event.target.closest("button")) {
      return;
    }

    const now = Date.now();

    if (now - lastTouchEndAt < 450) {
      event.preventDefault();
    }

    lastTouchEndAt = now;
  },
  { passive: false }
);

room.addEventListener("pointerdown", (event) => {
  if (event.target.closest("button")) {
    return;
  }

  event.preventDefault();
  moveFromPointer(event.clientX, event.clientY);
});

window.addEventListener("keydown", (event) => {
  const moves = {
    ArrowUp: { x: 0, y: -1 },
    ArrowRight: { x: 1, y: 0 },
    ArrowDown: { x: 0, y: 1 },
    ArrowLeft: { x: -1, y: 0 },
    w: { x: 0, y: -1 },
    d: { x: 1, y: 0 },
    s: { x: 0, y: 1 },
    a: { x: -1, y: 0 }
  };
  const move = moves[event.key];

  if (!move) {
    return;
  }

  event.preventDefault();
  moveHero(move.x, move.y);
});

bombButton.addEventListener("click", dropBomb);
pauseButton.addEventListener("click", togglePause);

resetButton.addEventListener("click", () => {
  enemiesByScreen = new Map();
  inventory = { bombs: 0, treasures: 0 };
  collectedItems = new Set();
  destroyedTerrain = new Set();
  droppedBombs = [];
  bombSequence = 0;
  isPaused = false;
  pausedAt = 0;
  localStorage.removeItem(itemStorageKey);
  localStorage.removeItem(inventoryStorageKey);
  localStorage.removeItem(oldItemStorageKey);
  localStorage.removeItem(terrainStorageKey);
  for (let y = 0; y < worldRows; y += 1) {
    for (let x = 0; x < worldColumns; x += 1) {
      const screen = createScreen(x, y);
      world.set(keyFor(screen), screen);
    }
  }
  currentScreen = { ...initialScreen };
  heroPosition = { ...startPosition };
  ensureHeroOnFreeCell();
  heroFacing = "down";
  status(initialStatus);
  renderRoom();
});

renderRoom();
window.setInterval(gameTick, 250);

async function clearAppShellCache() {
  if ("serviceWorker" in navigator) {
    const registrations = await navigator.serviceWorker.getRegistrations();
    await Promise.all(registrations.map((registration) => registration.unregister()));
  }

  if ("caches" in window) {
    const keys = await caches.keys();
    await Promise.all(keys.map((key) => caches.delete(key)));
  }
}

async function refreshIfNewBuildIsLive() {
  try {
    const response = await fetch(`./version.json?check=${Date.now()}`, {
      cache: "no-store"
    });

    if (!response.ok) {
      return false;
    }

    const latest = await response.json();

    if (!latest || latest.build === buildVersion) {
      return false;
    }

    const reloadKey = `dino-reloading-${latest.build}`;

    if (sessionStorage.getItem(reloadKey)) {
      return false;
    }

    sessionStorage.setItem(reloadKey, "1");
    status("Updating");
    renderRoom();
    await clearAppShellCache();
    window.location.replace(`./index.html?fresh=${Date.now()}`);
    return true;
  } catch {
    return false;
  }
}

if ("serviceWorker" in navigator) {
  window.addEventListener("load", async () => {
    let reloadingForUpdate = false;

    navigator.serviceWorker.addEventListener("controllerchange", () => {
      if (reloadingForUpdate) {
        return;
      }

      reloadingForUpdate = true;
      window.location.reload();
    });

    try {
      if (await refreshIfNewBuildIsLive()) {
        return;
      }

      const registration = await navigator.serviceWorker.register("./sw.js?v=world18", {
        updateViaCache: "none"
      });

      if (registration.waiting) {
        registration.waiting.postMessage({ type: "SKIP_WAITING" });
      }

      registration.addEventListener("updatefound", () => {
        const worker = registration.installing;

        if (!worker) {
          return;
        }

        worker.addEventListener("statechange", () => {
          if (worker.state === "installed" && navigator.serviceWorker.controller) {
            worker.postMessage({ type: "SKIP_WAITING" });
          }
        });
      });

      registration.update();
    } catch {
      status("Ready");
    }
  });
}
