document.addEventListener('DOMContentLoaded', () => {
  const now = new Date();
  const day = now.getDate();
  const month = now.getMonth(); // 0-indexed: January = 0, December = 11

  // Elements to swap
  const asciilogo = document.getElementById('asciilogo');
  const asciilogoHalloween = document.getElementById('asciilogo-halloween');
  const asciilogoXmas = document.getElementById('asciilogo-xmas');

  // Determine which element to display
  if (month === 9 && day >= 30) {
    // Last two weeks of October (Halloween)
    if (asciilogo) asciilogo.style.display = 'none';
    if (asciilogoHalloween) asciilogoHalloween.style.display = 'block';
    if (asciilogoXmas) asciilogoXmas.style.display = 'none';
  } else if (month === 11 && day >= 23) {
    // December 8th to 31st (Christmas)
    if (asciilogo) asciilogo.style.display = 'none';
    if (asciilogoHalloween) asciilogoHalloween.style.display = 'none';
    if (asciilogoXmas) asciilogoXmas.style.display = 'block';
  } else {
    // Default case: normal element
    if (asciilogo) asciilogo.style.display = 'block';
    if (asciilogoHalloween) asciilogoHalloween.style.display = 'none';
    if (asciilogoXmas) asciilogoXmas.style.display = 'none';
  }
});
