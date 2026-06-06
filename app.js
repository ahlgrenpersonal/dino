const berryCountEl = document.querySelector("#berryCount");
const itemButton = document.querySelector("#itemButton");
const room = document.querySelector("#room");
const hero = document.querySelector(".hero");
const resetButton = document.querySelector("#resetButton");
const statusText = document.querySelector("#statusText");

const itemStorageKey = "dino-boom-berries-collected";
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
  enemies: []
};

let itemCollected = localStorage.getItem(itemStorageKey) === "true";
let heroPosition = { ...roomGrid.start };
let heroFacing = "down";
let roomStatus = "Ready";

function gridToPercent(position, max) {
  return `${((position + 0.5) / max) * 100}%`;
}

function moveHero(deltaX, deltaY) {
  if (deltaX > 0) {
    heroFacing = "right";
  } else if (deltaX < 0) {
    heroFacing = "left";
  } else if (deltaY > 0) {
    heroFacing = "down";
  } else if (deltaY < 0) {
    heroFacing = "up";
  }

  const nextPosition = {
    x: Math.max(0, Math.min(roomGrid.columns - 1, heroPosition.x + deltaX)),
    y: Math.max(0, Math.min(roomGrid.rows - 1, heroPosition.y + deltaY))
  };

  const isOccupiedCell = [...roomGrid.obstacles, ...roomGrid.enemies].some((cell) =>
    cell.x === nextPosition.x && cell.y === nextPosition.y
  );

  if (isOccupiedCell) {
    roomStatus = "Blocked";
  } else {
    heroPosition = nextPosition;
    roomStatus = "Ready";
  }

  renderRoom();
}

function renderRoom() {
  room.style.setProperty("--hero-left", gridToPercent(heroPosition.x, roomGrid.columns));
  room.style.setProperty("--hero-top", gridToPercent(heroPosition.y, roomGrid.rows));
  room.style.setProperty("--item-left", gridToPercent(roomGrid.item.x, roomGrid.columns));
  room.style.setProperty("--item-top", gridToPercent(roomGrid.item.y, roomGrid.rows));
  hero.className = `hero facing-${heroFacing}`;

  if (heroPosition.x === roomGrid.item.x && heroPosition.y === roomGrid.item.y) {
    itemCollected = true;
    roomStatus = "Found";
  }

  berryCountEl.textContent = itemCollected ? "1" : "0";
  statusText.textContent = itemCollected ? "Found" : roomStatus;
  itemButton.classList.toggle("is-collected", itemCollected);
  localStorage.setItem(itemStorageKey, String(itemCollected));
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

resetButton.addEventListener("click", () => {
  itemCollected = false;
  heroPosition = { ...roomGrid.start };
  heroFacing = "down";
  roomStatus = "Ready";
  renderRoom();
});

renderRoom();

if ("serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    navigator.serviceWorker.register("./sw.js");
  });
}
