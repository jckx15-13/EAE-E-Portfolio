(function () {
  function initSchoolNav() {
    if (document.getElementById('school-nav-bar')) return;

    if (!document.querySelector('link[href*="school-nav.css"]')) {
      var link = document.createElement('link');
      link.rel = 'stylesheet';
      link.href = 'school-nav.css';
      document.head.appendChild(link);
    }

    var nav = document.createElement('div');
    nav.id = 'school-nav-bar';
    nav.className = 'school-nav-bar';
    nav.innerHTML =
      '<a href="../index.html" class="school-nav-back-btn">\u2190 Back to Main Portfolio</a>' +
      '<span class="school-nav-title">School E-Portfolio</span>';

    if (document.body) {
      document.body.insertBefore(nav, document.body.firstChild);
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initSchoolNav);
  } else {
    initSchoolNav();
  }
})();
