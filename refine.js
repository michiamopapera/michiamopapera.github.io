document.addEventListener('DOMContentLoaded', async () => {
  const quizContainer = document.getElementById('quizContainer');
  const generateQuizButton = document.getElementById('generateQuizButton');
  const moduleSelect = document.getElementById('moduleSelect');
  const languageSelect = document.getElementById('languageSelect');

  // Fetch and parse questions on page load
  let questions = await fetchQuestions();

  // Populate filters
  populateFilters(questions);

  // Generate the quiz based on filters
  generateQuizButton.addEventListener('click', () => {
    const filteredQuestions = filterQuestions(questions);
    if (filteredQuestions.length > 0) {
      displayQuiz(filteredQuestions);
    } else {
      quizContainer.innerHTML = "<p>No questions matching the criteria were found.</p>";
    }
  });
});

async function fetchQuestions() {
  const response = await fetch('cameldb_v1.csv', { cache: 'no-store' });
  const csvData = await response.text();
  return parseCSV(csvData);
}

function parseCSV(csv) {
  const lines = csv.trim().split('\n').slice(1); // Skip header row
  return lines.map(line => {
    const [question, wahlA, wahlB, wahlC, wahlD, wahlE, answer, module, language, tags, year, verified, date, notes, explanation, entryID] = line.split(';');
    return { question, wahlA, wahlB, wahlC, wahlD, wahlE, answer, module, language, tags, year, entryID };
  });
}

function populateFilters(questions) {
  const modules = [...new Set(questions.map(q => q.module))];
  const languages = [...new Set(questions.map(q => q.language))];

  const moduleSelect = document.getElementById('moduleSelect');
  const languageSelect = document.getElementById('languageSelect');

  modules.forEach(module => {
    if (module) {
      const option = document.createElement('option');
      option.value = module;
      option.textContent = module;
      moduleFilter.appendChild(option);
    }
  });

  languages.forEach(language => {
    if (language) {
      const option = document.createElement('option');
      option.value = language;
      option.textContent = language;
      languageFilter.appendChild(option);
    }
  });
}

function filterQuestions(questions) {
  const module = document.getElementById('moduleSelect').value;
  const language = document.getElementById('languageSelect').value;

  return questions.filter(q =>
    (q.module === module || !module) &&
    (q.language === language || !language) &&
    (q.answer.toLowerCase() === 'unknown!' || q.answer.toLowerCase() === 'idk')
  );
}

function displayQuiz(questions) {
  const quizContainer = document.getElementById('quizContainer');
  quizContainer.innerHTML = ''; // Clear existing content

  questions.forEach((q, index) => {
    const questionCard = document.createElement('div');
    questionCard.classList.add('question-card');

    questionCard.innerHTML = `
      <h3>Question ${index + 1} (ID: ${q.entryID})</h3>
      <p>${q.question}</p>
      <ol type="A">
        <li>${q.wahlA}</li>
        <li>${q.wahlB}</li>
        <li>${q.wahlC}</li>
        <li>${q.wahlD}</li>
        <li>${q.wahlE}</li>
      </ol>
      <button class="suggest-answer-button" data-entry-id="${q.entryID}">Suggest Answer</button>
    `;

    quizContainer.appendChild(questionCard);
  });

  // Attach event listeners to the "Suggest Answer" buttons
  document.querySelectorAll('.suggest-answer-button').forEach(button => {
    button.addEventListener('click', (event) => {
      const entryID = event.target.getAttribute('data-entry-id');
      const googleFormLink = `https://forms.gle/K8A1Hix2akDoBSnB7`; // Replace with your Google Form URL
      window.open(googleFormLink, '_blank');
    });
  });
}
