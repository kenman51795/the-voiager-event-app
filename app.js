const card = document.getElementById("card");
const selector = document.getElementById("phase-selector");
const timerToggle = document.getElementById("timer-toggle");
const timerDisplay = document.getElementById("timer-display");
const cardCounter = document.getElementById("card-counter");
const resetBtn = document.getElementById("reset-button");
const shuffleBtn = document.getElementById("shuffle-button");
const backBtn = document.getElementById("back-button");
const prevCardButton = document.getElementById("prev-card");

const urlParams = new URLSearchParams(window.location.search);
const deck = urlParams.get("deck") || "the-voiager";

const uiColorMap = {
  "the-voiager":    "#3b5549",
  "departure":      "#444444",
  "eternal-flame":  "#8b2e1d",
  "curious-hearts": "#aa6c9c",
  "inner-circle":   "#3c5d87",
  "family-ties":    "#c77e2a",
  "family-legacy":  "#a46b38",
  "solitaire":      "#5c3d6b"
};

const deckConfig = {
  "the-voiager":     { phases: ["Discovery", "Affinity", "Validity", "Final"], cardCounts: [65, 65, 65, 1] },
  "curious-hearts":  { phases: ["Main", "Final"], cardCounts: [52, 1] },
  "departure":       { phases: ["Main", "Final"], cardCounts: [52, 1] },
  "eternal-flame":   { phases: ["Main", "Final"], cardCounts: [52, 1] },
  "family-legacy":   { phases: ["Main", "Final"], cardCounts: [52, 1] },
  "family-ties":     { phases: ["Main", "Final"], cardCounts: [52, 1] },
  "inner-circle":    { phases: ["Main", "Final"], cardCounts: [52, 1] },
  "solitaire":       { phases: ["Main", "Final"], cardCounts: [52, 1] }
};

function getDeckSetup(deck) {
  return deckConfig[deck] || deckConfig["the-voiager"];
}

let currentPhase = "";
let viewedCards = {};
let cardList = [];
let historyStack = [];
let timerInterval = null;
let countdown = 240;
let lastTap = 0;

function shuffle(array) {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
  return array;
}

function getCardList(phaseIndex) {
  const setup = getDeckSetup(deck);
  const phase = setup.phases[phaseIndex].toLowerCase();
  const total = setup.cardCounts[phaseIndex];

  if (phase === "final") {
    return [`assets/${deck}/final/final.png`];
  }

  const cards = Array.from({ length: total }, (_, i) =>
    `assets/${deck}/${phase}/card${i + 1}.png`
  );

  return shuffle(cards.filter(c => !(viewedCards[phase] || []).includes(c)));
}

function animateCardTransition(newSrc) {
  const tempImg = new Image();
  tempImg.src = newSrc;

  tempImg.onload = () => {
    // Set card invisible *before* swapping source
    gsap.set(card, { opacity: 0 });

    // Update source
    card.src = newSrc;

    // Animate in only after source is set
    gsap.fromTo(card,
      { opacity: 0, scale: 1.05 },
      {
        duration: 0.3,
        opacity: 1,
        scale: 1,
        ease: "power1.out"
      }
    );
  };
}

function showNextCard() {
  const phase = currentPhase.toLowerCase();
  if (phase === "final") {
    animateCardTransition(`assets/${deck}/final/final.png`);
    return;
  }

  if (cardList.length === 0) {
    alert("All cards viewed in this phase.");
    return;
  }

  const next = cardList.shift();
  if (!viewedCards[phase]) viewedCards[phase] = [];
  viewedCards[phase].push(next);
  historyStack.push(next);
  animateCardTransition(next);
  updateCounter();
}

function showPreviousCard() {
  if (historyStack.length < 2) return;
  historyStack.pop();
  const prev = historyStack[historyStack.length - 1];
  animateCardTransition(prev);
  updateCounter();
}

function changePhase(index) {
  const setup = getDeckSetup(deck);
  currentPhase = setup.phases[index];
  const phase = currentPhase.toLowerCase();
  if (!viewedCards[phase]) viewedCards[phase] = [];
  cardList = getCardList(index);
  historyStack = [];
  showNextCard();
}

function updateCounter() {
  const phase = currentPhase.toLowerCase();
  const viewed = viewedCards[phase]?.length || 0;
  const total = getDeckSetup(deck).cardCounts[
    getDeckSetup(deck).phases.findIndex(p => p.toLowerCase() === phase)
  ];
  cardCounter.textContent = `${viewed}/${total}`;
}

function updateTimerDisplay() {
  const m = Math.floor(countdown / 60);
  const s = countdown % 60;
  timerDisplay.textContent = `${m}:${s.toString().padStart(2, "0")}`;
}

function startTimer() {
  countdown = 240;
  updateTimerDisplay();
  timerInterval = setInterval(() => {
    countdown--;
    if (countdown <= 0) {
      clearInterval(timerInterval);
      timerDisplay.textContent = "✔";
      setTimeout(() => (timerDisplay.textContent = ""), 3000);
    } else {
      updateTimerDisplay();
    }
  }, 1000);
}

timerToggle?.addEventListener("click", () => {
  if (timerInterval) {
    clearInterval(timerInterval);
    timerDisplay.textContent = "";
    timerInterval = null;
  } else {
    startTimer();
  }
});

resetBtn?.addEventListener("click", () => {
  const phase = currentPhase.toLowerCase();
  viewedCards[phase] = [];
  cardList = getCardList(selector.selectedIndex);
  historyStack = [];
  showNextCard();
});

shuffleBtn?.addEventListener("click", () => {
  cardList = shuffle(cardList);
});

backBtn?.addEventListener("click", () => {
  window.location.href = "index.html";
});

prevCardButton?.addEventListener("click", showPreviousCard);

function handleCardTap() {
  const now = new Date().getTime();
  if (now - lastTap < 300) return;
  lastTap = now;
  showNextCard();
}

if ("ontouchstart" in window) {
  card?.addEventListener("touchend", handleCardTap);
} else {
  card?.addEventListener("click", handleCardTap);
}

function init() {
  const setup = getDeckSetup(deck);

  setup.phases.forEach((phase, i) => {
    const opt = document.createElement("option");
    opt.value = i;
    opt.textContent = phase;
    selector.appendChild(opt);
  });

  const iconColor = uiColorMap[deck] || "#ffffff";

  selector.style.color = iconColor;
  timerDisplay.style.color = iconColor;
  cardCounter.style.color = iconColor;

  [resetBtn, shuffleBtn, timerToggle, prevCardButton, backBtn].forEach(btn => {
    if (btn) btn.style.color = iconColor;
  });

  selector.addEventListener("change", e => {
    changePhase(Number(e.target.value));
  });

  changePhase(0);
}

// ✅ Final load event
window.addEventListener("load", () => {
  document.body.classList.add("loaded");
  init();
});
