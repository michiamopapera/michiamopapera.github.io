/* Open the sidenav */
function openNav() {
  document.getElementById("mySidenav").style.width = "15%";
}

/* Close/hide the sidenav */
function closeNav() {
  document.getElementById("mySidenav").style.width = "0";
} 

document.getElementById('startQuiz').addEventListener('click', startQuiz);

async function startQuiz() {
  const numQuestions = parseInt(document.getElementById('numQuestions').value, 10);
  const selectedModule = document.getElementById('moduleSelect').value; // Get selected module value
  if (isNaN(numQuestions) || numQuestions < 1) {
    alert('Please enter a valid number of questions.');
    return;
  }

  const questions = await fetchQuestions(selectedModule); // Pass selected module to filter questions
  if (questions.length === 0) {
    alert('No questions found for the selected module.');
    return;
  }

  const selectedQuestions = questions.slice(0, numQuestions); // Select the requested number of questions
  displayQuiz(selectedQuestions);
}

async function fetchQuestions(selectedModule) {
  const response = await fetch('cameldb_draft.csv');
  const csvData = await response.text();
  return parseCSV(csvData, selectedModule); // Pass the module to the parser
}

// Parse the CSV, filter by module, and randomize the questions
function parseCSV(csv, selectedModule) {
  const lines = csv.split('\n').slice(1); // Skip the header row
  const questions = lines.map(line => {
    const [question, option_a, option_b, option_c, option_d, option_e, correct_option, module] = line.split(';');
    return { question, option_a, option_b, option_c, option_d, option_e, correct_option, module };
  });

  // Filter by selected module if one is chosen
  const filteredQuestions = selectedModule && selectedModule !== "" 
    ? questions.filter(q => q.module === selectedModule) 
    : questions; // If no module is selected, show all questions

  // Randomize the questions
  return shuffleArray(filteredQuestions);
}

// Fisher-Yates Shuffle to randomize question order
function shuffleArray(array) {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]]; // Swap elements
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
  submitButton.addEventListener('click', () => gradeQuiz(questions));
  quizSection.appendChild(submitButton);
}

function gradeQuiz(questions) {
  let score = 0;

  questions.forEach((q, index) => {
    const selectedOption = document.querySelector(`input[name="q${index}"]:checked`);
    if (selectedOption && selectedOption.value.trim() === q.correct_option.trim()) {
      score++;
    }
  });

  document.getElementById('result').style.display = 'block';
  document.getElementById('score').textContent = `You scored ${score} out of ${questions.length}`;
}
