document.getElementById('startQuiz').addEventListener('click', startQuiz);

async function startQuiz() {
  const numQuestions = parseInt(document.getElementById('numQuestions').value, 10);
  const selectedModule = document.getElementById('moduleSelect').value;

  if (isNaN(numQuestions) || numQuestions < 1) {
    alert('Please enter a valid number of questions.');
    return;
  }

  const questions = await fetchQuestions(selectedModule);
  if (questions.length === 0) {
    alert('No questions found for the selected module.');
    return;
  }

  const selectedQuestions = questions.slice(0, numQuestions);
  displayQuiz(selectedQuestions);
}

async function fetchQuestions(selectedModule) {
  const response = await fetch('cameldb.csv');
  const csvData = await response.text();
  return parseCSV(csvData, selectedModule);
}

function parseCSV(csv, selectedModule) {
  const lines = csv.split('\n').slice(1).filter(line => line.trim().length > 0); 
  const questions = lines.map(line => {
    const [question, option_a, option_b, option_c, option_d, option_e, correct_option, module] = line.split(';');
    return { question, option_a, option_b, option_c, option_d, option_e, correct_option, module };
  }).filter(q => q.question && q.correct_option);

  return shuffleArray(selectedModule ? questions.filter(q => q.module === selectedModule) : questions);
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
    const questionDiv = document.createElement('div');
    questionDiv.innerHTML = `
      <h3>Question ${index + 1}: ${q.question}</h3>
      <label><input type="radio" name="q${index}" value="${q.option_a}"> ${q.option_a}</label><br>
      <label><input type="radio" name="q${index}" value="${q.option_b}"> ${q.option_b}</label><br>
      <label><input type="radio" name="q${index}" value="${q.option_c}"> ${q.option_c}</label><br>
      <label><input type="radio" name="q${index}" value="${q.option_d}"> ${q.option_d}</label><br>
      <label><input type="radio" name="q${index}" value="${q.option_e}"> ${q.option_e}</label><br>
    `;
    quizSection.appendChild(questionDiv);
  });

  const submitButton = document.createElement('button');
  submitButton.textContent = 'Submit Answers';
  submitButton.id = 'submitButton';
  submitButton.addEventListener('click', () => gradeQuiz(questions));
  quizSection.appendChild(submitButton);

  const retryButton = document.createElement('button');
  retryButton.textContent = 'Retry';
  retryButton.id = 'retryButton';
  retryButton.style.display = 'none';
  retryButton.addEventListener('click', resetFeedback);
  quizSection.appendChild(retryButton);
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
      resultMessage.textContent = 'Correct!';
      resultMessage.style.color = 'green';
    } else {
      resultMessage.textContent = `Incorrect. Correct answer: ${q.correct_option}`;
      resultMessage.style.color = 'red';
    }

    questionDiv.appendChild(resultMessage);
  });

  document.getElementById('result').style.display = 'block';
  document.getElementById('score').textContent = `You scored ${score} out of ${questions.length}`;

  document.getElementById('submitButton').disabled = true;
  document.getElementById('retryButton').style.display = 'inline';
}

function resetFeedback() {
  const quizSection = document.getElementById('quiz');
  quizSection.querySelectorAll('div').forEach(questionDiv => {
    const feedback = questionDiv.querySelector('p');
    if (feedback) feedback.remove();
  });

  document.getElementById('submitButton').disabled = false;
  document.getElementById('retryButton').style.display = 'none';
  quizSection.querySelectorAll('input[type="radio"]').forEach(input => input.checked = false);
  
  document.getElementById('result').style.display = 'none';
  document.getElementById('score').textContent = '';
}
