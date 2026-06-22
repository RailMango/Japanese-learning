let vocab = [];
let grammar = [];
let kanji = [];

let current = "home";
let flashcardIndex = 0;
let showAnswer = false;

function applySavedTheme() {
  const savedTheme = localStorage.getItem("theme") || "light";
  document.body.classList.toggle("dark", savedTheme === "dark");
  updateThemeButton();
}

function toggleTheme() {
  const isDark = document.body.classList.toggle("dark");
  localStorage.setItem("theme", isDark ? "dark" : "light");
  updateThemeButton();
}

function updateThemeButton() {
  const btn = document.getElementById("themeToggle");
  if (!btn) return;
  btn.textContent = document.body.classList.contains("dark") ? "Light Mode" : "Dark Mode";
}

async function loadData() {
  try {
    const [vocabRes, grammarRes, kanjiRes] = await Promise.all([
      fetch("data/vocab.json"),
      fetch("data/grammar.json"),
      fetch("data/kanji.json")
    ]);

    vocab = await vocabRes.json();
    grammar = await grammarRes.json();
    kanji = await kanjiRes.json();

    render();
  } catch (error) {
    document.getElementById("content").innerHTML = `
      <div class="card">
        <h2>Data loading error</h2>
        <p>The site could not load one of the data files.</p>
        <p class="small">Check that data/vocab.json, data/grammar.json, and data/kanji.json exist.</p>
      </div>
    `;
    console.error(error);
  }
}

function getTagClass(type) {
  if (type === "verb") return "tag tag-verb";
  if (type === "noun") return "tag tag-noun";
  if (type === "i-adjective") return "tag tag-i-adjective";
  if (type === "na-adjective") return "tag tag-na-adjective";
  if (type === "adverb") return "tag tag-adverb";
  return "tag tag-expression";
}

function showSection(section, btn) {
  current = section;
  document.querySelectorAll("nav button").forEach(button => button.classList.remove("active"));
  btn.classList.add("active");
  document.getElementById("search").style.display =
    ["vocab", "grammar", "kanji"].includes(section) ? "block" : "none";
  render();
}

function go(section) {
  current = section;
  document.querySelectorAll("nav button").forEach(button => {
    button.classList.remove("active");
    if (button.textContent.toLowerCase().includes(section)) {
      button.classList.add("active");
    }
  });
  document.getElementById("search").style.display =
    ["vocab", "grammar", "kanji"].includes(section) ? "block" : "none";
  render();
  window.scrollTo({ top: 0, behavior: "smooth" });
}

function markTodayDone() {
  localStorage.setItem("studyDone", "yes");
  render();
}

function resetToday() {
  localStorage.removeItem("studyDone");
  render();
}

function nextFlashcard() {
  flashcardIndex = (flashcardIndex + 1) % vocab.length;
  showAnswer = false;
  render();
}

function flipFlashcard() {
  showAnswer = !showAnswer;
  render();
}

function renderMission() {
  return `
    <div class="card hero">
      <h2>今日のミッション - Today's Mission</h2>
      <p>This is your recommended minimum. Finish it, then study freely as much as you want.</p>
      <div class="mission-item"><div class="check">1</div><div><b>Learn 3 vocabulary words</b><p class="small">Read the word, reading, meaning, and example sentence out loud.</p></div></div>
      <div class="mission-item"><div class="check">2</div><div><b>Review 1 grammar point</b><p class="small">Make one original sentence with it.</p></div></div>
      <div class="mission-item"><div class="check">3</div><div><b>Do 5 flashcards</b><p class="small">Say the answer before flipping the card.</p></div></div>
      <div class="mission-item"><div class="check">4</div><div><b>Write 1 journal sentence</b><p class="small">Keep it simple. Example: 今日は仕事があります。</p></div></div>
      <button onclick="markTodayDone()">Mark Mission Complete</button>
      <button class="danger" onclick="resetToday()">Reset</button>
    </div>
  `;
}

function renderVocabCards(list) {
  return list.map(v => `
    <div class="card">
      <div class="jp">${v.kanji}</div>
      <div class="reading">${v.hiragana}</div>
      <span class="${getTagClass(v.type)}">${v.type}</span>
      <p><b>Meaning:</b> ${v.meaning}</p>
      <p>${v.sentence}</p>
      <p class="reading">${v.reading}</p>
      <p>${v.translation}</p>
    </div>
  `).join("");
}

