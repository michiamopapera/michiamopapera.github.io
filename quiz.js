document.getElementById('startQuiz').addEventListener('click', startQuiz);

async function startQuiz() {
  const numQuestions = parseInt(document.getElementById('numQuestions').value, 10);
  const selectedModule = document.getElementById('moduleSelect').value; // Get selected module value
 
  console.log(`Number of Questions: ${numQuestions}`);
  console.log(`Selected Module: ${selectedModule}`);
 
  if (isNaN(numQuestions) || numQuestions < 1) {
    alert('Please enter a valid number of questions.');
    return;
  }

  const questions = await fetchQuestions(selectedModule); // Pass selected module to filter questions
  console.log(`Fetched Questions: ${JSON.stringify(questions)}`);
  if (questions.length === 0) {
    alert('No questions found for the selected module.');
    return;
  }
  const selectedQuestions = questions.slice(0, numQuestions); // Select the requested number of questions
  displayQuiz(selectedQuestions);
}

async function fetchQuestions(selectedModule) {
  const timestamp = new Date().getTime();  // Generate a timestamp
  const response = await fetch(`cameldb_v1.csv?timestamp=${timestamp}`);  // Append the timestamp to avoid cache
  const csvData = await response.text();
  console.log('Fetched CSV Data:', csvData); // Log the raw CSV data
  return parseCSV(csvData, selectedModule); // Pass the module to the parser
}

function parseCSV(csv, selectedModule) {
  console.log('Fetched CSV Data:', csv);  // Log the raw CSV data to check it's correctly fetched

  const lines = csv.split('\n')   // Split by line breaks
    .map(line => line.trim())      // Remove any extra spaces at the start or end
    .filter(line => line.length > 0);  // Remove any empty lines

  console.log('Lines after split:', lines); // Log the resulting array of lines
  
  // Skip the header row (first row) and process only data rows
  const questions = lines.slice(1).map(line => {
    const columns = line.split(';');
    console.log('Parsed row:', columns);  // Check each parsed row

    if (columns.length < 8) {
      console.error('Malformed row detected:', line);
    }

    const [question, option_a, option_b, option_c, option_d, option_e, correct_option, module] = columns;
    return { question, option_a, option_b, option_c, option_d, option_e, correct_option, module };
  });

  console.log('Parsed Questions:', questions);

  // Filter questions by the selected module (if any)
  const filteredQuestions = selectedModule && selectedModule !== "" 
    ? questions.filter(q => q.module.trim().toLowerCase() === selectedModule.trim().toLowerCase()) 
    : questions;

  console.log('Filtered Questions:', filteredQuestions);

  return shuffleArray(filteredQuestions);  // Shuffle and return the filtered questions
}


console.log('Selected Module:', selectedModule);

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
  submitButton.id = 'submitButton';
  submitButton.addEventListener('click', () => gradeQuiz(questions));
  quizSection.appendChild(submitButton);

  const retryButton = document.createElement('button');
  retryButton.textContent = 'Retry';
  retryButton.id = 'retryButton';
  retryButton.style.display = 'none'; // Hidden initially
  retryButton.addEventListener('click', resetFeedback);
  quizSection.appendChild(retryButton);
}


console.log('Selected Module:', selectedModule);


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

  // Disable submit button and show retry button
  document.getElementById('submitButton').disabled = true;
  document.getElementById('retryButton').style.display = 'inline';
}


function resetFeedback() {
  const quizSection = document.getElementById('quiz');
  quizSection.querySelectorAll('div').forEach(questionDiv => {
    const feedback = questionDiv.querySelector('p');
    if (feedback) feedback.remove();
  });

  // Enable inputs and submit button again
  document.getElementById('submitButton').disabled = false;
  document.getElementById('retryButton').style.display = 'none';

  // Clear all selected answers
  quizSection.querySelectorAll('input[type="radio"]').forEach(input => {
    input.checked = false;
  });

  document.getElementById('result').style.display = 'none';

  // Display final score
  document.getElementById('result').style.display = 'block';
  document.getElementById('score').textContent = `You scored ${score} out of ${questions.length}`;
}

let timerInterval;

function startTimer(duration) {
  const timerDisplay = document.getElementById('timer');
  let timeRemaining = duration;

  // Disable the start timer button after starting the timer
  document.getElementById('startTimerButton').disabled = true;

  // Update the timer every second
  timerInterval = setInterval(() => {
    const minutes = Math.floor(timeRemaining / 60);
    const seconds = timeRemaining % 60;
    timerDisplay.textContent = `Time Left: ${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;

    timeRemaining--;

    if (timeRemaining < 0) {
      clearInterval(timerInterval);
      alert('Time is up! Submitting your quiz.');
      document.getElementById('submitButton').click(); // Auto-submit the quiz
    }
  }, 1000);
}

function stopTimer() {
  clearInterval(timerInterval);
  document.getElementById('timer').textContent = 'Timer stopped.';
  document.getElementById('startTimerButton').disabled = false; // Re-enable the start button if needed
}



document.getElementById('startTimerButton').addEventListener('click', () => {
  const duration = 300; // Set timer duration (e.g., 5 minutes = 300 seconds)
  startTimer(duration);
  document.getElementById('stopTimerButton').style.display = 'inline';
});

document.getElementById('stopTimerButton').addEventListener('click', () => {
  stopTimer();
  document.getElementById('stopTimerButton').style.display = 'none';
});

