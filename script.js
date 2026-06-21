const vocab = [
  {
    kanji: "食べる",
    hiragana: "たべる",
    meaning: "to eat",
    type: "verb",
    sentence: "私は毎日ご飯を食べます。",
    reading: "わたしはまいにちごはんをたべます。",
    translation: "I eat rice/a meal every day."
  },
  {
    kanji: "行く",
    hiragana: "いく",
    meaning: "to go",
    type: "verb",
    sentence: "明日、仕事に行きます。",
    reading: "あした、しごとにいきます。",
    translation: "Tomorrow, I will go to work."
  },
  {
    kanji: "見る",
    hiragana: "みる",
    meaning: "to see / to watch",
    type: "verb",
    sentence: "仕事の後でテレビを見ます。",
    reading: "しごとのあとでテレビをみます。",
    translation: "I watch TV after work."
  },
  {
    kanji: "駅",
    hiragana: "えき",
    meaning: "station",
    type: "noun",
    sentence: "駅まで歩きます。",
    reading: "えきまであるきます。",
    translation: "I walk to the station."
  },
  {
    kanji: "今日",
    hiragana: "きょう",
    meaning: "today",
    type: "noun",
    sentence: "今日は日本語を勉強します。",
    reading: "きょうはにほんごをべんきょうします。",
    translation: "Today I will study Japanese."
  },
  {
    kanji: "仕事",
    hiragana: "しごと",
    meaning: "work / job",
    type: "noun",
    sentence: "今日は仕事があります。",
    reading: "きょうはしごとがあります。",
    translation: "I have work today."
  }
];

const grammar = [
  {
    point: "〜たいです",
    meaning: "want to do",
    example: "日本に行きたいです。",
    reading: "にほんにいきたいです。",
    translation: "I want to go to Japan.",
    note: "Attach たい to the verb stem: 行く → 行きたい."
  },
  {
    point: "〜ながら",
    meaning: "while doing",
    example: "働きながら、日本語を勉強します。",
    reading: "はたらきながら、にほんごをべんきょうします。",
    translation: "I study Japanese while working.",
    note: "Used when doing two actions at the same time."
  },
  {
    point: "〜ませんか",
    meaning: "Would you like to...?",
    example: "一緒にラーメンを食べませんか。",
    reading: "いっしょにラーメンをたべませんか。",
    translation: "Would you like to eat ramen together?",
    note: "A polite invitation."
  }
];

const kanji = [
  { kanji: "日", reading: "にち / ひ", meaning: "day, sun", example: "日本" },
  { kanji: "本", reading: "ほん", meaning: "book, origin", example: "日本" },
  { kanji: "人", reading: "じん / ひと", meaning: "person", example: "日本人" },
  { kanji: "語", reading: "ご", meaning: "language", example: "日本語" },
  { kanji: "食", reading: "た / しょく", meaning: "eat, food", example: "食べる" }
];

let current = "home";
let flashcardIndex = 0;
let showAnswer = false;

function getTagClass(type) {
  if (type === "verb") return "tag tag-verb";
  if (type === "noun") return "tag tag-noun";
  if (type === "adjective") return "tag tag-adjective";
  if (type === "adverb") return "tag tag-adverb";
  return "tag tag-expression";
}

