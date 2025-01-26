// HTML Setup (Add this where you define your dropdowns in the HTML)
// <select id="languageSelect">
//   <option value="EN">English</option>
//   <option value="IT">Italian</option>
// </select>

document.getElementById('startQuiz').addEventListener('click', startQuiz);

async function startQuiz() {
  const numQuestions = parseInt(document.getElementById('numQuestions').value, 10);
  const selectedModule = document.getElementById('moduleSelect').value; // Get selected module value
  const selectedLanguage = document.getElementById('languageSelect').value; // Get selected language

  console.log(`Number of Questions: ${numQuestions}`);
  console.log(`Selected Module: ${selectedModule}`);
  console.log(`Selected Language: ${selectedLanguage}`);

  if (isNaN(numQuestions) || numQuestions < 1) {
    alert('Please enter a valid number of questions.');
    return;
  }

  const questions = await fetchQuestions(selectedModule, selectedLanguage); // Pass module and language to filter questions
  console.log(`Fetched Questions: ${JSON.stringify(questions)}`);

  if (questions.length === 0) {
    alert('No questions found for the selected module and language.');
    return;
  }

  const shuffledQuestions = shuffleArray(questions); // Shuffle the questions
  const selectedQuestions = shuffledQuestions.slice(0, numQuestions); // Select the requested number of questions

  displayQuiz(selectedQuestions);
}

async function fetchQuestions(selectedModule, selectedLanguage) {
  const timestamp = new Date().getTime(); // Generate a timestamp
  const response = await fetch(`cameldb_v1.csv?timestamp=${timestamp}`); // Append the timestamp to avoid cache
  const csvData = await response.text();
  console.log('Fetched CSV Data:', csvData); // Log the raw CSV data
  return parseCSV(csvData, selectedModule, selectedLanguage); // Pass the module and language to the parser
}

function parseCSV(csv, selectedModule, selectedLanguage) {
  console.log('Fetched CSV Data:', csv); // Log the raw CSV data to check it's correctly fetched

  const lines = csv
    .split('\n') // Split by line breaks
    .map(line => line.trim()) // Remove any extra spaces at the start or end
    .filter(line => line.length > 0); // Remove any empty lines

  console.log('Lines after split:', lines); // Log the resulting array of lines

  // Skip the header row (first row) and process only data rows
  const questions = lines.slice(1).map(line => {
    const columns = line.split(';');
    console.log('Parsed row:', columns); // Check each parsed row

    if (columns.length < 8) {
      console.error('Malformed row detected', line);
    }

    const [
      question,
      option_a,
      option_b,
      option_c,
      option_d,
      option_e,
      correct_option,
      module,
      language
    ] = columns;

    return {
      question,
      option_a,
      option_b,
      option_c,
      option_d,
      option_e,
      correct_option,
      module,
      language
    };
  });

  // Filter questions by the selected module and language (if any)
  const filteredQuestions = questions.filter(q => {
    const matchesModule = !selectedModule || q.module.trim().toLowerCase() === selectedModule.trim().toLowerCase();
    const matchesLanguage = !selectedLanguage || q.language.trim().toLowerCase() === selectedLanguage.trim().toLowerCase();
    return matchesModule && matchesLanguage;
  });

  console.log('Filtered Questions:', filteredQuestions);

  return filteredQuestions;
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
      <ol type="A">
      <label><input type="radio" <li>name="q${index}" value="${q.option_a}"> ${q.option_a}</label></li>
      <label><input type="radio" <li>name="q${index}" value="${q.option_b}"> ${q.option_b}</label></li>
      <label><input type="radio" <li>name="q${index}" value="${q.option_c}"> ${q.option_c}</label></li>
      <label><input type="radio" <li>name="q${index}" value="${q.option_d}"> ${q.option_d}</label></li>
      <label><input type="radio" <li>name="q${index}" value="${q.option_e}"> ${q.option_e}</label></li>
      </ol>
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

function gradeQuiz(questions) {
  let score = 0; // Initialize the score to 0

  questions.forEach((q, index) => {
    // Find the selected option for the current question
    const selectedOption = document.querySelector(`input[name="q${index}"]:checked`);
    const questionDiv = document.querySelector(`#quiz div:nth-child(${index + 1})`);

    // Create a result message element to display feedback for the current question
    const resultMessage = document.createElement('p');
    resultMessage.style.fontWeight = 'bold';

    if (selectedOption && selectedOption.value.trim() === q.correct_option.trim()) {
      // If the selected option matches the correct answer, increment the score
      score++;
      resultMessage.textContent = 'Correct!';
      resultMessage.style.color = 'green';

    } else {
      // If the answer is incorrect or no option is selected, display the correct answer
      resultMessage.textContent = `Incorrect. Correct answer: ${q.correct_option}`;
      resultMessage.style.color = 'red';
    }

    // Append the feedback message to the corresponding question div
    questionDiv.appendChild(resultMessage);
  });

  // Display the total score in the results section
  const resultSection = document.getElementById('result');
  resultSection.style.display = 'block';
  const scoreElement = document.getElementById('score');
  scoreElement.textContent = `You scored ${score} out of ${questions.length}`;

  // Disable the submit button to prevent multiple submissions
  const submitButton = document.getElementById('submitButton');
  if (submitButton) submitButton.disabled = true;

  // Show the retry button to allow the user to reset the quiz
  const retryButton = document.getElementById('retryButton');
  if (retryButton) retryButton.style.display = 'inline';
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
}
