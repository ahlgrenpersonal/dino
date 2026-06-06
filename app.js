const berryCountEl = document.querySelector("#berryCount");
const enemyLayer = document.querySelector("#enemyLayer");
const itemButton = document.querySelector("#itemButton");
const room = document.querySelector("#room");
const hero = document.querySelector(".hero");
const attackButton = document.querySelector("#attackButton");
const resetButton = document.querySelector("#resetButton");
const statusText = document.querySelector("#statusText");

const itemStorageKey = "dino-boom-berries-collected";
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
const roomGrid = {
  columns: 10,
  rows: 21,
  start: { x: 4, y: 10 },
  item: { x: 6, y: 8 },
  obstacles: [
    { x: 1, y: 2 },
    { x: 2, y: 2 },
    { x: 8, y: 3 },
    { x: 2, y: 17 },
    { x: 1, y: 17 },
    { x: 2, y: 18 },
    { x: 3, y: 17 },
    { x: 3, y: 18 }
  ],
  enemies: [
    { id: "enemy-fodder-1", type: "fodder", x: 4, y: 7, facing: "down" },
    { id: "enemy-raptor-1", type: "raptor", x: 8, y: 6, facing: "left" },
    { id: "enemy-tank-1", type: "tank", x: 7, y: 14, facing: "up" },
    { id: "enemy-giant-1", type: "giant", x: 7, y: 18, facing: "left" },
    { id: "enemy-trex-1", type: "trex", x: 1, y: 13, facing: "right" }
  ]
};

let enemies = [];
let itemCollected = localStorage.getItem(itemStorageKey) === "true";
let heroPosition = { ...roomGrid.start };
let heroFacing = "down";
let roomStatus = "Ready";

function createEnemies() {
  const now = performance.now();
  return roomGrid.enemies.map((enemy) => ({
    ...enemy,
    hp: enemyTypes[enemy.type].hp,
    maxHp: enemyTypes[enemy.type].hp,
    nextMoveAt: now + enemyTypes[enemy.type].moveDelay,
    nextAttackAt: now + enemyTypes[enemy.type].attackCooldown,
    attackStartedAt: null,
    dizzyUntil: 0
  }));
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

function isObstacleCell(position) {
  return roomGrid.obstacles.some((cell) => isSameCell(cell, position));
}

function enemyAt(position) {
  return enemies.find((enemy) => isSameCell(enemy, position));
}

function isBlockedCell(position, ignoredEnemyId = null) {
  if (
    position.x < 0 ||
    position.x >= roomGrid.columns ||
    position.y < 0 ||
    position.y >= roomGrid.rows ||
    isObstacleCell(position)
  ) {
    return true;
  }

  return enemies.some((enemy) =>
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

function moveHero(deltaX, deltaY) {
  setHeroFacing(deltaX, deltaY);

  const nextPosition = {
    x: Math.max(0, Math.min(roomGrid.columns - 1, heroPosition.x + deltaX)),
    y: Math.max(0, Math.min(roomGrid.rows - 1, heroPosition.y + deltaY))
  };

  if (isBlockedCell(nextPosition)) {
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
      x: Math.max(0, Math.min(roomGrid.columns - 1, heroPosition.x + vector.x)),
      y: Math.max(0, Math.min(roomGrid.rows - 1, heroPosition.y + vector.y))
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
    enemies = enemies.filter((candidate) => candidate.id !== enemy.id);
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
  enemies.forEach((enemy) => updateEnemy(enemy, now));
  renderRoom();
}

function renderEnemies() {
  enemyLayer.innerHTML = "";
  const now = performance.now();

  enemies.forEach((enemy) => {
    const type = enemyTypes[enemy.type];
    const enemyEl = document.createElement("div");
    enemyEl.className = [
      "enemy",
      type.className,
      `facing-${enemy.facing}`,
      enemy.attackStartedAt !== null ? "is-attacking" : "",
      now < enemy.dizzyUntil ? "is-dizzy" : ""
    ].filter(Boolean).join(" ");
    enemyEl.style.setProperty("--enemy-left", gridToPercent(enemy.x, roomGrid.columns));
    enemyEl.style.setProperty("--enemy-top", gridToPercent(enemy.y, roomGrid.rows));
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

function renderRoom() {
  room.style.setProperty("--hero-left", gridToPercent(heroPosition.x, roomGrid.columns));
  room.style.setProperty("--hero-top", gridToPercent(heroPosition.y, roomGrid.rows));
  room.style.setProperty("--item-left", gridToPercent(roomGrid.item.x, roomGrid.columns));
  room.style.setProperty("--item-top", gridToPercent(roomGrid.item.y, roomGrid.rows));
  hero.className = `hero facing-${heroFacing}`;

  if (heroPosition.x === roomGrid.item.x && heroPosition.y === roomGrid.item.y) {
    itemCollected = true;
    status("Found");
  }

  berryCountEl.textContent = itemCollected ? "1" : "0";
  statusText.textContent = roomStatus;
  itemButton.classList.toggle("is-collected", itemCollected);
  localStorage.setItem(itemStorageKey, String(itemCollected));
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
  enemies = createEnemies();
  itemCollected = false;
  heroPosition = { ...roomGrid.start };
  heroFacing = "down";
  status("Ready");
  renderRoom();
});

enemies = createEnemies();
renderRoom();
window.setInterval(updateEnemies, 250);

if ("serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    navigator.serviceWorker.register("./sw.js");
  });
}
