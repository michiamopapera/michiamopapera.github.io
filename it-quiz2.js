document.getElementById('startQuiz').addEventListener('click', startQuiz);

async function startQuiz() {
  const numQuestions = parseInt(document.getElementById('numQuestions').value, 10);
  const selectedModule = document.getElementById('moduleSelect').value;
  const selectedLanguage = document.getElementById('languageSelect').value;

  if (isNaN(numQuestions) || numQuestions < 1) {
    alert('Inserisci un numero valido.');
    return;
  }

  const questions = await fetchQuestions(selectedModule, selectedLanguage);
  if (questions.length === 0) {
    alert('Non sono state trovate domande per questo esame e/o lingua.');
    return;
  }

  const shuffledQuestions = shuffleArray(questions);
  const selectedQuestions = shuffledQuestions.slice(0, numQuestions);
  displayQuiz(selectedQuestions);
}

async function fetchQuestions(selectedModule, selectedLanguage) {
  const timestamp = new Date().getTime();
  const response = await fetch(`cameldbv2.csv?timestamp=${timestamp}`);
  const csvData = await response.text();
  return parseCSV(csvData, selectedModule, selectedLanguage);
}

function parseCSV(csv, selectedModule, selectedLanguage) {
  const lines = csv.split('\n').map(line => line.trim()).filter(line => line.length > 0);
  const questions = lines.slice(1).map(line => {
    const columns = line.split(';');
    if (columns.length < 8) return null;

    const [question, option_a, option_b, option_c, option_d, option_e, correct_option, module, language] = columns;
    return {
      question,
      option_a,
      option_b,
      option_c,
      option_d,
      option_e: option_e === '#LEER!' ? null : option_e,
      correct_option,
      module,
      language
    };
  }).filter(q => q);

  return questions.filter(q => {
    const matchesModule = !selectedModule || q.module.trim().toLowerCase() === selectedModule.trim().toLowerCase();
    const matchesLanguage = !selectedLanguage || q.language.trim().toLowerCase() === selectedLanguage.trim().toLowerCase();
    return matchesModule && matchesLanguage;
  });
}

function shuffleArray(array) {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
  return array;
}

function displayQuiz(questions) {
  const quizSection = document.getElementById('quiz');
  quizSection.innerHTML = '';
  quizSection.style.display = 'block';

  questions.forEach((q, index) => {
    const questionCard = document.createElement('div');
    questionCard.classList.add('question-card');

    let optionsHTML = `
      <p><strong>Domanda ${index + 1}:</strong> ${q.question}</p>
      <label><input type="radio" name="q${index}" value="${q.option_a}"> A. ${q.option_a}</label><br>
      <label><input type="radio" name="q${index}" value="${q.option_b}"> B. ${q.option_b}</label><br>
      <label><input type="radio" name="q${index}" value="${q.option_c}"> C. ${q.option_c}</label><br>
      <label><input type="radio" name="q${index}" value="${q.option_d}"> D. ${q.option_d}</label><br>
    `;

    if (q.option_e) {
      optionsHTML += `<label><input type="radio" name="q${index}" value="${q.option_e}"> E. ${q.option_e}</label><br>`;
    }

    questionCard.innerHTML = optionsHTML;
    quizSection.appendChild(questionCard);
  });

  const submitButton = document.createElement('button');
  submitButton.textContent = 'Conferma Risposte';
  submitButton.id = 'submitButton';
  submitButton.addEventListener('click', () => gradeQuiz(questions));
  quizSection.appendChild(submitButton);
}

function gradeQuiz(questions) {
  let score = 0;

  questions.forEach((q, index) => {
    const selectedOption = document.querySelector(`input[name="q${index}"]:checked`);
    const questionDiv = document.querySelector(`#quiz div:nth-child(${index + 1})`);
    const resultMessage = document.createElement('p');
    resultMessage.style.fontWeight = 'bold';

    if (selectedOption && selectedOption.value.trim() === q.correct_option.trim()) {
      score++;
      resultMessage.textContent = 'Giusto!';
      resultMessage.style.color = 'green';
    } else {
      resultMessage.textContent = `Sbagliato. La risposta corretta è: ${q.correct_option}`;
      resultMessage.style.color = 'red';
    }

    questionDiv.appendChild(resultMessage);
  });

  const resultSection = document.getElementById('result');
  resultSection.style.display = 'block';
  document.getElementById('score').textContent = `Hai fatto ${score} punti di un massimo ${questions.length}.`;

  const submitButton = document.getElementById('submitButton');
  if (submitButton) submitButton.disabled = true;
}
