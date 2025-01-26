document.addEventListener('DOMContentLoaded', () => {
  const searchInput = document.getElementById('searchInput');
  const moduleFilter = document.getElementById('moduleFilter');
  const yearFilter = document.getElementById('yearFilter');
  const languageFilter = document.getElementById('languageFilter');
  const questionTable = document.getElementById('questionTable').querySelector('tbody');

  fetchQuestions().then(questions => {
    populateFilters(questions);
    displayQuestions(questions);

    [searchInput, moduleFilter, yearFilter, languageFilter].forEach(filter =>
      filter.addEventListener('input', () => displayQuestions(filterQuestions(questions)))
    );
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
    const [question, , , , , , answer, module, language, , year, , , , , entryID] = line.split(';');
    return { question, answer, module, year, language, entryID };
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
  const module = document.getElementById('moduleFilter').value;
  const year = document.getElementById('yearFilter').value;
  const language = document.getElementById('languageFilter').value;

  return questions.filter(q =>
    (q.question.toLowerCase().includes(searchText) || !searchText) &&
    (q.module === module || !module) &&
    (q.year === year || !year) &&
    (q.language === language || !language)
  );
}

function displayQuestions(questions) {
  const tbody = document.getElementById('questionTable').querySelector('tbody');
  tbody.innerHTML = ''; // Clear current table rows

  questions.forEach(q => {
    const row = document.createElement('tr');
    row.innerHTML = `
      <td>${q.question}</td>
      <td>${q.answer}</td>
      <td>${q.module}</td>
      <td>${q.year}</td>
      <td>${q.language}</td>
      <td>${q.entryID}</td>
    `;
    tbody.appendChild(row);
  });
}
