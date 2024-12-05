document.addEventListener('DOMContentLoaded', async () => {
  const searchInput = document.getElementById('searchInput');
  const moduleFilter = document.getElementById('moduleFilter');
  const yearFilter = document.getElementById('yearFilter');
  const languageFilter = document.getElementById('languageFilter');
  const verifiedFilter = document.getElementById('verifiedFilter');
  const questionTable = document.getElementById('questionTable').querySelector('tbody');

  let questions = await fetchQuestions();

  populateFilters(questions);
  displayQuestions(questions);

  // Event listeners for search and filters
  [searchInput, moduleFilter, yearFilter, languageFilter, verifiedFilter].forEach(filter =>
    filter.addEventListener('input', () => displayQuestions(filterQuestions(questions)))
  );
});

async function fetchQuestions() {
  try {
    const response = await fetch('cameldb_v1.csv'); // Ensure the file name is correct here
    if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`);
    const csvData = await response.text();
    return parseCSV(csvData);
  } catch (error) {
    console.error('Error fetching the CSV file:', error);
    alert('Failed to load questions. Please check the file name or its location.');
    return [];
  }
}

function parseCSV(csv) {
  const lines = csv.trim().split('\n').slice(1); // Skip header row
  return lines.map(line => {
    const [question, wahlA, wahlB, wahlC, wahlD, wahlE, answer, module, language, tags, year, verified, expandedDate, notes, explanation, blank] = line.split(';');
    return { question, module, year, language, verified: verified.trim() === "Yes" ? "Yes" : "No" };
  });
}

function populateFilters(questions) {
  const moduleFilter = document.getElementById('moduleFilter');
  const yearFilter = document.getElementById('yearFilter');

  const modules = [...new Set(questions.map(q => q.module))];
  const years = [...new Set(questions.map(q => q.year))];

  modules.forEach(module => {
    const option = document.createElement('option');
    option.value = module;
    option.textContent = module;
    moduleFilter.appendChild(option);
  });

  years.forEach(year => {
    const option = document.createElement('option');
    option.value = year;
    option.textContent = year;
    yearFilter.appendChild(option);
  });
}

function filterQuestions(questions) {
  const searchText = document.getElementById('searchInput').value.toLowerCase();
  const module = document.getElementById('moduleFilter').value; // Can be empty
  const year = document.getElementById('yearFilter').value;
  const language = document.getElementById('languageFilter').value;
  const verified = document.getElementById('verifiedFilter').value;

  return questions.filter(q =>
    (!searchText || q.question.toLowerCase().includes(searchText)) && // Match search if entered
    (!module || q.module === module) && // Match module if selected, otherwise all
    (!year || q.year === year) && // Match year if selected
    (!language || q.language === language) && // Match language if selected
    (!verified || q.verified === verified) // Match verified if selected
  );
}

function displayQuestions(questions) {
  const tbody = document.getElementById('questionTable').querySelector('tbody');
  tbody.innerHTML = ''; // Clear current table rows

  questions.forEach(q => {
    const row = document.createElement('tr');
    row.innerHTML = `
      <td>${q.question}</td>
      <td>${q.module}</td>
      <td>${q.year}</td>
      <td>${q.language}</td>
      <td>${q.verified}</td>
    `;
    tbody.appendChild(row);
  });
}
