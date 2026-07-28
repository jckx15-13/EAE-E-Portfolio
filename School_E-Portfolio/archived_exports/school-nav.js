/* ==========================================================================
   School Portfolio Navigation Bar
   Injected into every exported Google Sites page in DRAFT/. The export kept its
   page content but lost usable wayfinding between pages, so this bar supplies
   it: a breadcrumb, sequential paging through the published pages, a grouped
   page menu, and the return half of the two-way switch with the main EAE
   portfolio (back to the section you left, in the theme you were reading in).
   ========================================================================== */
(function () {
  'use strict';

  var RETURN_KEY = 'eaePortfolioReturn';
  var THEME_KEY = 'eaePortfolioTheme';
  var RETURN_MAX_AGE_MS = 1000 * 60 * 60 * 12;
  var LEAVE_FADE_MS = 220;

  // Kept in step with the responsive breakpoints in school-nav.css.
  var LAYOUT_QUERIES = ['(max-width: 380px)', '(max-width: 640px)', '(max-width: 900px)'];

  var heightObserver = null;

  /* PAGES mirrors the export's own navigation tree, kept in its document order
     so paging reads the portfolio the way the site itself orders it.

     Six pages are deliberately absent: Google Sites shipped their nav entries
     commented out (S2-Term 3, S2 - Term 4, Outward Bound, Taiwan STEM, Python &
     Advanced Python, Overall Strenghts). Those files stay on disk and stay
     reachable by direct URL, but a bar that advertised them would publish
     material the site owner chose to unpublish, so it doesn't. Labels and
     filenames are copied verbatim from the export, original spelling included.
     ------------------------------------------------------------------------ */
  var PAGES = [
    { file: 'Home.html', label: 'Home', group: 'Overview' },

    { file: 'Secondary 1.html', label: 'Secondary 1', group: 'Secondary 1', parent: 'Home.html' },
    { file: 'S1-Term 1.html', label: 'S1-Term 1', group: 'Secondary 1', parent: 'Secondary 1.html' },
    { file: 'S1-Term 2.html', label: 'S1-Term 2', group: 'Secondary 1', parent: 'Secondary 1.html' },
    { file: 'S1-Term 3.html', label: 'S1-Term 3', group: 'Secondary 1', parent: 'Secondary 1.html' },
    { file: 'S1-Term 4.html', label: 'S1-Term 4', group: 'Secondary 1', parent: 'Secondary 1.html' },

    { file: 'Secondary 2.html', label: 'Secondary 2', group: 'Secondary 2', parent: 'Home.html' },
    { file: 'S2 -Term 1.html', label: 'S2 -Term 1', group: 'Secondary 2', parent: 'Secondary 2.html' },
    { file: 'S2 - Term 2.html', label: 'S2 - Term 2', group: 'Secondary 2', parent: 'Secondary 2.html' },

    { file: 'Secondary 3.html', label: 'Secondary 3', group: 'Secondary 3', parent: 'Home.html' },
    { file: 'S3 - Term 1.html', label: 'S3 - Term 1', group: 'Secondary 3', parent: 'Secondary 3.html' },
    { file: 'S3 - Term 2.html', label: 'S3 - Term 2', group: 'Secondary 3', parent: 'Secondary 3.html' },
    { file: 'S3 - Term 3.html', label: 'S3 - Term 3', group: 'Secondary 3', parent: 'Secondary 3.html' },
    { file: 'S3 - Term 4.html', label: 'S3 - Term 4', group: 'Secondary 3', parent: 'Secondary 3.html' },
    // Exported at the same nav level as the years; grouped under Secondary 3
    // here because that is the year it belongs to and the page name says so.
    {
      file: ' Secondary 3 2025 June Holiday ApLM Course.html',
      label: 'Secondary 3 2025 June Holiday ApLM Course',
      short: 'June Holiday ApLM Course',
      group: 'Secondary 3',
      parent: 'Secondary 3.html'
    },

    { file: 'Orientation Camp Leader.html', label: 'Orientation Camp Leader', group: 'Programmes', parent: 'Home.html' },

    { file: 'Secondary 4.html', label: 'Secondary 4', group: 'Secondary 4', parent: 'Home.html' },
    { file: 'S4 - Term 1.html', label: 'S4 - Term 1', group: 'Secondary 4', parent: 'Secondary 4.html' },
    { file: 'S4 - Term 2.html', label: 'S4 - Term 2', group: 'Secondary 4', parent: 'Secondary 4.html' },

    {
      file: 'Overall Endorsements And Achivements.html',
      label: 'Overall Endorsements And Achivements',
      short: 'Endorsements & Achivements',
      group: 'Recognition',
      parent: 'Home.html'
    },

    { file: 'Achievers Program.html', label: 'Achievers Program', group: 'Programmes', parent: 'Home.html' },
    { file: 'E-A-E.html', label: 'E-A-E', group: 'Programmes', parent: 'Home.html' },
    { file: 'CCA.html', label: 'CCA', group: 'Programmes', parent: 'Home.html' },
    { file: 'Personal Projects.html', label: 'Personal Projects', group: 'Programmes', parent: 'Home.html' }
  ];

  var GROUP_ORDER = ['Overview', 'Secondary 1', 'Secondary 2', 'Secondary 3', 'Secondary 4', 'Programmes', 'Recognition'];

  // ---------------------------------------------------------------- helpers

  function el(tag, cls, text) {
    var node = document.createElement(tag);
    if (cls) node.className = cls;
    if (text != null) node.textContent = text;
    return node;
  }

  function readJson(key) {
    try {
      return JSON.parse(localStorage.getItem(key) || 'null');
    } catch (e) {
      return null;
    }
  }

  function prefersReducedMotion() {
    return !!(window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches);
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

  // Every filename in the export contains spaces, and one carries a leading
  // space, so links are encoded as a single path segment and read back decoded.
  function hrefFor(file) {
    return encodeURIComponent(file);
  }

  function currentFile() {
    var segment = location.pathname.split('/').pop() || '';
    try {
      segment = decodeURIComponent(segment);
    } catch (e) {
      /* keep the raw segment */
    }
    return segment || 'Home.html';
  }

  function byFile(file) {
    for (var i = 0; i < PAGES.length; i++) {
      if (PAGES[i].file === file) return PAGES[i];
    }
    return null;
  }

  function indexOfFile(file) {
    for (var i = 0; i < PAGES.length; i++) {
      if (PAGES[i].file === file) return i;
    }
    return -1;
  }

  function displayName(page) {
    return page.short || page.label;
  }

  // Used for the six unpublished pages, which are absent from PAGES but must
  // still get a readable bar if someone opens one directly.
  function fallbackLabel(file) {
    return file.replace(/\.html?$/i, '').replace(/[-_]+/g, ' ').replace(/\s+/g, ' ').trim() || 'Home';
  }

  // Walks parent links up to Home. The guard stops a malformed parent chain
  // from looping forever.
  function trail(file) {
    var chain = [];
    var page = byFile(file);
    var guard = 0;
    while (page && guard++ < 10) {
      chain.unshift(page);
      page = page.parent ? byFile(page.parent) : null;
    }
    return chain;
  }

  // ------------------------------------------------------------- components

  function buildCrumbs(current) {
    var list = el('ol', 'school-nav-crumbs');
    var chain = trail(current);

    if (!chain.length) {
      // An unpublished page: still show where it sits, without inventing a
      // parent for it beyond the site root.
      chain = [byFile('Home.html'), { file: current, label: fallbackLabel(current) }];
    }

    chain.forEach(function (page, index) {
      var item = el('li', 'school-nav-crumb');
      var isLast = index === chain.length - 1;

      if (isLast) {
        // .school-nav-page is part of the contract the test suite checks for.
        var here = el('span', 'school-nav-crumb-label school-nav-page', displayName(page));
        here.setAttribute('aria-current', 'page');
        here.title = page.label;
        item.appendChild(here);
      } else {
        var link = el('a', 'school-nav-crumb-label school-nav-crumb-link', displayName(page));
        link.href = hrefFor(page.file);
        link.title = page.label;
        item.appendChild(link);
      }

      list.appendChild(item);
    });

    return list;
  }

  function buildStep(page, direction) {
    var isPrev = direction === 'prev';
    var glyph = isPrev ? '‹' : '›';

    if (!page) {
      var stub = el('span', 'school-nav-step is-disabled', glyph);
      stub.setAttribute('aria-hidden', 'true');
      return stub;
    }

    var link = el('a', 'school-nav-step');
    link.href = hrefFor(page.file);
    link.rel = isPrev ? 'prev' : 'next';
    link.title = (isPrev ? 'Previous: ' : 'Next: ') + page.label;
    link.setAttribute('aria-label', (isPrev ? 'Previous page: ' : 'Next page: ') + page.label);
    link.appendChild(el('span', 'school-nav-step-glyph', glyph));
    link.appendChild(el('span', 'school-nav-step-label', displayName(page)));
    return link;
  }

  function buildMenu(current) {
    var panel = el('div', 'school-nav-menu');
    panel.id = 'school-nav-menu';
    panel.hidden = true;

    GROUP_ORDER.forEach(function (groupName) {
      var pages = PAGES.filter(function (page) {
        return page.group === groupName;
      });
      if (!pages.length) return;

      var section = el('div', 'school-nav-menu-group');
      section.appendChild(el('p', 'school-nav-menu-heading', groupName));

      var list = el('ul', 'school-nav-menu-list');
      pages.forEach(function (page) {
        var item = document.createElement('li');
        var link = el('a', 'school-nav-menu-link', displayName(page));
        link.href = hrefFor(page.file);
        link.title = page.label;
        if (page.file === current) {
          link.setAttribute('aria-current', 'page');
          link.classList.add('is-current');
        }
        item.appendChild(link);
        list.appendChild(item);
      });

      section.appendChild(list);
      panel.appendChild(section);
    });

    return panel;
  }

  // ----------------------------------------------------------------- wiring

  function wireMenu(button, panel) {
    function close(returnFocus) {
      if (panel.hidden) return;
      panel.hidden = true;
      button.setAttribute('aria-expanded', 'false');
      if (returnFocus) button.focus();
    }

    function open() {
      panel.hidden = false;
      button.setAttribute('aria-expanded', 'true');
      var target = panel.querySelector('.school-nav-menu-link.is-current') || panel.querySelector('.school-nav-menu-link');
      if (target) target.focus();
    }

    button.addEventListener('click', function (event) {
      event.stopPropagation();
      if (panel.hidden) open();
      else close(true);
    });

    document.addEventListener('keydown', function (event) {
      if (event.key === 'Escape') close(true);
    });

    document.addEventListener('click', function (event) {
      if (panel.hidden) return;
      if (!panel.contains(event.target) && event.target !== button) close(false);
    });

    // The list is long enough that arrow-key travel is worth having.
    panel.addEventListener('keydown', function (event) {
      if (event.key !== 'ArrowDown' && event.key !== 'ArrowUp') return;
      var links = Array.prototype.slice.call(panel.querySelectorAll('.school-nav-menu-link'));
      var index = links.indexOf(document.activeElement);
      if (index === -1) return;
      event.preventDefault();
      var next = event.key === 'ArrowDown' ? index + 1 : index - 1;
      if (next < 0) next = links.length - 1;
      if (next >= links.length) next = 0;
      links[next].focus();
    });
  }

  function showLeaveOverlay() {
    if (document.getElementById('school-nav-leaving')) return;
    var overlay = el('div', 'school-nav-leaving');
    overlay.id = 'school-nav-leaving';
    overlay.setAttribute('role', 'status');
    overlay.appendChild(el('span', 'school-nav-leaving-text', 'Returning to main portfolio…'));
    document.body.appendChild(overlay);
    requestAnimationFrame(function () {
      overlay.classList.add('is-visible');
    });
  }

  // Fades out on the way back to the main portfolio. Modified clicks and
  // reduced-motion readers navigate straight away, and the timeout always
  // fires, so nothing can strand anyone behind the overlay.
  function wireLeaveTransition(link) {
    link.addEventListener('click', function (event) {
      if (event.defaultPrevented) return;
      if (event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
      if (prefersReducedMotion()) return;

      event.preventDefault();
      var destination = link.href;
      showLeaveOverlay();
      setTimeout(function () {
        location.href = destination;
      }, LEAVE_FADE_MS);
    });
  }

  // The bar wraps to two rows on narrow screens, so the offset that keeps page
  // content clear of it is measured rather than assumed. One measurement at
  // startup is not enough: the export reflows itself once its own scripts run,
  // late web fonts change the text height, and a viewport resized by devtools
  // does not always dispatch a resize event. So re-measure on every signal that
  // the box may have moved.
  function syncHeight(bar) {
    function apply() {
      var height = Math.ceil(bar.getBoundingClientRect().height) || 56;
      document.documentElement.style.setProperty('--school-nav-h', height + 'px');
    }

    apply();

    // Held in a variable so the observer cannot be collected while observing.
    if (window.ResizeObserver) {
      heightObserver = new ResizeObserver(apply);
      heightObserver.observe(bar);
    }

    window.addEventListener('resize', apply);
    window.addEventListener('orientationchange', apply);
    window.addEventListener('load', apply);

    // The breakpoints where the bar changes row count. Media-query changes are
    // delivered independently of the rendering loop, so they still arrive when
    // ResizeObserver callbacks do not — a background tab, or a viewport resized
    // through devtools, can starve both rAF and RO while media queries survive.
    if (window.matchMedia) {
      LAYOUT_QUERIES.forEach(function (query) {
        var mql = window.matchMedia(query);
        if (mql.addEventListener) mql.addEventListener('change', apply);
        else if (mql.addListener) mql.addListener(apply);
      });
    }

    if (document.fonts && document.fonts.ready && document.fonts.ready.then) {
      document.fonts.ready.then(apply);
    }

    // None of the notifications above is guaranteed, so the offset also heals
    // itself during ordinary reading: a stale value shows up as content tucked
    // under the bar while scrolling, and scroll is the one signal that always
    // arrives. Throttled by timestamp rather than rAF, which can be starved.
    var lastCheck = 0;
    window.addEventListener('scroll', function () {
      var now = Date.now();
      if (now - lastCheck < 250) return;
      lastCheck = now;
      apply();
    }, { passive: true });

    setTimeout(apply, 300);
    setTimeout(apply, 1200);
  }

  // ------------------------------------------------------------------- init

  function initSchoolNav() {
    if (document.getElementById('school-nav-bar')) return;

    if (!document.querySelector('link[href*="school-nav.css"]')) {
      var stylesheet = document.createElement('link');
      stylesheet.rel = 'stylesheet';
      stylesheet.href = 'school-nav.css';
      document.head.appendChild(stylesheet);
    }

    var target = resolveReturn();
    document.documentElement.setAttribute('data-school-theme', resolveTheme(target.theme));

    var current = currentFile();
    var position = indexOfFile(current);

    var nav = el('nav', 'school-nav-bar');
    nav.id = 'school-nav-bar';
    nav.setAttribute('aria-label', 'School e-portfolio');

    var back = el('a', 'school-nav-back-btn');
    back.href = target.href;
    back.setAttribute('aria-label', 'Return to the main EAE portfolio');
    back.appendChild(el('span', 'school-nav-back-glyph', '←'));
    back.appendChild(el('span', 'school-nav-back-label', 'Main portfolio'));
    wireLeaveTransition(back);

    var title = el('span', 'school-nav-title', 'School E-Portfolio');

    var actions = el('div', 'school-nav-actions');
    actions.appendChild(buildStep(position > 0 ? PAGES[position - 1] : null, 'prev'));
    actions.appendChild(buildStep(position > -1 && position < PAGES.length - 1 ? PAGES[position + 1] : null, 'next'));

    var menuButton = el('button', 'school-nav-menu-btn');
    menuButton.type = 'button';
    menuButton.setAttribute('aria-expanded', 'false');
    menuButton.setAttribute('aria-controls', 'school-nav-menu');
    menuButton.setAttribute('aria-haspopup', 'true');
    menuButton.appendChild(el('span', 'school-nav-menu-glyph', '☰'));
    menuButton.appendChild(el('span', 'school-nav-menu-label', 'Pages'));
    actions.appendChild(menuButton);

    var menu = buildMenu(current);

    nav.appendChild(back);
    nav.appendChild(title);
    nav.appendChild(buildCrumbs(current));
    nav.appendChild(actions);
    nav.appendChild(menu);

    if (document.body) {
      document.body.insertBefore(nav, document.body.firstChild);
      wireMenu(menuButton, menu);
      syncHeight(nav);
      requestAnimationFrame(function () {
        nav.classList.add('is-ready');
      });
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initSchoolNav);
  } else {
    initSchoolNav();
  }
})();
