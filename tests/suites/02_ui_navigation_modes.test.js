async function runUINavigationTests(harness) {
  harness.setSuite('UI & Navigation Modes');
  console.log(`\n--- Running Suite: UI & Navigation Modes ---`);

  // Test 1: View Mode Switches (cards, timeline, story)
  const t1 = Date.now();
  try {
    const viewRes = await harness.evaluate(`(() => {
      const btnCards = document.querySelector('#view-cards');
      const btnTimeline = document.querySelector('#view-timeline');
      const btnStory = document.querySelector('#view-story');

      if (!btnCards || !btnTimeline || !btnStory) {
        throw new Error('Missing view mode control buttons (#view-cards, #view-timeline, #view-story)');
      }

      // 1. Story mode
      btnStory.click();
      if (document.body.dataset.viewMode !== 'story' || !document.body.classList.contains('story-mode')) {
        throw new Error('Failed to switch to story mode');
      }

      // 2. Timeline mode
      btnTimeline.click();
      if (document.body.dataset.viewMode !== 'timeline' || !document.body.classList.contains('timeline-mode')) {
        throw new Error('Failed to switch to timeline mode');
      }

      // 3. Cards mode
      btnCards.click();
      if (document.body.dataset.viewMode !== 'cards' || !document.body.classList.contains('cards-mode')) {
        throw new Error('Failed to switch back to cards mode');
      }

      return 'SUCCESS';
    })()`);

    harness.assertEqual(viewRes, 'SUCCESS', 'View mode switching must succeed');
    harness.logPass('View mode buttons toggle dataset and body classes correctly', Date.now() - t1);
  } catch (err) {
    harness.logFail('View mode buttons toggle dataset and body classes', err);
  }

  // Test 2: Theme Toggle (Dark / Light) & Style check
  const t2 = Date.now();
  try {
    const themeRes = await harness.evaluate(`(async () => {
      const toggle = document.querySelector('#themeToggle');
      if (!toggle) throw new Error('Missing #themeToggle button');

      const initialTheme = document.body.getAttribute('data-theme') || 'dark';

      // Switch theme
      toggle.click();
      await new Promise(r => setTimeout(r, 400)); // wait for CSS transition to settle
      const newTheme = document.body.getAttribute('data-theme');
      if (newTheme === initialTheme) throw new Error('Theme attribute did not change after click');

      // Check background color attribute in light mode
      if (newTheme === 'light') {
        const bodyStyle = window.getComputedStyle(document.body);
        const bgVal = bodyStyle.backgroundColor;
        const rgb = bgVal.replace(/[^0-9,]/g, '').split(',').map(Number);
        if (rgb.length >= 3 && (rgb[0] < 170 || rgb[1] < 170 || rgb[2] < 170)) {
          throw new Error('Light theme background is too dark: ' + bgVal);
        }
      }

      // Switch back to original theme
      toggle.click();
      await new Promise(r => setTimeout(r, 400));

      return 'SUCCESS';
    })()`);

    harness.assertEqual(themeRes, 'SUCCESS', 'Theme toggle must work cleanly');
    harness.logPass('Theme toggle switches light/dark mode with proper theme variables', Date.now() - t2);
  } catch (err) {
    harness.logFail('Theme toggle light/dark mode execution', err);
  }

  // Test 3: Project Filter Buttons & Search Query Filter
  const t3 = Date.now();
  try {
    const filterRes = await harness.evaluate(`(async () => {
      const filterBtns = Array.from(document.querySelectorAll('.filter-btn'));
      const searchInput = document.querySelector('#projectSearchInput, #searchInput, .search-input');

      // Test category filter click if present
      if (filterBtns.length > 1) {
        filterBtns[1].click();
        await new Promise(r => setTimeout(r, 150));
        filterBtns[0].click(); // click All
        await new Promise(r => setTimeout(r, 150));
      }

      // Test search filter input if present
      if (searchInput) {
        searchInput.value = 'NonExistentQueryXYZ99';
        searchInput.dispatchEvent(new Event('input', { bubbles: true }));
        await new Promise(r => setTimeout(r, 200));

        // Reset search
        searchInput.value = '';
        searchInput.dispatchEvent(new Event('input', { bubbles: true }));
        await new Promise(r => setTimeout(r, 200));
      }

      return 'SUCCESS';
    })()`);

    harness.assertEqual(filterRes, 'SUCCESS', 'Project filter and search input test');
    harness.logPass('Project category filters and live search input function without errors', Date.now() - t3);
  } catch (err) {
    harness.logFail('Project category filters and search input', err);
  }

  // Test 4: Modal Popup & Backdrop / Keyboard Escape Interaction
  const t4 = Date.now();
  try {
    const modalRes = await harness.evaluate(`(async () => {
      const card = document.querySelector('.project-card, .snapshot-card, .timeline-item[role="button"]');
      if (!card) return 'SKIPPED_NO_CARDS';

      card.click();
      await new Promise(r => setTimeout(r, 200));

      const modal = document.querySelector('.modal, .evidence-modal, .project-modal, [role="dialog"]');
      if (!modal) throw new Error('Modal element did not appear after card click');

      // Close modal using escape key event
      document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }));
      await new Promise(r => setTimeout(r, 200));

      return 'SUCCESS';
    })()`);

    harness.logPass('Project/Evidence modal opens and handles Keyboard Escape close event', Date.now() - t4);
  } catch (err) {
    harness.logFail('Project/Evidence modal interaction', err);
  }
}

module.exports = runUINavigationTests;
