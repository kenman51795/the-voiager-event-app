const deckConfig = {
  "the-voiager": {
    name: "The Voiager",
    color: "#3b5549",
    accent: "#E7D0B8",
    phases: [
      { name: "Discovery", count: 65 },
      { name: "Affinity", count: 65 },
      { name: "Validity", count: 65 },
      { name: "Final", count: 1 }
    ]
  },
  "curious-hearts": {
    name: "Curious Hearts",
    color: "#aa6c9c",
    accent: "#CEC0E2",
    phases: [{ name: "Main", count: 51 }, { name: "Final", count: 1 }]
  },
  "departure": {
    name: "Departure",
    color: "#444444",
    accent: "#A8A8A8",
    phases: [{ name: "Main", count: 51 }, { name: "Final", count: 1 }]
  },
  "eternal-flame": {
    name: "Eternal Flame",
    color: "#8b2e1d",
    accent: "#F2C572",
    phases: [{ name: "Main", count: 51 }, { name: "Final", count: 1 }]
  },
  "family-legacy": {
    name: "Family Legacy",
    color: "#a46b38",
    accent: "#E5CDB3",
    phases: [{ name: "Main", count: 51 }, { name: "Final", count: 1 }]
  },
  "family-ties": {
    name: "Family Ties",
    color: "#c77e2a",
    accent: "#F6E3C5",
    phases: [{ name: "Main", count: 51 }, { name: "Final", count: 1 }]
  },
  "inner-circle": {
    name: "Inner Circle",
    color: "#3c5d87",
    accent: "#C8D7E1",
    phases: [{ name: "Main", count: 51 }, { name: "Final", count: 1 }]
  },
  "walk-of-faith": {
    name: "Walk of Faith",
    color: "#EDE8D9",
    accent: "#FFE381",
    phases: [{ name: "Main", count: 51 }, { name: "Final", count: 1 }]
  }
};

const requestedDeck = new URLSearchParams(location.search).get("deck");
const deckKey = deckConfig[requestedDeck] ? requestedDeck : "the-voiager";
const config = deckConfig[deckKey];
const elements = {
  card: document.querySelector("#card"),
  next: document.querySelector("#next-card"),
  selector: document.querySelector("#phase-selector"),
  counter: document.querySelector("#card-counter"),
  progress: document.querySelector("#progress-fill"),
  deckName: document.querySelector("#deck-name"),
  previous: document.querySelector("#prev-card"),
  shuffle: document.querySelector("#shuffle-button"),
  reset: document.querySelector("#reset-button"),
  timer: document.querySelector("#timer-toggle"),
  timerDisplay: document.querySelector("#timer-display"),
  toast: document.querySelector("#toast")
};

let phaseIndex = 0;
let queue = [];
let history = [];
let seen = new Set();
let timerId = null;
let seconds = 240;
let transitioning = false;

const shuffle = items => {
  const result = [...items];
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
};

function cardPath(number) {
  const phase = config.phases[phaseIndex].name.toLowerCase();
  return phase === "final"
    ? `assets/${deckKey}/final/final.png`
    : `assets/${deckKey}/${phase}/card${number}.png`;
}

function rebuildQueue() {
  const { count } = config.phases[phaseIndex];
  queue = shuffle(Array.from({ length: count }, (_, i) => i + 1).filter(n => !seen.has(n)));
}

function updateProgress() {
  const total = config.phases[phaseIndex].count;
  const current = Math.max(1, seen.size);
  elements.counter.textContent = `${current} / ${total}`;
  elements.progress.style.width = `${Math.min(100, current / total * 100)}%`;
  elements.previous.disabled = history.length < 2;
}

function preloadNextCard() {
  if (!queue.length) return;
  const image = new Image();
  image.src = cardPath(queue[0]);
}

function announce(message) {
  elements.toast.textContent = message;
  elements.toast.classList.add("show");
  clearTimeout(announce.timeout);
  announce.timeout = setTimeout(() => elements.toast.classList.remove("show"), 1800);
}

async function displayCard(src, direction = 1) {
  if (transitioning) return;
  transitioning = true;
  const hasCurrentCard = Boolean(elements.card.getAttribute("src"));
  const image = new Image();
  image.src = src;
  try { await image.decode(); } catch (_) {}

  if (hasCurrentCard) {
    await elements.card.animate(
      [{ opacity: 1, transform: "translateX(0) scale(1)" }, { opacity: 0, transform: `translateX(${-18 * direction}px) scale(.985)` }],
      { duration: 150, easing: "ease-in", fill: "forwards" }
    ).finished;
  }

  elements.card.src = src;
  elements.card.alt = `${config.name} conversation prompt`;
  elements.card.animate(
    hasCurrentCard
      ? [{ opacity: 0, transform: `translateX(${18 * direction}px) scale(.985)` }, { opacity: 1, transform: "translateX(0) scale(1)" }]
      : [{ opacity: 0, transform: "scale(.99)" }, { opacity: 1, transform: "scale(1)" }],
    { duration: hasCurrentCard ? 280 : 220, easing: "cubic-bezier(.2,.8,.2,1)", fill: "forwards" }
  );
  transitioning = false;
}

function nextCard() {
  if (transitioning) return;
  if (!queue.length) {
    announce("You’ve completed this phase");
    return;
  }
  const number = queue.shift();
  seen.add(number);
  history.push(number);
  displayCard(cardPath(number), 1).then(preloadNextCard);
  updateProgress();
}

function previousCard() {
  if (history.length < 2 || transitioning) return;
  const current = history.pop();
  queue.unshift(current);
  seen.delete(current);
  displayCard(cardPath(history.at(-1)), -1);
  updateProgress();
}

function loadPhase(index) {
  phaseIndex = index;
  seen = new Set();
  history = [];
  rebuildQueue();
  nextCard();
}

function formatTime(value) {
  return `${Math.floor(value / 60)}:${String(value % 60).padStart(2, "0")}`;
}

function toggleTimer() {
  if (timerId) {
    clearInterval(timerId);
    timerId = null;
    elements.timer.classList.remove("active");
    elements.timerDisplay.textContent = "Timer";
    return;
  }
  seconds = 240;
  elements.timer.classList.add("active");
  elements.timerDisplay.textContent = formatTime(seconds);
  timerId = setInterval(() => {
    seconds -= 1;
    elements.timerDisplay.textContent = formatTime(seconds);
    if (seconds <= 0) {
      clearInterval(timerId);
      timerId = null;
      elements.timer.classList.remove("active");
      elements.timerDisplay.textContent = "Done";
      announce("Time’s up");
    }
  }, 1000);
}

elements.deckName.textContent = config.name;
document.documentElement.style.setProperty("--accent", config.accent);
document.documentElement.style.setProperty("--deck-color", config.color);
config.phases.forEach((phase, index) => {
  elements.selector.add(new Option(phase.name, index));
});
elements.selector.addEventListener("change", event => loadPhase(Number(event.target.value)));
elements.next.addEventListener("click", nextCard);
elements.previous.addEventListener("click", previousCard);
elements.shuffle.addEventListener("click", () => { queue = shuffle(queue); announce("Cards shuffled"); });
elements.reset.addEventListener("click", () => { loadPhase(phaseIndex); announce("Phase restarted"); });
elements.timer.addEventListener("click", toggleTimer);
document.addEventListener("keydown", event => {
  if (["ArrowRight", " ", "Enter"].includes(event.key)) { event.preventDefault(); nextCard(); }
  if (event.key === "ArrowLeft") previousCard();
});
loadPhase(0);
