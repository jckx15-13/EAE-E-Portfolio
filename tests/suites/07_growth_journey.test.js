/**
 * Technical Growth Journey suite.
 *
 * Covers the features added when the journey chapters ("A Map of Me") and the
 * Reflection Journal were moved into the timeline view, the timeline was rebuilt
 * as a vertical git-tree graph, the trailing focus-areas strip was removed, and
 * the school e-portfolio switch was made round-trip.
 */
async function runGrowthJourneyTests(harness) {
  harness.setSuite('Technical Growth Journey & Portfolio Switching');
  console.log(`\n--- Running Suite: Technical Growth Journey & Portfolio Switching ---`);

  // Test 1: chapters + reflections now live inside #timeline, and the trailing
  // "Who I Am / What Shaped Me / ..." strip is gone.
  const t1 = Date.now();
  try {
    const res = await harness.evaluate(`(() => {
      const timeline = document.querySelector('#timeline');
      if (!timeline) throw new Error('#timeline section is missing');

      const chapters = timeline.querySelectorAll('#journeyChapters .journey-tag-card');
      const expected = (window.PORTFOLIO_DATA.personalMap.cards || []).length;
      if (chapters.length !== expected) {
        throw new Error('Expected ' + expected + ' journey chapters inside #timeline, found ' + chapters.length);
      }

      const firstIndex = chapters[0].querySelector('.journey-tag-index');
      if (!firstIndex || firstIndex.textContent.trim() !== '01') {
        throw new Error('Journey chapters are not numbered from 01');
      }
      if (!chapters[0].textContent.includes('First spark')) {
        throw new Error('First chapter is not the "First spark" card');
      }

      const reflections = document.querySelector('#reflections');
      if (!reflections) throw new Error('#reflections section is missing');
      if (!timeline.contains(reflections)) {
        throw new Error('Reflection Journal is not nested inside the timeline view');
      }
      const expectedNotes = (window.PORTFOLIO_DATA.reflections || []).length;
      const index = reflections.querySelectorAll('.git-note-index-row');
      if (index.length !== expectedNotes) {
        throw new Error('Expected ' + expectedNotes + ' entries in the note index, found ' + index.length);
      }

      if (document.querySelector('#personalMapCards')) {
        throw new Error('Journey chapters still render in their old Philosophy container');
      }
      if (document.querySelector('#focusAreas') || document.querySelector('.focus-item')) {
        throw new Error('The trailing focus-areas strip was not removed');
      }
      return 'SUCCESS';
    })()`);

    harness.assertEqual(res, 'SUCCESS', 'Journey chapters and reflections moved into timeline');
    harness.logPass('Journey chapters (01-06) and Reflection Journal render inside the timeline view; focus-areas strip removed', Date.now() - t1);
  } catch (err) {
    harness.logFail('Journey chapters and Reflection Journal relocation', err);
  }

  // Test 2: the timeline is a git tree — one commit node per experience, one edge
  // per parent link, merge edges for converging paths, tags for the chapters.
  const t2 = Date.now();
  try {
    const res = await harness.evaluate(`(() => {
      const repo = document.querySelector('#achievementTimeline.git-learning-repo');
      if (!repo) throw new Error('Timeline did not render as a git learning repository');

      const rows = repo.querySelectorAll('.git-commit-row');
      if (rows.length < 2) throw new Error('Expected multiple commit rows, found ' + rows.length);

      const layer = repo.querySelector('.git-graph-layer');
      if (!layer) throw new Error('Continuous graph layer .git-graph-layer is missing');

      const nodes = layer.querySelectorAll('circle.git-commit-node');
      if (nodes.length !== rows.length) {
        throw new Error('Commit nodes (' + nodes.length + ') do not match commit rows (' + rows.length + ')');
      }

      const edges = layer.querySelectorAll('path.git-parent-line');
      if (edges.length !== rows.length - 1) {
        throw new Error('Expected ' + (rows.length - 1) + ' parent edges, found ' + edges.length);
      }
      if (!layer.querySelectorAll('path.git-merge-line').length) {
        throw new Error('No merge edges drawn for converging branches');
      }

      const tags = layer.querySelectorAll('path.git-tag-marker');
      const expectedTags = (window.PORTFOLIO_DATA.personalMap.cards || []).length;
      if (tags.length !== expectedTags) {
        throw new Error('Expected ' + expectedTags + ' tag markers on the graph, found ' + tags.length);
      }

      // main must be present and named as the life branch.
      const legend = Array.from(repo.querySelectorAll('.git-legend-pill')).map(p => p.textContent);
      if (!legend.some(label => /^main\\b/.test(label) && /life/i.test(label))) {
        throw new Error('main branch is not presented as the life branch: ' + JSON.stringify(legend));
      }
      return 'SUCCESS';
    })()`);

    harness.assertEqual(res, 'SUCCESS', 'Git tree graph structure');
    harness.logPass('Timeline renders as a vertical git tree: main is the life branch, commits are experiences, chapters are tags', Date.now() - t2);
  } catch (err) {
    harness.logFail('Git tree graph structure', err);
  }

  // Test 3: the graph is genuinely continuous — every edge starts on its parent's
  // node and ends on its child's node, and the layer spans all rows.
  const t3 = Date.now();
  try {
    const res = await harness.evaluate(`(() => {
      const repo = document.querySelector('#achievementTimeline.git-learning-repo');
      const body = repo.querySelector('.git-repo-body');
      const layer = repo.querySelector('.git-graph-layer');

      const layerHeight = parseFloat(layer.style.height);
      if (!(layerHeight > 0) || Math.abs(layerHeight - body.offsetHeight) > 2) {
        throw new Error('Graph layer height ' + layerHeight + ' does not span the ' + body.offsetHeight + 'px commit list');
      }

      const nodes = Array.from(layer.querySelectorAll('circle.git-commit-node'))
        .map(c => ({ x: +c.getAttribute('cx'), y: +c.getAttribute('cy') }));
      const onNode = (x, y) => nodes.some(n => Math.abs(n.x - x) < 0.6 && Math.abs(n.y - y) < 0.6);

      const edges = Array.from(layer.querySelectorAll('path.git-parent-line, path.git-merge-line'));
      if (!edges.length) throw new Error('No edges drawn');

      edges.forEach(edge => {
        const d = edge.getAttribute('d');
        const start = d.match(/^M\\s+([-\\d.]+)\\s+([-\\d.]+)/);
        const end = d.match(/([-\\d.]+)\\s+([-\\d.]+)\\s*$/);
        if (!start || !end) throw new Error('Unparseable edge path: ' + d);
        if (!onNode(+start[1], +start[2])) {
          throw new Error('Edge does not start on a commit node: ' + d);
        }
        if (!onNode(+end[1], +end[2])) {
          throw new Error('Edge does not end on a commit node: ' + d);
        }
      });

      // Every row must have a graph node aligned within its vertical span.
      const rows = Array.from(body.querySelectorAll('.git-commit-row'));
      rows.forEach(row => {
        const top = row.offsetTop;
        const bottom = top + row.offsetHeight;
        if (!nodes.some(n => n.y >= top - 1 && n.y <= bottom + 1)) {
          throw new Error('No graph node aligned with row ' + row.dataset.commitId);
        }
      });
      return 'SUCCESS';
    })()`);

    harness.assertEqual(res, 'SUCCESS', 'Graph line continuity');
    harness.logPass('Graph edges are continuous: every branch line starts and ends on a commit node aligned with its row', Date.now() - t3);
  } catch (err) {
    harness.logFail('Graph line continuity', err);
  }

  // Test 3b: reflections are integrated into the graph as git notes attached to
  // the commit they are about, not repeated as a separate list of cards.
  const t3b = Date.now();
  try {
    const res = await harness.evaluate(`(async () => {
      const reflections = window.PORTFOLIO_DATA.reflections || [];
      const attached = Array.from(document.querySelectorAll('.git-note-attached'));
      if (attached.length !== reflections.length) {
        throw new Error('Expected ' + reflections.length + ' notes attached to commits, found ' + attached.length);
      }

      attached.forEach(note => {
        const card = note.closest('.git-commit-card');
        if (!card) throw new Error('A note is not attached to a commit card');
        if (!card.closest('.git-commit-row')) throw new Error('A note is outside the commit graph');
        if (!note.querySelector('.git-note-title') || !note.querySelector('.git-note-body')) {
          throw new Error('Attached note is missing its title or body');
        }
        if (!/^Notes:/.test(note.querySelector('.git-note-command').textContent)) {
          throw new Error('Attached note is not labelled the way git log --notes prints it');
        }
      });

      // Every reflection body must appear exactly once on the page.
      reflections.forEach(r => {
        const matches = Array.from(document.querySelectorAll('.git-note-body, .git-note-index-row'))
          .filter(el => el.textContent.includes(r.body.slice(0, 40)));
        if (matches.length !== 1) {
          throw new Error('Reflection "' + r.title + '" body appears ' + matches.length + ' times, expected exactly 1');
        }
      });

      // The index entry must resolve to the same commit its note hangs off.
      const row = document.querySelector('.git-note-index-row[data-note-on]');
      const commitId = row.dataset.noteOn;
      const targetCard = document.querySelector('.git-commit-row[data-commit-id="' + commitId + '"] .git-note-attached');
      if (!targetCard) throw new Error('Index entry points at a commit with no attached note: ' + commitId);
      const indexTitle = row.querySelector('.git-note-index-title').textContent.trim();
      if (targetCard.querySelector('.git-note-title').textContent.trim() !== indexTitle) {
        throw new Error('Index entry and attached note disagree for ' + commitId);
      }

      row.click();
      await new Promise(r => setTimeout(r, 150));
      const commitRow = document.querySelector('.git-commit-row[data-commit-id="' + commitId + '"]');
      if (!commitRow.classList.contains('is-highlighted')) {
        throw new Error('Clicking a note index entry did not highlight its commit');
      }
      return 'SUCCESS';
    })()`);

    harness.assertEqual(res, 'SUCCESS', 'Reflections integrated as git notes');
    harness.logPass('Reflection Journal is integrated into the graph as git notes attached to their commits, indexed without duplication', Date.now() - t3b);
  } catch (err) {
    harness.logFail('Reflections integrated as git notes', err);
  }

  // Test 4: a chapter can reveal the commit it annotates.
  const t4 = Date.now();
  try {
    const res = await harness.evaluate(`(async () => {
      const card = document.querySelector('.journey-tag-card[data-anchor-commit]');
      if (!card) throw new Error('No journey chapter carries an anchor commit');
      const anchor = card.dataset.anchorCommit;

      const row = document.querySelector('.git-commit-row[data-commit-id="' + anchor + '"]');
      if (!row) throw new Error('Anchor commit ' + anchor + ' has no row in the graph');

      const tagPill = row.querySelector('.git-tag-pill');
      if (!tagPill) throw new Error('Anchored commit is not decorated with a tag pill');

      const jump = card.querySelector('.journey-tag-jump');
      if (!jump) throw new Error('Chapter is missing its "Show commit in graph" control');
      jump.click();
      await new Promise(r => setTimeout(r, 100));

      if (!row.classList.contains('is-highlighted')) {
        throw new Error('Clicking the chapter did not highlight its commit row');
      }
      return 'SUCCESS';
    })()`);

    harness.assertEqual(res, 'SUCCESS', 'Chapter to commit navigation');
    harness.logPass('Each chapter decorates and reveals the commit it annotates', Date.now() - t4);
  } catch (err) {
    harness.logFail('Chapter to commit navigation', err);
  }

  // Test 5: leaving for the school e-portfolio records where to come back to.
  const t5 = Date.now();
  try {
    const res = await harness.evaluate(`(() => {
      localStorage.removeItem('eaePortfolioReturn');

      const btn = document.querySelector('#schoolPortfolioBtn');
      if (!btn) throw new Error('School e-portfolio button is missing from the header');
      if (!btn.getAttribute('href').includes('DRAFT/Home.html')) {
        throw new Error('School e-portfolio button does not point at the school portfolio');
      }

      document.querySelector('#timeline').scrollIntoView();
      // Record the return state without actually navigating away.
      const event = new MouseEvent('click', { bubbles: true, cancelable: true });
      event.preventDefault();
      btn.dispatchEvent(event);

      const saved = JSON.parse(localStorage.getItem('eaePortfolioReturn') || 'null');
      if (!saved) throw new Error('Leaving for the school portfolio did not record a return point');
      if (!/^#[A-Za-z][\\w-]*$/.test(saved.hash || '')) {
        throw new Error('Recorded return hash is not a section anchor: ' + saved.hash);
      }
      if (!saved.theme || typeof saved.savedAt !== 'number') {
        throw new Error('Return state is missing the theme or timestamp');
      }
      return 'SUCCESS';
    })()`, false);

    harness.assertEqual(res, 'SUCCESS', 'School portfolio round trip');
    harness.logPass('Switching to the school e-portfolio records the section and theme to return to', Date.now() - t5);
  } catch (err) {
    harness.logFail('School portfolio round trip', err);
  }

  // Test 6: the school pages send you back to the main portfolio.
  const t6 = Date.now();
  try {
    await harness.createTab('/DRAFT/Home.html');
    const res = await harness.evaluate(`(() => {
      const bar = document.querySelector('#school-nav-bar');
      if (!bar) throw new Error('School navigation bar was not injected');

      const back = bar.querySelector('.school-nav-back-btn');
      if (!back) throw new Error('Return-to-portfolio button is missing');
      if (!back.getAttribute('href').includes('index.html')) {
        throw new Error('Return button does not point back at the main portfolio: ' + back.getAttribute('href'));
      }
      if (!bar.querySelector('.school-nav-page')) {
        throw new Error('School navigation bar does not show the current page');
      }
      if (!document.documentElement.getAttribute('data-school-theme')) {
        throw new Error('School page did not adopt a theme from the main portfolio');
      }
      return 'SUCCESS';
    })()`);

    harness.assertEqual(res, 'SUCCESS', 'School portfolio return navigation');
    harness.logPass('School e-portfolio pages carry a themed return path back to the main portfolio', Date.now() - t6);
  } catch (err) {
    harness.logFail('School portfolio return navigation', err);
  } finally {
    // Restore the admin tab the remaining checks expect.
    await harness.createTab('/?admin=true');
  }

  // Test 7: the no-code editor is grouped into collapsible task panels.
  const t7 = Date.now();
  try {
    const res = await harness.evaluate(`(async () => {
      const fab = document.querySelector('.live-editor-fab');
      if (!fab) throw new Error('Live editor FAB is missing');
      fab.click();
      await new Promise(r => setTimeout(r, 250));

      const sidebar = document.querySelector('.live-editor-sidebar.is-open');
      if (!sidebar) throw new Error('Live editor sidebar did not open');

      const titles = Array.from(sidebar.querySelectorAll('details.editor-panel > summary'))
        .map(s => s.textContent.trim());
      ['Content', 'Layout', 'Design', 'Assets', 'Versions & publish'].forEach(name => {
        if (!titles.includes(name)) {
          throw new Error('Editor panel "' + name + '" is missing. Found: ' + JSON.stringify(titles));
        }
      });

      // The controls the editor contract depends on must survive the regrouping.
      ['#toggleEditModeBtn', '#toggleReorderModeBtn', '.template-select', '.asset-list', '.versions-list', '.switch-slider']
        .forEach(sel => {
          if (!sidebar.querySelector(sel)) throw new Error('Editor control ' + sel + ' went missing');
        });

      const jumps = Array.from(sidebar.querySelectorAll('.quick-jump-btn')).map(b => b.textContent.trim());
      ['Technical journey', 'Reflection journal'].forEach(label => {
        if (!jumps.includes(label)) {
          throw new Error('Quick jump "' + label + '" is missing. Found: ' + JSON.stringify(jumps));
        }
      });

      // The switch must actually be styled now, not a bare checkbox.
      const slider = sidebar.querySelector('.switch-slider');
      if (getComputedStyle(slider).borderRadius === '0px') {
        throw new Error('Editor switch is unstyled');
      }

      sidebar.querySelector('.sidebar-close-btn').click();
      await new Promise(r => setTimeout(r, 250));
      if (document.querySelector('.live-editor-sidebar.is-open')) {
        throw new Error('Editor sidebar did not close');
      }
      return 'SUCCESS';
    })()`);

    harness.assertEqual(res, 'SUCCESS', 'No-code editor grouping');
    harness.logPass('No-code editor groups its controls into collapsible panels without losing any control', Date.now() - t7);
  } catch (err) {
    harness.logFail('No-code editor grouping', err);
  }

  // Test 8: the journey survives a narrow viewport without horizontal overflow.
  const t8 = Date.now();
  try {
    await harness.setViewport(375, 812);
    await new Promise(r => setTimeout(r, 500));
    const res = await harness.evaluate(`(() => {
      if (document.documentElement.scrollWidth > window.innerWidth + 1) {
        throw new Error('Horizontal overflow at 375px: ' + document.documentElement.scrollWidth);
      }
      const repo = document.querySelector('#achievementTimeline.git-learning-repo');
      const body = repo.querySelector('.git-repo-body');
      const column = parseFloat(getComputedStyle(body).getPropertyValue('--git-graph-col'));
      if (!(column > 0) || column > 120) {
        throw new Error('Graph column did not narrow for mobile: ' + column);
      }
      const nodes = Array.from(repo.querySelectorAll('.git-graph-layer circle.git-commit-node'));
      if (!nodes.length) throw new Error('Graph nodes disappeared on mobile');
      nodes.forEach(n => {
        if (+n.getAttribute('cx') > column) {
          throw new Error('A commit node sits outside the narrowed graph column');
        }
      });
      return 'SUCCESS';
    })()`);

    harness.assertEqual(res, 'SUCCESS', 'Mobile growth journey layout');
    harness.logPass('Growth journey graph reflows into the narrow mobile column with no horizontal overflow', Date.now() - t8);
  } catch (err) {
    harness.logFail('Mobile growth journey layout', err);
  } finally {
    await harness.setViewport(1280, 800);
  }
}

module.exports = runGrowthJourneyTests;