function showSection(section, btn) {
  current = section;

  document.querySelectorAll("nav button").forEach(button => {
    button.classList.remove("active");
  });

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
      <h2>今日のミッション — Today’s Mission</h2>
      <p>This is your recommended minimum. Finish it, then study freely as much as you want.</p>

      <div class="mission-item">
        <div class="check">①</div>
        <div>
          <b>Learn 3 vocabulary words</b>
          <p class="small">Read the word, reading, meaning, and example sentence out loud.</p>
        </div>
      </div>

      <div class="mission-item">
        <div class="check">②</div>
        <div>
          <b>Review 1 grammar point</b>
          <p class="small">Make one original sentence with it.</p>
        </div>
      </div>

      <div class="mission-item">
        <div class="check">③</div>
        <div>
          <b>Do 5 flashcards</b>
          <p class="small">Say the answer before flipping the card.</p>
        </div>
      </div>

      <div class="mission-item">
        <div class="check">④</div>
        <div>
          <b>Write 1 journal sentence</b>
          <p class="small">Keep it simple. Example: 今日は仕事があります。</p>
        </div>
      </div>

      <button onclick="markTodayDone()">Mark Mission Complete</button>
      <button class="danger" onclick="resetToday()">Reset</button>
    </div>
  `;
}

function render() {
  const q = document.getElementById("search").value.toLowerCase();
  const content = document.getElementById("content");
  const studyDone = localStorage.getItem("studyDone") === "yes";

  if (current === "home") {
    content.innerHTML = `
      <div class="card hero">
        <div class="big">${studyDone ? "✅" : "🔥"}</div>
        <h2>Welcome back, David-san</h2>
        <p><b>Status:</b> ${studyDone ? "Daily mission complete." : "Daily mission not complete yet."}</p>
        <p>The mission gives you structure. Free Study lets you explore and grind whenever you want.</p>
      </div>

      <div class="grid">
        <div class="card">
          <h2>Daily Mission</h2>
          <p class="small">Recommended path for today.</p>
          <button class="study-link" onclick="go('mission')">Start Mission</button>
        </div>

        <div class="card">
          <h2>Free Study</h2>
          <p class="small">Choose anything. No limits.</p>
          <button class="study-link" onclick="go('vocab')">Vocabulary</button>
          <button class="study-link" onclick="go('grammar')">Grammar</button>
          <button class="study-link" onclick="go('kanji')">Kanji</button>
          <button class="study-link" onclick="go('flashcards')">Flashcards</button>
          <button class="study-link" onclick="go('quiz')">Quiz</button>
          <button class="study-link" onclick="go('journal')">Journal</button>
        </div>

        <div class="card">
          <h2>Current Database</h2>
          <p><b>${vocab.length}</b> vocabulary words</p>
          <p><b>${grammar.length}</b> grammar points</p>
          <p><b>${kanji.length}</b> kanji</p>
        </div>
      </div>

      <h2>Today’s 3 Words</h2>
      ${vocab.slice(0, 3).map(v => `
        <div class="card">
          <div class="jp">${v.kanji}</div>
          <div class="reading">${v.hiragana}</div>
          <span class="${getTagClass(v.type)}">${v.type}</span>
          <p><b>${v.meaning}</b></p>
          <p>${v.sentence}</p>
          <p class="reading">${v.reading}</p>
          <p>${v.translation}</p>
        </div>
      `).join("")}
    `;
  }

  if (current === "mission") {
    content.innerHTML = renderMission();
  }

  if (current === "vocab") {
    content.innerHTML = vocab.filter(v =>
      Object.values(v).join(" ").toLowerCase().includes(q)
    ).map(v => `
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

  if (current === "grammar") {
    content.innerHTML = grammar.filter(g =>
      Object.values(g).join(" ").toLowerCase().includes(q)
    ).map(g => `
      <div class="card">
        <div class="jp">${g.point}</div>
        <p><b>Meaning:</b> ${g.meaning}</p>
        <p>${g.example}</p>
        <p class="reading">${g.reading}</p>
        <p>${g.translation}</p>
        <p><b>Note:</b> ${g.note}</p>
      </div>
    `).join("");
  }

  if (current === "kanji") {
    content.innerHTML = kanji.filter(k =>
      Object.values(k).join(" ").toLowerCase().includes(q)
    ).map(k => `
      <div class="card">
        <div class="jp">${k.kanji}</div>
        <p><b>Reading:</b> ${k.reading}</p>
        <p><b>Meaning:</b> ${k.meaning}</p>
        <p><b>Example:</b> ${k.example}</p>
      </div>
    `).join("");
  }

  if (current === "flashcards") {
    const card = vocab[flashcardIndex];

    content.innerHTML = `
      <div class="card">
        <h2>Flashcard Mode</h2>
        <div class="jp">${card.kanji}</div>
        <div class="reading">${card.hiragana}</div>

        ${showAnswer ? `
          <span class="${getTagClass(card.type)}">${card.type}</span>
          <p><b>Meaning:</b> ${card.meaning}</p>
          <p>${card.sentence}</p>
          <p class="reading">${card.reading}</p>
          <p>${card.translation}</p>
        ` : `
          <p class="small">Try to remember the meaning before flipping.</p>
        `}

        <button onclick="flipFlashcard()">Flip</button>
        <button onclick="nextFlashcard()">Next</button>
      </div>
    `;
  }

  if (current === "quiz") {
    content.innerHTML = `
      <div class="card">
        <h2>Mini Quiz</h2>
        <p><b>Question:</b> What does <span class="jp">仕事</span> mean?</p>
        <button onclick="alert('Not quite. 駅 means station.')">station</button>
        <button onclick="alert('Correct! 仕事 means work/job.')">work / job</button>
        <button onclick="alert('Not quite. 食べる means to eat.')">to eat</button>
        <button onclick="alert('Not quite. 今日 means today.')">today</button>
      </div>
    `;
  }

  if (current === "journal") {
    content.innerHTML = `
      <div class="card">
        <h2>Japanese Journal</h2>
        <p>Write one simple sentence per day. Start small. Accuracy first.</p>

        <p class="jp">今日は仕事があります。</p>
        <p class="reading">きょうはしごとがあります。</p>
        <p>I have work today.</p>

        <p class="jp">仕事の後で日本語を勉強します。</p>
        <p class="reading">しごとのあとでにほんごをべんきょうします。</p>
        <p>After work, I will study Japanese.</p>

        <p class="jp">明日、日本語をもっと勉強したいです。</p>
        <p class="reading">あした、にほんごをもっとべんきょうしたいです。</p>
        <p>Tomorrow, I want to study Japanese more.</p>
      </div>
    `;
  }
}

document.getElementById("search").style.display = "none";
render();
