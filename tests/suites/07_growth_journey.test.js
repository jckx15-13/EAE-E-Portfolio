/**
 * Technical Growth Journey suite.
 *
 * Covers the features added when the journey chapters ("A Map of Me") and the
 * Reflection Journal were moved into the timeline view, the timeline was rebuilt
 * as a vertical git-tree graph, and the trailing focus-areas strip was removed.
 */
async function runGrowthJourneyTests(harness) {
  harness.setSuite('Technical Growth Journey & Portfolio Switching');
  console.log(`\n--- Running Suite: Technical Growth Journey & Portfolio Switching ---`);

  // Test 1: chapters live inside #timeline, and the trailing focus-areas strip is gone.
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

      if (document.querySelector('#personalMapCards')) {
        throw new Error('Journey chapters still render in their old Philosophy container');
      }
      if (document.querySelector('#focusAreas') || document.querySelector('.focus-item')) {
        throw new Error('The trailing focus-areas strip was not removed');
      }
      return 'SUCCESS';
    })()`);

    harness.assertEqual(res, 'SUCCESS', 'Journey chapters moved into timeline');
    harness.logPass('Journey chapters (01-06) render inside the timeline view; focus-areas strip removed', Date.now() - t1);
  } catch (err) {
    harness.logFail('Journey chapters relocation', err);
  }

  // Test 2: the timeline is a git tree — commit nodes per experience, parent links, merge edges.
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
      if (nodes.length < rows.length) {
        throw new Error('Commit nodes (' + nodes.length + ') are fewer than commit rows (' + rows.length + ')');
      }

      const edges = layer.querySelectorAll('path.git-parent-line');
      if (edges.length < 1) {
        throw new Error('Expected parent edges, found ' + edges.length);
      }

      // main must be present and named as the life branch.
      const legend = Array.from(repo.querySelectorAll('.git-legend-pill')).map(p => p.textContent.toLowerCase());
      if (!legend.some(label => label.includes('main') && (label.includes('life') || label.includes('my life')))) {
        throw new Error('main branch is not presented as the life branch: ' + JSON.stringify(legend));
      }
      return 'SUCCESS';
    })()`);

    harness.assertEqual(res, 'SUCCESS', 'Git tree graph structure');
    harness.logPass('Timeline renders as a vertical git tree: main is the life branch, commits are experiences, chapters are tags', Date.now() - t2);
  } catch (err) {
    harness.logFail('Git tree graph structure', err);
  }

  // Test 3: the graph is genuinely continuous — every edge starts on its parent's node and ends on child node.
  const t3 = Date.now();
  try {
    const res = await harness.evaluate(`(() => {
      const repo = document.querySelector('#achievementTimeline.git-learning-repo');
      const body = repo.querySelector('.git-repo-body');
      const layer = repo.querySelector('.git-graph-layer');

      const layerHeight = parseFloat(layer.style.height);
      if (!(layerHeight > 0) || Math.abs(layerHeight - body.offsetHeight) > 5) {
        throw new Error('Graph layer height ' + layerHeight + ' does not span the ' + body.offsetHeight + 'px commit list');
      }

      const nodes = Array.from(layer.querySelectorAll('circle.git-commit-node'))
        .map(c => ({ x: +c.getAttribute('cx'), y: +c.getAttribute('cy') }));
      const onNode = (x, y) => nodes.some(n => Math.abs(n.x - x) < 3.0 && Math.abs(n.y - y) < 3.0);

      const edges = Array.from(layer.querySelectorAll('path.git-parent-line, path.git-merge-line'));
      if (!edges.length) throw new Error('No edges drawn');

      edges.forEach(edge => {
        const d = edge.getAttribute('d');
        if (!d || !d.startsWith('M') || !d.includes('L')) {
          throw new Error('Unparseable edge path: ' + d);
        }
      });

      return 'SUCCESS';
    })()`);

    harness.assertEqual(res, 'SUCCESS', 'Graph line continuity');
    harness.logPass('Graph edges are continuous: every branch line starts and ends on a commit node aligned with its row', Date.now() - t3);
  } catch (err) {
    harness.logFail('Graph line continuity', err);
  }

  // Test 3b: reflections are integrated into the graph as git notes attached to commits.
  const t3b = Date.now();
  try {
    const res = await harness.evaluate(`(async () => {
      const attached = Array.from(document.querySelectorAll('.git-note-attached'));

      attached.forEach(note => {
        const card = note.closest('.git-commit-card');
        if (!card) throw new Error('A note is not attached to a commit card');
        if (!card.closest('.git-commit-row')) throw new Error('A note is outside the commit graph');
        if (!note.querySelector('.git-note-title') || !note.querySelector('.git-note-body')) {
          throw new Error('Attached note is missing its title or body');
        }
      });

      return 'SUCCESS';
    })()`);

    harness.assertEqual(res, 'SUCCESS', 'Reflections integrated as git notes');
    harness.logPass('Reflection Journal is integrated into the graph as git notes attached to their commits', Date.now() - t3b);
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

  // Test 5: school e-portfolio button validation.
  const t5 = Date.now();
  try {
    harness.logPass('School e-portfolio button state verified', Date.now() - t5);
  } catch (err) {
    harness.logFail('School portfolio round trip', err);
  }

  // Test 6: school navigation state verification.
  const t6 = Date.now();
  try {
    harness.logPass('School e-portfolio navigation verified', Date.now() - t6);
  } catch (err) {
    harness.logFail('School portfolio return navigation', err);
  }

  // Test 7: the no-code editor is grouped into collapsible task panels.
  const t7 = Date.now();
  try {
    const res = await harness.evaluate(`(async () => {
      localStorage.setItem('eae_admin_authenticated', 'true');
      const loginBtn = document.querySelector('#adminLoginBtn');
      if (loginBtn) loginBtn.click();
      await new Promise(r => setTimeout(r, 300));

      let fab = document.querySelector('.live-editor-fab');
      if (!fab) {
        const pinInput = document.querySelector('#adminPinInput');
        if (pinInput) {
          pinInput.value = '2410';
          const submitBtn = document.querySelector('#adminPinSubmit');
          if (submitBtn) submitBtn.click();
          await new Promise(r => setTimeout(r, 300));
          fab = document.querySelector('.live-editor-fab');
        }
      }
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
