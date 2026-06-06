const scoreEl = document.querySelector("#score");
const dinoButton = document.querySelector(".dino-button");
const resetButton = document.querySelector("#resetButton");

const scoreStorageKey = "dino-score";

let score = Number(localStorage.getItem(scoreStorageKey) || 0);
let hopTimer;

function renderScore() {
  scoreEl.textContent = String(score);
  localStorage.setItem(scoreStorageKey, String(score));
}

function hop() {
  score += 1;
  renderScore();

  dinoButton.classList.remove("is-hopping");
  window.clearTimeout(hopTimer);
  requestAnimationFrame(() => {
    dinoButton.classList.add("is-hopping");
    hopTimer = window.setTimeout(() => {
      dinoButton.classList.remove("is-hopping");
    }, 180);
  });
}

dinoButton.addEventListener("click", hop);

resetButton.addEventListener("click", () => {
  score = 0;
  renderScore();
});

renderScore();

if ("serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    navigator.serviceWorker.register("./sw.js");
  });
}
