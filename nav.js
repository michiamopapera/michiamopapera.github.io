/* Open the sidenav */
function openNav() {
  document.getElementById("mySidenav").style.width = "170px";
}

/* Close/hide the sidenav */
function closeNav() {
  document.getElementById("mySidenav").style.width = "0";
} 

window.addEventListener('DOMContentLoaded', () => {
  // Theme toggle code
  const toggleButton = document.getElementById("toggle-theme");
  const logo = document.getElementById('pnglogo');

  const savedTheme = localStorage.getItem("theme");
  const isDark = savedTheme === "dark";
  document.body.classList.toggle("darkmode", isDark);
  if (logo) logo.style.filter = isDark ? "invert(1) hue-rotate(180deg)" : "none";
  if (toggleButton) toggleButton.textContent = isDark ? "☀️" : "🌘";

  if (toggleButton) {
    toggleButton.addEventListener("click", () => {
      document.body.classList.add('transition-enabled');
      const nowDark = document.body.classList.toggle("darkmode");
      localStorage.setItem("theme", nowDark ? "dark" : "light");
      if (logo) logo.style.filter = nowDark ? "invert(1) hue-rotate(180deg)" : "none";
      toggleButton.textContent = nowDark ? "☀️" : "🌘";
    });
  }

  // ASCII logo code
  const today = new Date();
  const day = today.getDate();
  const month = today.getMonth();

  const asciilogo = document.getElementById('asciilogo');
  const asciilogoHalloween = document.getElementById('asciilogo-halloween');
  const asciilogoXmas = document.getElementById('asciilogo-xmas');

  if (asciilogo && asciilogoHalloween && asciilogoXmas && screen.width >= 600) {
    if (month === 9 && day >= 30) {
      asciilogo.style.display = 'none'; 
      asciilogoHalloween.style.display = 'inline-block';
    } else if (month === 11 && day > 14) {
      asciilogo.style.display = 'none';
      asciilogoXmas.style.display = 'inline-block';
    }
  }
});
