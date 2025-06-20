
const card = document.getElementById("card");
const selector = document.getElementById("phase-selector");
const timerToggle = document.getElementById("timer-toggle");

let currentPhase = "phase1";
let viewedCards = { phase1: [], phase2: [], phase3: [] };
let cardIndex = 0;
let timer;

const TOTAL_CARDS = {
  phase1: 99,
  phase2: 99,
  phase3: 100
};

function shuffle(arr) {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

function getCardList(phase) {
  if (phase === "final") return ["assets/base-game/final.jpg"];
  const cards = Array.from({ length: TOTAL_CARDS[phase] }, (_, i) =>
    `assets/base-game/${phase}/card${i + 1}.jpg`
  );
  return shuffle(cards.filter(c => !viewedCards[phase].includes(c)));
}

let cardList = getCardList(currentPhase);

function showNextCard() {
  if (currentPhase === "final") {
    card.src = "assets/base-game/final.jpg";
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

selector.addEventListener("change", (e) => {
  changePhase(e.target.value);
});

card.addEventListener("click", showNextCard);
card.addEventListener("touchend", showNextCard);

timerToggle.addEventListener("click", () => {
  if (timer) {
    clearInterval(timer);
    timer = null;
    timerToggle.textContent = "⏱";
  } else {
    timer = setInterval(showNextCard, 5 * 60 * 1000);
    timerToggle.textContent = "🕒";
  }
});

changePhase("phase1");
