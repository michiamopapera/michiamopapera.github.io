document.getElementById('startQuiz').addEventListener('click', startQuiz);

async function startQuiz() {
  const numQuestions = parseInt(document.getElementById('numQuestions').value, 10);
  const selectedModule = document.getElementById('moduleSelect').value;
  const selectedLanguage = document.getElementById('languageSelect').value;

  if (isNaN(numQuestions) || numQuestions < 1) {
    alert('.لطفاً تعداد معتبری از سوالات وارد کنید');
    return;
  }

  const questions = await fetchQuestions(selectedModule, selectedLanguage);
  if (questions.length === 0) {
    alert('.هیچ سوالی برای ماژول و زبان انتخاب شده یافت نشد');
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
      <strong>:${index + 1} سوال </strong><br><p>${q.question}</p>
      <label>${q.option_a} (۱</label><input type="radio" name="q${index}" value="${q.option_a}"><br>
      <label>${q.option_b} (۲</label><input type="radio" name="q${index}" value="${q.option_b}"><br>
      <label>${q.option_c} (۳</label><input type="radio" name="q${index}" value="${q.option_c}"><br>
      <label>${q.option_d} (۴</label><input type="radio" name="q${index}" value="${q.option_d}"><br>
    `;

    if (q.option_e) {
      optionsHTML += `<label>${q.option_e} (۵</label><input type="radio" name="q${index}" value="${q.option_e}"><br>
`;
    }

    questionCard.innerHTML = optionsHTML;
    quizSection.appendChild(questionCard);
  });

  const submitButton = document.createElement('button');
  submitButton.textContent = 'ارسال پاسخ‌ها';
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
      resultMessage.textContent = '!درست است';
      resultMessage.style.color = 'green';
    } else {
      resultMessage.textContent = `${q.correct_option}: نادرست است. جواب صحیح`;
      resultMessage.style.color = 'red';
    }

    questionDiv.appendChild(resultMessage);
  });

  const resultSection = document.getElementById('result');
  resultSection.style.display = 'block';
  const scoreElement = document.getElementById('score');
  scoreElement.innerHTML = `<p class=fafix> امتیاز کسب کردید</p> ${questions.length} <p class=fafix>از</p> ${score} <p class=fafix>شما</p>`;
  
  const submitButton = document.getElementById('submitButton');
  if (submitButton) submitButton.disabled = true;
}
