let vocab = [];
let grammar = [];
let kanji = [];

let current = "home";
let flashcardIndex = 0;
let showAnswer = false;
let sentenceChallenge = null;
let showSentenceExample = false;

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

    createSentenceChallenge();
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


function createSakura(x, y) {
  const petals = 3 + Math.floor(Math.random() * 2);

  for (let i = 0; i < petals; i++) {
    const petal = document.createElement("div");
    petal.className = "sakura-petal";

    if (Math.random() > 0.5) petal.classList.add("alt");
    if (Math.random() > 0.65) petal.classList.add("tiny");

    const size = 9 + Math.random() * 10;
    const spreadX = (Math.random() * 150) - 75;
    const fallY = 70 + Math.random() * 75;
    const startRotation = Math.floor(Math.random() * 220) - 110;
    const duration = 950 + Math.random() * 700;

    petal.style.left = (x + (Math.random() * 18 - 9)) + "px";
    petal.style.top = (y + (Math.random() * 12 - 6)) + "px";
    petal.style.setProperty("--size", size + "px");
    petal.style.setProperty("--x", spreadX + "px");
    petal.style.setProperty("--y", fallY + "px");
    petal.style.setProperty("--start-rot", startRotation + "deg");
    petal.style.setProperty("--duration", duration + "ms");
    petal.style.animationDelay = (i * 70) + "ms";

    document.body.appendChild(petal);

    setTimeout(() => {
      petal.remove();
    }, duration + 400);
  }
}

