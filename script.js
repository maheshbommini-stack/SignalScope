const input =
  document.getElementById("claimInput");

const counter =
  document.getElementById("counter");

const analyzeBtn =
  document.getElementById("analyzeBtn");

const errorBox =
  document.getElementById("error");


// ========================================
// LANGUAGE DATABASE
// ========================================

const signals = {

  sensational: [

    "shocking",
    "unbelievable",
    "insane",
    "bombshell",
    "explosive",
    "jaw-dropping",
    "mind-blowing",
    "stunning",
    "secret",
    "revealed",
    "breaking",
    "you won't believe"

  ],


  emotional: [

    "terrifying",
    "outrage",
    "horrifying",
    "amazing",
    "miracle",
    "disaster",
    "fear",
    "panic",
    "furious",
    "devastating",
    "incredible",
    "heartbreaking"

  ],


  urgency: [

    "urgent",
    "immediately",
    "now",
    "alert",
    "breaking",
    "hurry",
    "act now",
    "before it's too late",
    "warning",
    "latest"

  ],


  exaggeration: [

    "always",
    "never",
    "everyone",
    "nobody",
    "completely",
    "100%",
    "guaranteed",
    "the best",
    "the worst",
    "will change everything",
    "cure all",
    "proves"

  ]

};


// ========================================
// TEXT COUNTER
// ========================================

input.addEventListener(
  "input",
  function () {

    counter.textContent =
      `${input.value.length} / 5000`;

  }
);


// ========================================
// EXAMPLE
// ========================================

document
  .getElementById("exampleBtn")
  .addEventListener(
    "click",
    function () {

      input.value =
        "BREAKING! Scientists reveal an unbelievable discovery that will completely change everything. Act now before it's too late!";

      input.dispatchEvent(
        new Event("input")
      );

    }
  );


// ========================================
// CLEAR
// ========================================

document
  .getElementById("clearBtn")
  .addEventListener(
    "click",
    function () {

      input.value = "";

      input.dispatchEvent(
        new Event("input")
      );

      resetResults();

    }
  );


// ========================================
// ANALYZE BUTTON
// ========================================

analyzeBtn.addEventListener(
  "click",
  function () {

    errorBox.textContent = "";

    const text =
      input.value.trim();


    if (!text) {

      errorBox.textContent =
        "ERROR: ENTER A CLAIM BEFORE SCANNING.";

      return;

    }


    if (text.length > 5000) {

      errorBox.textContent =
        "ERROR: TEXT IS TOO LONG.";

      return;

    }


    analyzeBtn.disabled = true;

    analyzeBtn.innerHTML =
      "SCANNING <span>...</span>";


    // Small delay to create scanning effect

    setTimeout(
      function () {

        const result =
          analyzeText(text);

        renderResults(result);


        analyzeBtn.disabled = false;

        analyzeBtn.innerHTML =
          'SCAN SIGNALS <span>→</span>';

      },
      500
    );

  }
);


// ========================================
// MAIN ANALYSIS
// ========================================

