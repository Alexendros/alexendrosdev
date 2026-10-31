(function () {
  try {
    document.documentElement.classList.add('js');
    var stored = localStorage.getItem('theme');
    if (stored === 'alexlight' || stored === 'alexdark') {
      document.documentElement.setAttribute('data-theme', stored);
    }
  } catch (err) {
    void err;
  }
})();