function render() {
  const q = document.getElementById("search").value.toLowerCase();
  const content = document.getElementById("content");
  const studyDone = localStorage.getItem("studyDone") === "yes";

  if (current === "home") {
    content.innerHTML = `
      <div class="card hero">
        <div class="big">${studyDone ? "Complete" : "Ready"}</div>
        <h2>Welcome back, David-san</h2>
        <p><b>Status:</b> ${studyDone ? "Daily mission complete." : "Daily mission not complete yet."}</p>
        <p>The mission gives you structure. Free Study lets you explore and grind whenever you want.</p>
      </div>
      <div class="grid">
        <div class="card"><h2>Daily Mission</h2><p class="small">Recommended path for today.</p><button class="study-link" onclick="go('mission')">Start Mission</button></div>
        <div class="card"><h2>Free Study</h2><p class="small">Choose anything. No limits.</p><button class="study-link" onclick="go('vocab')">Vocabulary</button><button class="study-link" onclick="go('grammar')">Grammar</button><button class="study-link" onclick="go('kanji')">Kanji</button><button class="study-link" onclick="go('flashcards')">Flashcards</button><button class="study-link" onclick="go('quiz')">Quiz</button><button class="study-link" onclick="go('journal')">Journal</button></div>
        <div class="card"><h2>Current Database</h2><p><b>${vocab.length}</b> vocabulary words</p><p><b>${grammar.length}</b> grammar points</p><p><b>${kanji.length}</b> kanji</p></div>
      </div>
      <h2>Today's 3 Words</h2>
      ${renderVocabCards(vocab.slice(0, 3))}
    `;
  }

  if (current === "mission") content.innerHTML = renderMission();

  if (current === "vocab") {
    const filtered = vocab.filter(v => Object.values(v).join(" ").toLowerCase().includes(q));
    content.innerHTML = `<h2>Vocabulary</h2>${renderVocabCards(filtered)}`;
  }

  if (current === "grammar") {
    const filtered = grammar.filter(g => Object.values(g).join(" ").toLowerCase().includes(q));
    content.innerHTML = filtered.map(g => `<div class="card"><div class="jp">${g.point}</div><p><b>Meaning:</b> ${g.meaning}</p><p>${g.example}</p><p class="reading">${g.reading}</p><p>${g.translation}</p><p><b>Note:</b> ${g.note}</p></div>`).join("");
  }

  if (current === "kanji") {
    const filtered = kanji.filter(k => Object.values(k).join(" ").toLowerCase().includes(q));
    content.innerHTML = filtered.map(k => `<div class="card"><div class="jp">${k.kanji}</div><p><b>Reading:</b> ${k.reading}</p><p><b>Meaning:</b> ${k.meaning}</p><p><b>Example:</b> ${k.example}</p></div>`).join("");
  }

  if (current === "flashcards") {
    const card = vocab[flashcardIndex];
    content.innerHTML = `<div class="card"><h2>Flashcard Mode</h2><div class="jp">${card.kanji}</div><div class="reading">${card.hiragana}</div>${showAnswer ? `<span class="${getTagClass(card.type)}">${card.type}</span><p><b>Meaning:</b> ${card.meaning}</p><p>${card.sentence}</p><p class="reading">${card.reading}</p><p>${card.translation}</p>` : `<p class="small">Try to remember the meaning before flipping.</p>`}<button onclick="flipFlashcard()">Flip</button><button onclick="nextFlashcard()">Next</button></div>`;
  }

  if (current === "quiz") {
    const answer = vocab[Math.floor(Math.random() * vocab.length)];
    const choices = [answer.meaning, "station", "teacher", "to drink"].sort(() => Math.random() - 0.5);
    content.innerHTML = `<div class="card"><h2>Mini Quiz</h2><p><b>Question:</b> What does <span class="jp">${answer.kanji}</span> mean?</p>${choices.map(choice => `<button onclick="alert('${choice === answer.meaning ? "Correct!" : "Not quite."} ${answer.kanji} means ${answer.meaning}.')">${choice}</button>`).join("")}</div>`;
  }

  if (current === "journal") {
    content.innerHTML = `<div class="card"><h2>Japanese Journal</h2><p>Write one simple sentence per day. Start small. Accuracy first.</p><p class="jp">今日は仕事があります。</p><p class="reading">きょうはしごとがあります。</p><p>I have work today.</p><p class="jp">仕事の後で日本語を勉強します。</p><p class="reading">しごとのあとでにほんごをべんきょうします。</p><p>After work, I will study Japanese.</p><p class="jp">明日、日本語をもっと勉強したいです。</p><p class="reading">あした、にほんごをもっとべんきょうしたいです。</p><p>Tomorrow, I want to study Japanese more.</p></div>`;
  }
}

document.getElementById("search").style.display = "none";
applySavedTheme();
console.log("Japanese Study Hub v3.3 Tsuki loaded");
loadData();