function showSection(section, btn) {
  current = section;

  const rect = btn.getBoundingClientRect();
  createSakura(
    rect.left + rect.width / 2,
    rect.top + rect.height / 2
  );
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
    const label = button.textContent.toLowerCase();
    if ((section === "sentence" && label.includes("sentence")) || label.includes(section)) {
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

function randomItem(list) {
  return list[Math.floor(Math.random() * list.length)];
}

function masuStem(word) {
  const dictionary = {
    "食べる": "食べ",
    "飲む": "飲み",
    "行く": "行き",
    "来る": "来",
    "帰る": "帰り",
    "見る": "見",
    "聞く": "聞き",
    "話す": "話し",
    "読む": "読み",
    "書く": "書き",
    "買う": "買い",
    "寝る": "寝",
    "起きる": "起き",
    "働く": "働き",
    "勉強する": "勉強し",
    "する": "し",
    "会う": "会い",
    "使う": "使い",
    "入る": "入り",
    "出る": "出",
    "待つ": "待ち",
    "歩く": "歩き",
    "走る": "走り",
    "乗る": "乗り",
    "降りる": "降り",
    "言う": "言い",
    "分かる": "分かり",
    "忘れる": "忘れ",
    "撮る": "撮り",
    "泊まる": "泊まり",
    "取る": "取り",
    "教える": "教え",
    "習う": "習い",
    "練習する": "練習し",
    "覚える": "覚え",
    "始める": "始め",
    "終わる": "終わり",
    "洗う": "洗い",
    "開ける": "開け",
    "閉める": "閉め",
    "座る": "座り",
    "立つ": "立ち",
    "作る": "作り"
  };
  return dictionary[word] || word.replace(/る$/, "");
}

function createSentenceChallenge() {
  if (!vocab.length) return;

  const verbs = vocab.filter(v => v.type === "verb");
  const nouns = vocab.filter(v => v.type === "noun");
  const iAdjs = vocab.filter(v => v.type === "i-adjective");
  const naAdjs = vocab.filter(v => v.type === "na-adjective");

  const challengeTypes = [];

  if (verbs.length) challengeTypes.push("verb-tai", "verb-masu", "verb-masen");
  if (nouns.length) challengeTypes.push("noun-desu", "noun-arimasu");
  if (iAdjs.length) challengeTypes.push("i-adj-desu");
  if (naAdjs.length) challengeTypes.push("na-adj-desu");

  const type = randomItem(challengeTypes);
  let word, grammarPoint, hint, example, reading, translation;

  if (type === "verb-tai") {
    word = randomItem(verbs);
    grammarPoint = "〜たいです";
    hint = "Use the verb stem + たいです. Example: 飲む -> 飲みたいです.";
    const stem = masuStem(word.kanji);
    example = `私は${word.kanji === "行く" ? "日本に" : "水を"}${stem}たいです。`;
    reading = word.kanji === "行く" ? "わたしはにほんにいきたいです。" : `わたしはみずを${word.hiragana.replace(/む$/, "み").replace(/く$/, "き").replace(/る$/, "")}たいです。`;
    translation = word.kanji === "行く" ? "I want to go to Japan." : `I want to ${word.meaning.replace("to ", "")}.`;
  }

  if (type === "verb-masu") {
    word = randomItem(verbs);
    grammarPoint = "〜ます";
    hint = "Use the polite present/future form. Keep it simple.";
    example = word.sentence || `私は${word.kanji}ます。`;
    reading = word.reading || "";
    translation = word.translation || "";
  }

  if (type === "verb-masen") {
    word = randomItem(verbs);
    grammarPoint = "〜ません";
    hint = "Use the polite negative form. Example: 飲みます -> 飲みません.";
    const stem = masuStem(word.kanji);
    example = `今日は${stem}ません。`;
    reading = `きょうは${word.hiragana.replace(/む$/, "み").replace(/く$/, "き").replace(/る$/, "")}ません。`;
    translation = `Today, I do not ${word.meaning.replace("to ", "")}.`;
  }

  if (type === "noun-desu") {
    word = randomItem(nouns);
    grammarPoint = "〜です";
    hint = "Use noun + です. This means 'is/am/are'.";
    example = `これは${word.kanji}です。`;
    reading = `これは${word.hiragana}です。`;
    translation = `This is ${word.meaning}.`;
  }

  if (type === "noun-arimasu") {
    word = randomItem(nouns);
    grammarPoint = "〜があります";
    hint = "Use があります for things, events, and abstract things. Use が before あります.";
    example = `${word.kanji}があります。`;
    reading = `${word.hiragana}があります。`;
    translation = `There is ${word.meaning}. / I have ${word.meaning}.`;
  }

  if (type === "i-adj-desu") {
    word = randomItem(iAdjs);
    grammarPoint = "い-adjective + です";
    hint = "Use the adjective directly before です.";
    example = `今日は${word.kanji}です。`;
    reading = `きょうは${word.hiragana}です。`;
    translation = `Today is ${word.meaning}.`;
  }

  if (type === "na-adj-desu") {
    word = randomItem(naAdjs);
    grammarPoint = "な-adjective + です";
    hint = "For this simple N5 sentence, use the な-adjective directly with です.";
    example = `今日は${word.kanji}です。`;
    reading = `きょうは${word.hiragana}です。`;
    translation = `Today is ${word.meaning}.`;
  }

  sentenceChallenge = { type, word, grammarPoint, hint, example, reading, translation };
  showSentenceExample = false;
}

function newSentenceChallenge() {
  createSentenceChallenge();
  render();
}

function revealSentenceExample() {
  showSentenceExample = true;
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

function renderSentencePractice() {
  if (!sentenceChallenge) {
    return `<div class="card"><h2>Sentence Practice</h2><p>Loading challenge...</p></div>`;
  }

  const c = sentenceChallenge;

  return `
    <div class="card hero practice-box">
      <h2>Sentence Practice</h2>
      <p>Build one simple N5-level sentence using the vocabulary and grammar below. This does not grade you yet; it gives you a natural example to compare with your answer.</p>
    </div>

    <div class="challenge-grid">
      <div class="card">
        <h2>Vocabulary</h2>
        <div class="jp">${c.word.kanji}</div>
        <div class="reading">${c.word.hiragana}</div>
        <span class="${getTagClass(c.word.type)}">${c.word.type}</span>
        <p><b>Meaning:</b> ${c.word.meaning}</p>
      </div>

      <div class="card">
        <h2>Grammar</h2>
        <div class="jp">${c.grammarPoint}</div>
        <p><b>Hint:</b> ${c.hint}</p>
      </div>
    </div>

    <div class="card">
      <h2>Your Sentence</h2>
      <textarea id="sentenceInput" placeholder="Type your Japanese sentence here..."></textarea>
      <button onclick="revealSentenceExample()">Reveal One Natural Example</button>
      <button onclick="newSentenceChallenge()">New Challenge</button>
    </div>

    ${showSentenceExample ? `
      <div class="card">
        <h2>One Natural Example</h2>
        <p class="jp">${c.example}</p>
        <p class="reading">${c.reading}</p>
        <p>${c.translation}</p>
        <p class="small">Remember: there can be many correct answers. Compare your sentence to this example.</p>
      </div>
    ` : ""}
  `;
}

function render() {
  const q = document.getElementById("search").value.toLowerCase();
  const content = document.getElementById("content");
  const studyDone = localStorage.getItem("studyDone") === "yes";

  if (current === "home") {
    content.innerHTML = `
      <div class="card hero">
        <div class="big">${studyDone ? "Complete" : "Ready"}</div>
        <h2>Welcome back</h2>
        <p><b>Status:</b> ${studyDone ? "Daily mission complete." : "Daily mission not complete yet."}</p>
        <p>The mission gives you structure. Free Study lets you explore and grind whenever you want.</p>
      </div>
      <div class="grid">
        <div class="card"><h2>Daily Mission</h2><p class="small">Recommended path for today.</p><button class="study-link" onclick="go('mission')">Start Mission</button></div>
        <div class="card"><h2>Free Study</h2><p class="small">Choose anything. No limits.</p><button class="study-link" onclick="go('vocab')">Vocabulary</button><button class="study-link" onclick="go('grammar')">Grammar</button><button class="study-link" onclick="go('kanji')">Kanji</button><button class="study-link" onclick="go('flashcards')">Flashcards</button><button class="study-link" onclick="go('sentence')">Sentence Practice</button><button class="study-link" onclick="go('quiz')">Quiz</button><button class="study-link" onclick="go('journal')">Journal</button></div>
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

  if (current === "sentence") {
    content.innerHTML = renderSentencePractice();
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
console.log("Mirai v0.3.5 Branding loaded");
loadData();
