/* ==========================================================================
   School Portfolio Navigation Bar
   Injected into every exported Google Sites page in DRAFT/. Provides the return
   half of the two-way switch with the main EAE portfolio: it sends you back to
   the section you left from, in the theme you were reading in.
   ========================================================================== */
(function () {
  var RETURN_KEY = 'eaePortfolioReturn';
  var THEME_KEY = 'eaePortfolioTheme';
  var RETURN_MAX_AGE_MS = 1000 * 60 * 60 * 12;

  function readJson(key) {
    try {
      return JSON.parse(localStorage.getItem(key) || 'null');
    } catch (e) {
      return null;
    }
  }

  // Only same-page fragments are honoured, so a tampered stored value can never
  // point the return button at another destination.
  function safeHash(value) {
    return /^#[A-Za-z][\w-]*$/.test(value || '') ? value : '';
  }

  function resolveReturn() {
    var saved = readJson(RETURN_KEY);
    if (!saved || typeof saved !== 'object') return { href: '../index.html' };
    var isFresh = typeof saved.savedAt === 'number' && (Date.now() - saved.savedAt) < RETURN_MAX_AGE_MS;
    return {
      href: '../index.html' + (isFresh ? safeHash(saved.hash) : ''),
      theme: saved.theme
    };
  }

  function resolveTheme(savedTheme) {
    var theme = savedTheme || localStorage.getItem(THEME_KEY);
    return theme === 'light' ? 'light' : 'dark';
  }

  function currentPageName() {
    var file = decodeURIComponent(location.pathname.split('/').pop() || 'Home.html');
    return file.replace(/\.html?$/i, '').replace(/[-_]+/g, ' ').replace(/\s+/g, ' ').trim() || 'Home';
  }

  function initSchoolNav() {
    if (document.getElementById('school-nav-bar')) return;

    if (!document.querySelector('link[href*="school-nav.css"]')) {
      var link = document.createElement('link');
      link.rel = 'stylesheet';
      link.href = 'school-nav.css';
      document.head.appendChild(link);
    }

    var target = resolveReturn();
    document.documentElement.setAttribute('data-school-theme', resolveTheme(target.theme));

    var nav = document.createElement('div');
    nav.id = 'school-nav-bar';
    nav.className = 'school-nav-bar';

    var back = document.createElement('a');
    back.className = 'school-nav-back-btn';
    back.href = target.href;
    back.textContent = '← Back to Main Portfolio';
    back.setAttribute('aria-label', 'Return to the main EAE portfolio');

    var page = document.createElement('span');
    page.className = 'school-nav-page';
    page.textContent = currentPageName();

    var title = document.createElement('span');
    title.className = 'school-nav-title';
    title.textContent = 'School E-Portfolio';

    nav.appendChild(back);
    nav.appendChild(page);
    nav.appendChild(title);

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
