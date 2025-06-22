const card = document.getElementById("card");
const selector = document.getElementById("phase-selector");
const timerToggle = document.getElementById("timer-toggle");
const timerDisplay = document.getElementById("timer-display");

let currentPhase = "phase1";
let viewedCards = { phase1: [], phase2: [], phase3: [] };
let cardList = [];
let timerInterval;
let countdown = 5 * 60;

const TOTAL_CARDS = {
  phase1: 65,
  phase2: 65,
  phase3: 65
};

function shuffle(arr) {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

function getCardList(phase) {
  if (phase === "final") return ["assets/base-game/final.png"];
  const cards = Array.from({ length: TOTAL_CARDS[phase] }, (_, i) =>
    `assets/base-game/${phase}/card${i + 1}.png`
  );
  return shuffle(cards.filter(c => !viewedCards[phase].includes(c)));
}

function showNextCard() {
  if (currentPhase === "final") {
    card.src = "assets/base-game/final.png";
    return;
  }

  if (cardList.length === 0) {
    card.src = "";
    alert("All cards viewed in this phase.");
    return;
  }

  const next = cardList.shift();
  viewedCards[currentPhase].push(next);
  card.src = next;
}

function changePhase(phase) {
  currentPhase = phase;
  if (!viewedCards[phase]) viewedCards[phase] = [];
  cardList = getCardList(phase);
  showNextCard();
}

function updateTimerDisplay() {
  const minutes = Math.floor(countdown / 60);
  const seconds = countdown % 60;
  timerDisplay.textContent = `${minutes}:${seconds.toString().padStart(2, "0")}`;
}

timerToggle.addEventListener("click", () => {
  if (timerInterval) {
    clearInterval(timerInterval);
    timerInterval = null;
    timerDisplay.textContent = "";
  } else {
    countdown = 5 * 60;
    updateTimerDisplay();
    timerInterval = setInterval(() => {
      countdown--;
      if (countdown <= 0) {
        clearInterval(timerInterval);
        timerInterval = null;
        timerDisplay.textContent = "✔";
        setTimeout(() => {
          timerDisplay.textContent = "";
        }, 3000);
      } else {
        updateTimerDisplay();
      }
    }, 1000);
  }
});

selector.addEventListener("change", (e) => {
  changePhase(e.target.value);
});

card.addEventListener("click", showNextCard);
card.addEventListener("touchend", showNextCard);

changePhase("phase1");
