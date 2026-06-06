const berryCountEl = document.querySelector("#berryCount");
const enemyLayer = document.querySelector("#enemyLayer");
const itemButton = document.querySelector("#itemButton");
const room = document.querySelector("#room");
const terrainLayer = document.querySelector("#terrainLayer");
const hero = document.querySelector(".hero");
const attackButton = document.querySelector("#attackButton");
const resetButton = document.querySelector("#resetButton");
const statusText = document.querySelector("#statusText");

const itemStorageKey = "dino-collected-items";
const oldItemStorageKey = "dino-boom-berries-collected";
const worldColumns = 5;
const worldRows = 20;
const screenGrid = {
  columns: 10,
  rows: 21
};
const startScreen = { x: 2, y: 10 };
const startPosition = { x: 4, y: 10 };
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

let currentScreen = { ...startScreen };
let enemiesByScreen = new Map();
let collectedItems = loadCollectedItems();
let heroPosition = { ...startPosition };
let heroFacing = "down";
let roomStatus = "Ready";

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
    currentScreen = { x: previewX, y: previewY };
    roomStatus = "Preview";
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

function isReservedCell(position) {
  return (
    (Math.abs(position.x - startPosition.x) <= 1 && Math.abs(position.y - startPosition.y) <= 1) ||
    position.x === 0 ||
    position.x === screenGrid.columns - 1 ||
    position.y === 0 ||
    position.y === screenGrid.rows - 1
  );
}

