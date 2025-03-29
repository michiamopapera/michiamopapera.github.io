document.addEventListener('DOMContentLoaded', () => {
  // Get current date
  const today = new Date();
  const day = today.getDate();
  const month = today.getMonth();

  // Get elements
  const asciilogo = document.getElementById('asciilogo');
  const asciilogoHalloween = document.getElementById('asciilogo-halloween');
  const asciilogoXmas = document.getElementById('asciilogo-xmas');

  // Check if elements exist
  if (!asciilogo || !asciilogoHalloween || !asciilogoXmas) return;
  if(screen.width >= 600) {
  if (month === 9 && day >= 30)  {
    // October 18-31 (Halloween)
    asciilogo.style.display = 'none'; 
    asciilogoHalloween.style.display = 'inline-block';
  } else if (month === 11 && day > 14)  if(screen.width >= 600){
    // After December 23rd (Christmas)
    asciilogo.style.display = 'none';
    asciilogoXmas.style.display = 'inline-block';
  }
  }
  // If neither condition is met, no changes are made.
});