function analyzeText(text) {


  const cleanText =
    text.toLowerCase();


  // ------------------------------------
  // WORD COUNT
  // ------------------------------------

  const words =
    cleanText.match(
      /\b[\w'-]+%?\b/g
    ) || [];


  // ------------------------------------
  // SENTENCE COUNT
  // ------------------------------------

  const sentenceMatches =
    text.match(
      /[.!?]+(?=\s|$)/g
    ) || [];


  const sentenceCount =
    sentenceMatches.length ||
    (text ? 1 : 0);


  // ------------------------------------
  // SIGNAL COUNTS
  // ------------------------------------

  const sensational =
    countSignals(
      cleanText,
      signals.sensational
    );


  const emotional =
    countSignals(
      cleanText,
      signals.emotional
    );


  const urgency =
    countSignals(
      cleanText,
      signals.urgency
    );


  const exaggeration =
    countSignals(
      cleanText,
      signals.exaggeration
    );


  // ------------------------------------
  // EXTRA SIGNALS
  // ------------------------------------

  const exclamations =
    (text.match(/!/g) || []).length;


  const capitalWords =
    text.match(
      /\b[A-Z]{3,}\b/g
    ) || [];


  // ------------------------------------
  // SCORE
  // ------------------------------------

  let score = 0;


  score +=
    sensational * 12;


  score +=
    emotional * 9;


  score +=
    urgency * 10;


  score +=
    exaggeration * 11;


  score +=
    Math.min(
      exclamations * 4,
      16
    );


  score +=
    Math.min(
      capitalWords.length * 4,
      12
    );


  const density =
    words.length
      ? score / words.length
      : 0;


  score +=
    density * 8;


  score =
    Math.min(
      100,
      Math.round(score)
    );


  // ------------------------------------
  // RISK
  // ------------------------------------

  let risk =
    "LOW";


  if (score >= 55) {

    risk = "HIGH";

  }

  else if (score >= 28) {

    risk = "MEDIUM";

  }


  // ------------------------------------
  // LANGUAGE STYLE
  // ------------------------------------

  const totalSignals =
    sensational +
    emotional +
    urgency +
    exaggeration;


  let style =
    "Informative";


  if (
    totalSignals >= 4 ||
    exclamations >= 2
  ) {

    style =
      "Highly Sensational";

  }

  else if (
    totalSignals >= 2
  ) {

    style =
      "Attention-Grabbing";

  }

  else if (
    urgency > 0
  ) {

    style =
      "Urgency-Driven";

  }


  // ------------------------------------
  // FINDINGS
  // ------------------------------------

  const findings = [];


  getMatches(
    cleanText,
    signals.sensational
  ).forEach(
    word =>
      findings.push(
        `Sensational: "${word}"`
      )
  );


  getMatches(
    cleanText,
    signals.emotional
  ).forEach(
    word =>
      findings.push(
        `Emotional: "${word}"`
      )
  );


  getMatches(
    cleanText,
    signals.urgency
  ).forEach(
    word =>
      findings.push(
        `Urgency: "${word}"`
      )
  );


  getMatches(
    cleanText,
    signals.exaggeration
  ).forEach(
    word =>
      findings.push(
        `Exaggeration: "${word}"`
      )
  );


  return {

    wordCount:
      words.length,

    sentenceCount,

    sensational,

    emotional,

    urgency,

    exaggeration,

    score,

    risk,

    style,

    findings:
      findings.slice(0, 12)

  };

}


// ========================================
// COUNT SIGNALS
// ========================================

function countSignals(
  text,
  list
) {

  let count = 0;


  list.forEach(
    function (term) {

      const escaped =
        escapeRegex(term);


      const regex =
        new RegExp(
          `\\b${escaped}\\b`,
          "gi"
        );


      const matches =
        text.match(regex);


      if (matches) {

        count += matches.length;

      }

    }
  );


  return count;

}


// ========================================
// GET MATCHED WORDS
// ========================================

function getMatches(
  text,
  list
) {

  return list.filter(
    function (term) {

      const escaped =
        escapeRegex(term);


      const regex =
        new RegExp(
          `\\b${escaped}\\b`,
          "i"
        );


      return regex.test(text);

    }
  );

}


// ========================================
// ESCAPE REGEX
// ========================================

function escapeRegex(text) {

  return text.replace(
    /[.*+?^${}()|[\]\\]/g,
    "\\$&"
  );

}


// ========================================
// DISPLAY RESULTS
// ========================================

function renderResults(data) {


  document.getElementById(
    "score"
  ).textContent =
    data.score;


  document.getElementById(
    "words"
  ).textContent =
    data.wordCount;


  document.getElementById(
    "sentences"
  ).textContent =
    data.sentenceCount;


  document.getElementById(
    "sensational"
  ).textContent =
    data.sensational;


  document.getElementById(
    "emotional"
  ).textContent =
    data.emotional;


  document.getElementById(
    "urgency"
  ).textContent =
    data.urgency;


  document.getElementById(
    "exaggeration"
  ).textContent =
    data.exaggeration;


  document.getElementById(
    "styleLabel"
  ).textContent =
    data.style;


  document.getElementById(
    "riskTag"
  ).textContent =
    data.risk;


  // ------------------------------------
  // RISK TITLE
  // ------------------------------------

  const title =
    document.getElementById(
      "riskTitle"
    );


  const description =
    document.getElementById(
      "riskDescription"
    );


  if (data.risk === "HIGH") {

    title.textContent =
      "HIGH LINGUISTIC RISK";

    title.style.color =
      "var(--danger)";


    description.textContent =
      "Multiple attention-grabbing language signals were detected.";

  }


  else if (data.risk === "MEDIUM") {

    title.textContent =
      "MEDIUM LINGUISTIC RISK";

    title.style.color =
      "var(--warning)";


    description.textContent =
      "Several potentially attention-grabbing signals were detected.";

  }


  else {

    title.textContent =
      "LOW LINGUISTIC RISK";

    title.style.color =
      "var(--accent)";


    description.textContent =
      "Few potentially attention-grabbing language signals were detected.";

  }


  // ------------------------------------
  // SCORE RING
  // ------------------------------------

  const ring =
    document.getElementById(
      "scoreRing"
    );


  ring.style.background =
    `conic-gradient(
      var(--accent)
      ${data.score * 3.6}deg,
      #202720 0deg
    )`;


  // ------------------------------------
  // LANGUAGE BARS
  // ------------------------------------

  setBar(
    "barSensational",
    data.sensational
  );


  setBar(
    "barEmotional",
    data.emotional
  );


  setBar(
    "barUrgency",
    data.urgency
  );


  setBar(
    "barExaggeration",
    data.exaggeration
  );


  // ------------------------------------
  // FINDINGS
  // ------------------------------------

  const list =
    document.getElementById(
      "findingList"
    );


  list.innerHTML = "";


  if (
    data.findings.length === 0
  ) {

    list.innerHTML =
      `<span class="empty">
        No major linguistic signals detected.
      </span>`;

    return;

  }


  data.findings.forEach(
    function (item) {

      const tag =
        document.createElement(
          "span"
        );


      tag.textContent =
        item;


      list.appendChild(
        tag
      );

    }
  );

}


// ========================================
// BAR
// ========================================

function setBar(
  id,
  value
) {

  const max = 5;


  const percentage =
    Math.min(
      100,
      (value / max) * 100
    );


  document.getElementById(
    id
  ).style.width =
    `${percentage}%`;

}


// ========================================
// RESET
// ========================================

function resetResults() {


  const ids = [

    "score",
    "words",
    "sentences",
    "sensational",
    "emotional",
    "urgency",
    "exaggeration"

  ];


  ids.forEach(
    id => {

      document.getElementById(
        id
      ).textContent =
        "—";

    }
  );


  document.getElementById(
    "styleLabel"
  ).textContent = "—";


  document.getElementById(
    "riskTag"
  ).textContent =
    "WAITING";


  document.getElementById(
    "riskTitle"
  ).textContent =
    "Awaiting text";


  document.getElementById(
    "riskDescription"
  ).textContent =
    "Enter a claim and scan its linguistic signals.";


  document.getElementById(
    "findingList"
  ).innerHTML =
    `<span class="empty">
      No scan performed yet.
    </span>`;


  document.getElementById(
    "scoreRing"
  ).style.background =
    "conic-gradient(var(--accent) 0deg,#202720 0deg)";


  [
    "barSensational",
    "barEmotional",
    "barUrgency",
    "barExaggeration"

  ].forEach(
    id => {

      document.getElementById(
        id
      ).style.width =
        "0%";

    }
  );

}
