document.getElementById('startQuiz').addEventListener('click', startQuiz);

async function startQuiz() {
    const numQuestions = parseInt(document.getElementById('numQuestions').value, 10);
    const selectedModules = getSelectedModules();
    const selectedLanguages = getSelectedLanguages();
    const selectedYears = getSelectedYears();

    if (isNaN(numQuestions) || numQuestions < 1) {
        alert('Bitte geben Sie eine gültige Zahl der Fragen ein.');
        return;
    }

    if (selectedModules.length === 0) {
        alert('Bitte wählen Sie mindestens ein Modul aus.');
        return;
    }

    if (selectedLanguages.length === 0) {
        alert('Bitte wählen Sie mindestens eine Sprache aus.');
        return;
    }
    
    if (selectedYears.length === 0) {
        alert('Bitte wählen Sie mindestens ein Jahr aus.');
        return;
    }

    try {
        const allQuestions = await fetchQuestions(selectedModules, selectedLanguages, selectedYears);
        
        console.log("Here's ya filtered questions boyo, but they ain't been handled yet:", allQuestions);
        
        if (!Array.isArray(allQuestions)) {
            throw new Error("fetchQuestions my arse. Where's the fucking array?")
        }
        if (allQuestions.length === 0) {
            alert('Keine Fragen für diese Einstellungen gefunden.');
            return;
        }

        const shuffledQuestions = shuffleArray(allQuestions);
        console.log("every day im shuffling:", shuffledQuestions)
        
        const selectedQuestions = shuffledQuestions.slice(0, numQuestions);
        console.log("so this is what we gonna put in the quiz:", selectedQuestions)

        displayQuiz(selectedQuestions);

        console.log("Selected Modules:", selectedModules);
        console.log("Selected Languages:", selectedLanguages);
        console.log("Selected Years:", selectedYears);
   } catch (error) {
        console.error("Error fetching questions:", error);
        alert("An error occurred while fetching questions. Please try again.");
    }
}

function getSelectedModules() {
    return Array.from(document.querySelectorAll('.moduleCheckbox:checked')).map(cb => cb.value.trim().toLowerCase());
}

function getSelectedLanguages() {
    return Array.from(document.querySelectorAll('.languageCheckbox:checked')).map(cb => cb.value.trim().toLowerCase());
}

function getSelectedYears() {
    return Array.from(document.querySelectorAll('.yearCheckbox:checked')).map(cb => cb.value.trim());
}

async function fetchQuestions(selectedModules, selectedLanguages, selectedYears) {
    try {
        const timestamp = new Date().getTime();
        const response = await fetch(`cameldbv2.csv?timestamp=${timestamp}`);
        
        if (!response.ok) {
            throw new Error(`Failed to fetch CSV: ${response.statusText}`);
        }

        const csvData = await response.text();
        console.log("CSV Data Loaded Successfully");

        const questions = parseCSV(csvData);

        console.log("Total Questions Before Filtering:", questions.length);
        console.log("Filtering with:");
        console.log("Modules:", selectedModules);
        console.log("Languages:", selectedLanguages);
        console.log("Years:", selectedYears);

        // Corrected filter logic
        const filteredQuestions = questions.filter(q => {
            const moduleMatch = selectedModules.length === 0 || selectedModules.includes(q.module);
            const languageMatch = selectedLanguages.length === 0 || selectedLanguages.includes(q.language);
            const yearMatch = selectedYears.length === 0 || selectedYears.includes(q.year);
            return moduleMatch && languageMatch && yearMatch;
        });

        console.log("Total Questions After Filtering:", filteredQuestions.length);

        if (filteredQuestions.length === 0) {
            console.warn("No questions matched! Check the filters or CSV format.");
        }

        return filteredQuestions;
    } catch (error) {
        console.error("Error loading CSV:", error);
        return [];
    }
}

function parseCSV(csv) {
    const lines = csv.split('\n').map(line => line.trim()).filter(line => line.length > 0);

    if (lines.length < 2) {
        console.error("CSV contains no question data.");
        return [];
    }

    return lines.slice(1).map(line => {
        const columns = line.split(';');
        if (columns.length < 12) return null;

        const [
            question, option_a, option_b, option_c, option_d, option_e, 
            correct_option, module, language, tags, year, verif
        ] = columns;

        const questionObj = {
            question: question.trim(),
            option_a: option_a.trim(),
            option_b: option_b.trim(),
            option_c: option_c.trim(),
            option_d: option_d.trim(),
            option_e: option_e && option_e !== '#LEER!' ? option_e.trim() : null,
            correct_option: correct_option.trim(),
            module: module.trim().toLowerCase(),
            language: language.trim().toLowerCase(),
            tags: tags.trim(),
            year: year.trim(),
            verif: verif.trim()
        };

        console.log("Parsed Question:", questionObj);
        return questionObj;
    }).filter(q => q !== null);
}

function shuffleArray(array) {
    return array.sort(() => Math.random() - 0.5);
}

function displayQuiz(questions) {
    const quizSection = document.getElementById('quiz');
    quizSection.innerHTML = '';
    quizSection.style.display = 'block';

    questions.forEach((q, index) => {
        const questionDiv = document.createElement('div');
        questionDiv.classList.add('question-card');
        
        let questionHTML = `
            <p><strong>Question ${index + 1}:</strong> ${q.question}</p>
            <label><input type="radio" name="q${index}" value="${q.option_a}"> A. ${q.option_a}</label><br>
            <label><input type="radio" name="q${index}" value="${q.option_b}"> B. ${q.option_b}</label><br>
            <label><input type="radio" name="q${index}" value="${q.option_c}"> C. ${q.option_c}</label><br>
            <label><input type="radio" name="q${index}" value="${q.option_d}"> D. ${q.option_d}</label><br>
        `;
        
        if (q.option_e) {
            questionHTML += `<label><input type="radio" name="q${index}" value="${q.option_e}"> E. ${q.option_e}</label><br>`;
        }
        
        questionDiv.innerHTML = questionHTML;
        quizSection.appendChild(questionDiv);
    });


  const submitButton = document.createElement('button');
  submitButton.textContent = 'Antworten abgeben';
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
      resultMessage.textContent = 'Richtig!';
      resultMessage.style.color = 'green';
    } else {
      resultMessage.textContent = `Falsch. Die richtige Antwort war: ${q.correct_option}`;
      resultMessage.style.color = 'red';
    }

    questionDiv.appendChild(resultMessage);
  });

  const resultSection = document.getElementById('result');
  resultSection.style.display = 'block';
  document.getElementById('score').textContent = `Sie haben ${score} von ${questions.length} Punkten erhalten.`;

  const submitButton = document.getElementById('submitButton');
  if (submitButton) submitButton.disabled = true;
}