function createScreen(screenX, screenY) {
  const seed = 1009 + screenX * 9176 + screenY * 1319;
  const random = createRandom(seed);
  const water = [];
  const bridges = [];
  const rocks = [];
  const trees = [];
  const enemies = [];
  const theme = screenY < 5 ? "highland" : screenY > 14 ? "lowland" : "meadow";
  const name = screenX === startScreen.x && screenY === startScreen.y ? "Sunny path" : "Wild path";

  if (screenX === 1 || (screenX === 3 && screenY > 8)) {
    for (let y = 0; y < screenGrid.rows; y += 1) {
      addCell(water, 4, y);
      addCell(water, 5, y);
    }

    const bridgeY = screenY % 4 === 1 ? 4 : 10 + ((screenY + screenX) % 3) - 1;
    for (let x = 4; x <= 5; x += 1) {
      addCell(bridges, x, bridgeY);
      addCell(bridges, x, bridgeY + 1);
    }
  }

  if (screenY === 5 || screenY === 13) {
    for (let x = 0; x < screenGrid.columns; x += 1) {
      addCell(water, x, 9);
      addCell(water, x, 10);
    }

    const bridgeX = screenX === 0 ? 7 : 4 + (screenX % 2);
    for (let y = 9; y <= 10; y += 1) {
      addCell(bridges, bridgeX, y);
      addCell(bridges, bridgeX + 1, y);
    }
  }

  const blockedForScenery = new Set([...water.map(cellKey), ...bridges.map(cellKey)]);
  const rockCount = 4 + Math.floor(random() * 5);

  for (let index = 0; index < rockCount; index += 1) {
    const rock = {
      x: 1 + Math.floor(random() * (screenGrid.columns - 2)),
      y: 2 + Math.floor(random() * (screenGrid.rows - 4))
    };

    if (!blockedForScenery.has(cellKey(rock)) && !isReservedCell(rock)) {
      rocks.push(rock);
      blockedForScenery.add(cellKey(rock));
    }
  }

  const treeCount = 3 + Math.floor(random() * 4);

  for (let index = 0; index < treeCount; index += 1) {
    const tree = {
      x: 1 + Math.floor(random() * (screenGrid.columns - 2)),
      y: 1 + Math.floor(random() * (screenGrid.rows - 3))
    };

    if (!blockedForScenery.has(cellKey(tree)) && !isReservedCell(tree)) {
      trees.push(tree);
      blockedForScenery.add(cellKey(tree));
    }
  }

  const enemyCount = screenX === startScreen.x && screenY === startScreen.y ? 1 : Math.floor(random() * 4);
  const distanceFromStart = Math.abs(screenX - startScreen.x) + Math.abs(screenY - startScreen.y);
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

  return {
    x: screenX,
    y: screenY,
    name,
    theme,
    water,
    bridges,
    rocks,
    trees,
    obstacles: [...rocks, ...trees],
    enemies,
    item: screenX === startScreen.x && screenY === startScreen.y ? { id: "start-berries", x: 6, y: 8 } : null
  };
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

function loadCollectedItems() {
  try {
    const saved = JSON.parse(localStorage.getItem(itemStorageKey) || "[]");
    const collected = new Set(Array.isArray(saved) ? saved : []);

    if (localStorage.getItem(oldItemStorageKey) === "true") {
      collected.add("start-berries");
    }

    return collected;
  } catch {
    return new Set();
  }
}

function saveCollectedItems() {
  localStorage.setItem(itemStorageKey, JSON.stringify([...collectedItems]));
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
  const screenKey = keyFor(currentScreen);

  if (!enemiesByScreen.has(screenKey)) {
    enemiesByScreen.set(screenKey, createEnemies(currentRoom()));
  }

  return enemiesByScreen.get(screenKey);
}

function setEnemiesForCurrentScreen(enemies) {
  enemiesByScreen.set(keyFor(currentScreen), enemies);
}

function gridToPercent(position, max) {
  return `${((position + 0.5) / max) * 100}%`;
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

function isObstacleCell(position) {
  const screen = currentRoom();
  const obstacleCells = makeCellSet(screen.obstacles);

  return obstacleCells.has(cellKey(position)) || (isWaterCell(position) && !isBridgeCell(position));
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

function moveToNextScreen(direction) {
  const vector = directionVectors[direction];
  const nextScreen = {
    x: currentScreen.x + vector.x,
    y: currentScreen.y + vector.y
  };

  if (
    nextScreen.x < 0 ||
    nextScreen.x >= worldColumns ||
    nextScreen.y < 0 ||
    nextScreen.y >= worldRows
  ) {
    status("Edge");
    return;
  }

  currentScreen = nextScreen;
  heroPosition = findEntryPosition(wrapPosition(direction), direction) || startPosition;
  status(currentRoom().name);
}

function moveHero(deltaX, deltaY) {
  setHeroFacing(deltaX, deltaY);

  const direction = directionBetween(heroPosition, {
    x: heroPosition.x + deltaX,
    y: heroPosition.y + deltaY
  });
  const nextPosition = {
    x: heroPosition.x + deltaX,
    y: heroPosition.y + deltaY
  };

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

function swingClub() {
  hero.classList.remove("is-swinging");
  requestAnimationFrame(() => hero.classList.add("is-swinging"));
  window.setTimeout(() => hero.classList.remove("is-swinging"), 180);

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
    enemyEl.style.setProperty("--enemy-top", gridToPercent(enemy.y, screenGrid.rows));
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

function renderItem() {
  const item = currentRoom().item;
  const hasItem = item && !collectedItems.has(item.id);

  itemButton.hidden = !hasItem;

  if (!hasItem) {
    return;
  }

  room.style.setProperty("--item-left", gridToPercent(item.x, screenGrid.columns));
  room.style.setProperty("--item-top", gridToPercent(item.y, screenGrid.rows));

  if (heroPosition.x === item.x && heroPosition.y === item.y) {
    collectedItems.add(item.id);
    saveCollectedItems();
    status("Found");
    itemButton.hidden = true;
  }
}

function renderRoom() {
  renderTerrain();
  room.style.setProperty("--hero-left", gridToPercent(heroPosition.x, screenGrid.columns));
  room.style.setProperty("--hero-top", gridToPercent(heroPosition.y, screenGrid.rows));
  hero.className = `hero facing-${heroFacing}`;
  renderItem();
  berryCountEl.textContent = String(collectedItems.size);
  statusText.textContent = roomStatus;
  renderEnemies();
}

room.addEventListener("pointerdown", (event) => {
  if (event.target.closest("button")) {
    return;
  }

  const heroBounds = hero.getBoundingClientRect();
  const heroCenterX = heroBounds.left + heroBounds.width / 2;
  const heroCenterY = heroBounds.top + heroBounds.height / 2;
  const distanceX = event.clientX - heroCenterX;
  const distanceY = event.clientY - heroCenterY;

  if (Math.abs(distanceX) > Math.abs(distanceY)) {
    moveHero(Math.sign(distanceX), 0);
    return;
  }

  moveHero(0, Math.sign(distanceY));
});

attackButton.addEventListener("click", swingClub);

resetButton.addEventListener("click", () => {
  enemiesByScreen = new Map();
  collectedItems = new Set();
  localStorage.removeItem(itemStorageKey);
  localStorage.removeItem(oldItemStorageKey);
  currentScreen = { ...startScreen };
  heroPosition = { ...startPosition };
  heroFacing = "down";
  status("Ready");
  renderRoom();
});

renderRoom();
window.setInterval(updateEnemies, 250);

if ("serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    navigator.serviceWorker.register("./sw.js");
  });
}
