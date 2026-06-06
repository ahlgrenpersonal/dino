const berryCountEl = document.querySelector("#berryCount");
const itemButton = document.querySelector("#itemButton");
const resetButton = document.querySelector("#resetButton");
const statusText = document.querySelector("#statusText");

const itemStorageKey = "dino-boom-berries-collected";

let itemCollected = localStorage.getItem(itemStorageKey) === "true";

function renderRoom() {
  berryCountEl.textContent = itemCollected ? "1" : "0";
  statusText.textContent = itemCollected ? "Found" : "Ready";
  itemButton.classList.toggle("is-collected", itemCollected);
  itemButton.disabled = itemCollected;
  localStorage.setItem(itemStorageKey, String(itemCollected));
}

itemButton.addEventListener("click", () => {
  itemCollected = true;
  renderRoom();
});

resetButton.addEventListener("click", () => {
  itemCollected = false;
  renderRoom();
});

renderRoom();

if ("serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    navigator.serviceWorker.register("./sw.js");
  });
}
